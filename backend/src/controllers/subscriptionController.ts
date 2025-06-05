import { Request, Response } from 'express';
import stripe, { Stripe } from '../utils/stripe';
import { db } from '../utils/db';
import dotenv from 'dotenv';

dotenv.config();

// Product mapping for our subscription tiers
const SUBSCRIPTION_PRODUCTS = {
  curious: 'prod_SQYojb6WgJRDVm',
  informed: 'prod_SQYpS7fOMik8EC',
  insider: 'prod_SQYpIjeHgFxuTW',
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const { tier } = req.body;
  
  if (!tier || !['curious', 'informed', 'insider'].includes(tier)) {
    res.status(400).json({ message: 'Valid subscription tier required (curious, informed, or insider)' });
    return;
  }

  try {
    // Create a customer in Stripe if they don't exist yet
    const [rows] = await db.query('SELECT stripe_customer_id FROM users WHERE id = ?', [req.user.id]);
    const user = (rows as any[])[0];
    
    let customerId = user?.stripe_customer_id;
    
    if (!customerId) {
      // Get user email and name from database
      const [userRows] = await db.query('SELECT email, name FROM users WHERE id = ?', [req.user.id]);
      const userData = (userRows as any[])[0];
      
      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name || undefined,
        metadata: {
          userId: req.user.id.toString()
        }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.query('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, req.user.id]);
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product: SUBSCRIPTION_PRODUCTS[tier as keyof typeof SUBSCRIPTION_PRODUCTS],
            recurring: {
              interval: 'month',
            },
            unit_amount: tier === 'curious' ? 10000 : (tier === 'informed' ? 20000 : 30000),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/cancel`,
      metadata: {
        userId: req.user.id.toString(),
        tier,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    console.log('Webhook signature missing');
    res.status(400).json({ message: 'Stripe signature missing' });
    return;
  }

  try {
    console.log('Raw webhook body received:', req.body.toString());
    
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log('Webhook event processed:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        
        if (userId && tier && session.subscription) {
          const subscriptionId = session.subscription.toString();
          
          const validUntil = new Date();
          validUntil.setMonth(validUntil.getMonth() + 1);
          
          await db.query(
            'UPDATE users SET subscription_level = ?, subscription_status = ? WHERE id = ?', 
            [tier, 'active', userId]
          );
          
          const [existingSubscription] = await db.query(
            'SELECT id FROM subscriptions WHERE user_id = ? AND stripe_subscription_id = ?', 
            [userId, subscriptionId]
          );
          
          if ((existingSubscription as any[]).length === 0) {
            await db.query(
              'INSERT INTO subscriptions (user_id, stripe_subscription_id, level, status, valid_until) VALUES (?, ?, ?, ?, ?)', 
              [userId, subscriptionId, tier, 'active', validUntil]
            );
          } else {
            await db.query(
              'UPDATE subscriptions SET level = ?, status = ?, valid_until = ? WHERE user_id = ? AND stripe_subscription_id = ?', 
              [tier, 'active', validUntil, userId, subscriptionId]
            );
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const [rows] = await db.query(
          'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?', 
          [subscription.id]
        );
        const subData = (rows as any[])[0];
        
        if (subData) {
          const userId = subData.user_id;
          const status = subscription.status === 'active' ? 'active' : 'inactive';
          
          await db.query(
            'UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?', 
            [status, subscription.id]
          );
          
          await db.query(
            'UPDATE users SET subscription_status = ? WHERE id = ?', 
            [status, userId]
          );
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const [rows] = await db.query(
          'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?', 
          [subscription.id]
        );
        const subData = (rows as any[])[0];
        
        if (subData) {
          const userId = subData.user_id;
          
          await db.query(
            'UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?', 
            ['cancelled', subscription.id]
          );
          
          await db.query(
            'UPDATE users SET subscription_level = ?, subscription_status = ? WHERE id = ?', 
            ['not_subscribed', 'inactive', userId]
          );
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

export const getUserSubscription = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const [rows] = await db.query(
      `SELECT 
        u.subscription_level, 
        u.subscription_status,
        s.stripe_subscription_id,
        s.level as subscription_tier,
        s.status as subscription_status,
        s.valid_until
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       WHERE u.id = ?`, 
      [req.user.id]
    );
    
    const user = (rows as any[])[0];
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      tier: user.subscription_tier || user.subscription_level,
      status: user.subscription_status || 'inactive',
      subscriptionId: user.stripe_subscription_id,
      validUntil: user.valid_until || null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to get subscription information' });
  }
};

export const verifySession = async (req: Request, res: Response): Promise<void> => {
  const { session_id } = req.query;
  
  if (!session_id || !req.user) {
    res.status(400).json({ message: 'Missing session ID or user not authenticated' });
    return;
  }
  
  try {
    console.log('Verifying session:', session_id);
    
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    console.log('Session retrieved:', session.id, 'Status:', session.status);
    
    const tier = session.metadata?.tier;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription?.toString();
    
    if (tier && userId && subscriptionId) {
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 1);
      
      console.log('Updating subscription for user:', userId, 'Tier:', tier);
      
      await db.query(
        'UPDATE users SET subscription_level = ?, subscription_status = ?, stripe_subscription_id = ? WHERE id = ?', 
        [tier, 'active', subscriptionId, userId]
      );
      
      const [existingSubscription] = await db.query(
        'SELECT id FROM subscriptions WHERE user_id = ? AND stripe_subscription_id = ?', 
        [userId, subscriptionId]
      );
      
      if ((existingSubscription as any[]).length === 0) {
        await db.query(
          'INSERT INTO subscriptions (user_id, stripe_subscription_id, level, status, valid_until) VALUES (?, ?, ?, ?, ?)', 
          [userId, subscriptionId, tier, 'active', validUntil]
        );
      } else {
        await db.query(
          'UPDATE subscriptions SET level = ?, status = ?, valid_until = ? WHERE user_id = ? AND stripe_subscription_id = ?', 
          [tier, 'active', validUntil, userId, subscriptionId]
        );
      }
      
      res.json({ success: true, tier, status: 'active' });
    } else {
      res.status(400).json({ message: 'Invalid session data' });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ message: 'Failed to verify session' });
  }
};