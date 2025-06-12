import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { db } from '../utils/db';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  try {
    const eventType = event.type;
    const object = event.data.object as any;

    let customerId = object.customer;

    const [rows] = (await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [customerId]
    )) as [any[], any];
    if (!rows.length) {
      console.warn(
        `⚠ Payment failed, but user not found for customer: ${customerId}`
      );

      try {
        const customer = await stripe.customers.retrieve(customerId);
        console.log('Stripe customer info:', customer);
      } catch (stripeErr) {
        console.error('Stripe customer fetch failed:', stripeErr);
      }

      res.status(200).send('No matching user, skipping');
      return;
    }

    let userId = rows[0].id;

    // If not in DB, try getting userId from metadata
    if (!userId && customerId) {
      try {
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;
        if (customer.metadata && customer.metadata.userId) {
          userId = parseInt(customer.metadata.userId, 10);
          await db.query(
            'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
            [customerId, userId]
          );
          console.log(`✅ Linked customerId to user ${userId}`);
        }
      } catch (err) {
        console.error('⚠ Failed to retrieve customer metadata:', err);
      }
    }

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const tier =
          subscription.items.data[0].price.nickname?.toLowerCase() || 'free';

        if (userId) {
          await db.query(
            `UPDATE users SET 
              subscription_status = 'active',
              subscription_level = ?,
              stripe_customer_id = ?,
              stripe_subscription_id = ?
             WHERE id = ?`,
            [tier, customerId, subscriptionId, userId]
          );
          console.log('✅ Subscription activated for user:', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        if (userId) {
          await db.query(
            `UPDATE users SET subscription_status = 'failed' WHERE id = ?`,
            [userId]
          );
          console.log('❌ Payment failed for user:', userId);
        } else {
          console.warn(
            '⚠ Payment failed, but user not found for customer:',
            customerId
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        if (userId) {
          await db.query(
            `UPDATE users SET 
              subscription_status = 'cancelled',
              subscription_level = 'free'
             WHERE id = ?`,
            [userId]
          );
          console.log('🔁 Subscription cancelled for user:', userId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).send('Internal webhook handling error');
  }
};
