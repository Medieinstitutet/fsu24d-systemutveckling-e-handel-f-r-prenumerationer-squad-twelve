import { Request, Response } from 'express';
import stripe, { Stripe } from '../utils/stripe';
import { db } from '../utils/db';

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!endpointSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET in environment variables');
      res.status(500).send('Server configuration error');
      return;
    }

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    res.status(400).send(`Webhook Error: ${errorMessage}`);
    return;
  }

  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleSuccessfulPayment(invoice);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handleSuccessfulPayment(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription;

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer;

      const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
      const [userRows] = await db.query(
        'SELECT id FROM users WHERE stripe_customer_id = ?',
        [typeof customerId === 'string' ? customerId : customerId.id]
      );

      const users = userRows as any[];
      if (users.length > 0) {
        const userId = users[0].id;

        await db.query(
          'UPDATE subscriptions SET valid_until = ? WHERE user_id = ? AND stripe_subscription_id = ?',
          [currentPeriodEnd, userId, subscription.id]
        );

        console.log(`Updated subscription valid_until to ${currentPeriodEnd} for user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing subscription from invoice:', error);
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;

    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

    const [userRows] = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [typeof customerId === 'string' ? customerId : customerId.id]
    );

    const users = userRows as any[];
    if (users.length > 0) {
      const userId = users[0].id;

      if (status !== 'active' && status !== 'trialing') {
        await db.query(
          'UPDATE users SET subscription_status = ? WHERE id = ?',
          [status, userId]
        );
      }

      await db.query(
        'UPDATE subscriptions SET valid_until = ?, status = ? WHERE user_id = ? AND stripe_subscription_id = ?',
        [currentPeriodEnd, status, userId, subscription.id]
      );

      console.log(`Updated subscription for user ${userId} - Status: ${status}, Valid until: ${currentPeriodEnd}`);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
  try {
    const customerId = subscription.customer;

    const [userRows] = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [typeof customerId === 'string' ? customerId : customerId.id]
    );

    const users = userRows as any[];
    if (users.length > 0) {
      const userId = users[0].id;

      await db.query(
        'UPDATE users SET subscription_status = ? WHERE id = ?',
        ['cancelled', userId]
      );

      await db.query(
        'UPDATE subscriptions SET status = ? WHERE user_id = ? AND stripe_subscription_id = ?',
        ['cancelled', userId, subscription.id]
      );

      console.log(`Marked subscription as cancelled for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}