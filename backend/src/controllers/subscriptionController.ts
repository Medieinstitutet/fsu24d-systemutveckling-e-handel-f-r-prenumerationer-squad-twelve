import { Request, Response } from 'express';
import stripe, { Stripe } from '../utils/stripe';
import { db } from '../utils/db';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

interface ProductInfo {
  productId: string;
  priceId: string;
  interval: string;
  unitAmount: number;
  currency?: string;
}

let productsCache: Record<string, ProductInfo> | null = null;
let productsCacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

const getStripeProducts = async (): Promise<Record<string, ProductInfo>> => {
  if (productsCache && Date.now() < productsCacheExpiry) {
    return productsCache;
  }

  try {
    console.log('Fetching products and prices from Stripe...');
    
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price']
    });

    console.log(`Found ${products.data.length} active products in Stripe`);
    
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ['data.product']
    });
    
    console.log(`Found ${prices.data.length} active prices in Stripe`);

    const productMap: Record<string, ProductInfo> = {};
    
    const productTiers: Record<string, string> = {};
    
    let defaultCurrency = 'sek';
    let defaultInterval = 'month';
    
    for (const product of products.data) {
      if (!product.active) {
        console.log(`Skipping inactive product: ${product.id}`);
        continue;
      }
      
      console.log(`Processing product: ${product.id}, name: ${product.name}`);
      console.log(`Product metadata: ${JSON.stringify(product.metadata)}`);
      
      let tier = product.metadata.tier;
      
      if (!tier) {
        const name = (product.name || '').toLowerCase();
        
        if (name.includes('free') || name.includes('basic')) {
          console.log(`Skipping free tier product: ${product.id}`);
          continue;
        } 
        else if (name.includes('curious') || name === 'the curious') {
          tier = 'curious';
          console.log(`Inferred tier 'curious' from product name: ${product.name}`);
        } else if (name.includes('informed') || name === 'the informed') {
          tier = 'informed';
          console.log(`Inferred tier 'informed' from product name: ${product.name}`);
        } else if (name.includes('insider') || name === 'the insider') {
          tier = 'insider';
          console.log(`Inferred tier 'insider' from product name: ${product.name}`);
        } else {
          if (product.id === 'prod_SQYojb6WgJRDVm') {
            tier = 'curious';
            console.log(`Matched product ID to tier 'curious': ${product.id}`);
          } else if (product.id === 'prod_SQYpS7fOMik8EC') {
            tier = 'informed';
            console.log(`Matched product ID to tier 'informed': ${product.id}`);
          } else if (product.id === 'prod_SQYpIjeHgFxuTW') {
            tier = 'insider';
            console.log(`Matched product ID to tier 'insider': ${product.id}`);
          }
        }
      } else if (tier === 'free') {
        console.log(`Skipping product with free tier metadata: ${product.id}`);
        continue;
      }
      
      if (tier && ['curious', 'informed', 'insider'].includes(tier)) {
        console.log(`Mapped product ${product.id} to tier: ${tier}`);
        productTiers[product.id] = tier;
      } else {
        console.log(`Could not determine tier for product ${product.id}`);
      }
    }
    
    for (const price of prices.data) {
      if (!price.active) {
        console.log(`Skipping inactive price: ${price.id}`);
        continue;
      }
      
      console.log(`Active price: ${price.id}`);
      console.log(`Price details:`, JSON.stringify({
        product: price.product,
        active: price.active,
        recurring: price.recurring,
        unit_amount: price.unit_amount,
        currency: price.currency
      }));
      
      let productId;
      if (typeof price.product === 'string') {
        productId = price.product;
      } else if (price.product && typeof price.product === 'object' && 'id' in price.product) {
        productId = price.product.id;
      }
      
      if (!productId) {
        console.log(`No valid product ID for price ${price.id}`);
        continue;
      }
      
      const tier = productTiers[productId];
      console.log(`Looking up tier for product ${productId}, found: ${tier || 'NONE'}`);
      
      if (tier && price.recurring) {
        console.log(`Mapped price ${price.id} to tier: ${tier}`);
        productMap[tier] = {
          productId: productId,
          priceId: price.id,
          interval: price.recurring.interval,
          unitAmount: price.unit_amount || 0,
          currency: price.currency
        };
      } else if (!price.recurring) {
        console.log(`Price ${price.id} is not recurring`);
      }
    }

    const requiredTiers = ['curious', 'informed', 'insider'];
    const missingTiers = requiredTiers.filter(tier => !productMap[tier]);
    
    if (missingTiers.length > 0) {
      console.warn(`Missing Stripe products/prices for tiers: ${missingTiers.join(', ')}`);
      
      console.error(`Required tiers are missing in Stripe: ${missingTiers.join(', ')}`);
      console.error('Please create these products and prices in the Stripe dashboard');
    }
    
    productsCache = productMap;
    productsCacheExpiry = Date.now() + CACHE_TTL;
    
    console.log('Final product and price mapping:', JSON.stringify(productMap, null, 2));
    return productMap;
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
    throw new Error('Failed to fetch products from Stripe');
  }
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
    const products = await getStripeProducts();
    
    if (!products[tier]) {
      res.status(404).json({ 
        message: `The subscription tier "${tier}" is not currently available. Please contact support or try another tier.` 
      });
      return;
    }

    const productInfo = products[tier];
    console.log(`Using product info for tier ${tier}:`, productInfo);

    const [rows] = await db.query('SELECT stripe_customer_id FROM users WHERE id = ?', [req.user.id]);
    const user = (rows as any[])[0];
    
    let customerId = user?.stripe_customer_id;
    
    if (!customerId) {
      const [userRows] = await db.query('SELECT email, name FROM users WHERE id = ?', [req.user.id]);
      const userData = (userRows as any[])[0];
      
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name || undefined,
        metadata: {
          userId: req.user.id.toString()
        }
      });
      
      customerId = customer.id;
      
      await db.query('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, req.user.id]);
    }

    const lineItems = productInfo.priceId === 'dynamic' 
      ? [{
          price_data: {
            currency: 'sek',
            product: productInfo.productId,
            recurring: {
              interval: productInfo.interval as 'day' | 'week' | 'month' | 'year',
            },
            unit_amount: productInfo.unitAmount,
          },
          quantity: 1,
        }] 
      : [{
          price: productInfo.priceId,
          quantity: 1,
        }];

    console.log('Creating checkout session with line items:', JSON.stringify(lineItems));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: lineItems,
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
    
    let session;
    try {
      console.log(`Retrieving Stripe session with ID: ${session_id}`);
      
      session = await stripe.checkout.sessions.retrieve(
        session_id as string,
        {
          expand: ['subscription', 'line_items']
        }
      );
      
      console.log('Session retrieved successfully:', session.id);
      
    } catch (stripeError: any) {
      console.error('Stripe API error details:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        requestId: stripeError.requestId
      });
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        res.status(400).json({ 
          message: 'Invalid session ID',
          details: stripeError.message
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to retrieve checkout session from Stripe',
          details: stripeError.message
        });
      }
      return;
    }

    console.log('Session retrieved:', session.id, 'Status:', session.status);
    console.log('Session metadata:', JSON.stringify(session.metadata));
    
    const tier = session.metadata?.tier;
    const userId = session.metadata?.userId;
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;
    
    if (!tier || !userId || !subscriptionId) {
      console.error('Missing required session data:', { 
        tier: tier || 'MISSING', 
        userId: userId || 'MISSING', 
        subscriptionId: subscriptionId || 'MISSING' 
      });
      res.status(400).json({ message: 'Invalid session data' });
      return;
    }
    
    if (parseInt(userId) !== req.user.id) {
      console.error('User ID mismatch:', { sessionUserId: userId, authenticatedUserId: req.user.id });
      res.status(403).json({ message: 'Session belongs to a different user' });
      return;
    }
    
    if (!['curious', 'informed', 'insider'].includes(tier)) {
      console.error(`Invalid tier received from Stripe metadata: ${tier}`);
      res.status(400).json({ message: 'Invalid subscription tier' });
      return;
    }
    
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
      });
      console.log('Subscription details retrieved from Stripe');
    } catch (stripeError) {
      console.error('Error retrieving subscription from Stripe:', stripeError);
      res.status(500).json({ message: 'Failed to retrieve subscription details from Stripe' });
      return;
    }
    
    let validUntil;
    let interval;
    try {
      if (!subscription.items?.data[0]?.price || 
          !(subscription.items.data[0].price as any)?.recurring?.interval) {
        console.error('Missing required interval data in subscription');
        res.status(500).json({ message: 'Invalid subscription data: missing interval' });
        return;
      }
      
      const rawInterval = (subscription.items.data[0].price as any).recurring.interval;
      const intervalCount = (subscription.items.data[0].price as any).recurring.interval_count || 1;
      
      let interval = rawInterval;
      if (rawInterval === 'day' && intervalCount === 7) {
        interval = 'week';
        console.log('Normalized day+7 interval to week for consistency');
      }
      
      console.log(`Subscription interval from Stripe: ${rawInterval}, count: ${intervalCount}, normalized: ${interval}`);
      
      if (!(subscription as any).current_period_end) {
        console.log('Setting subscription end date based on normalized interval');
        
        const startTimestamp = (subscription as any).current_period_start || 
                                (subscription as any).created || 
                                Math.floor(Date.now() / 1000);
        
        const startDate = new Date(startTimestamp * 1000);
        const endDate = new Date(startDate);
        
        endDate.setDate(endDate.getDate() + 7);
        console.log(`Calculated end date: ${endDate.toISOString()} (7 days from start)`);
        
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        
        try {
          const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at: endTimestamp
          });
          
          console.log(`Updated subscription ${subscriptionId} with cancel_at: ${new Date(endTimestamp * 1000).toISOString()}`);
          
          validUntil = new Date(endTimestamp * 1000);
        } catch (updateError) {
          console.error('Error updating subscription end date:', updateError);
          res.status(500).json({ 
            message: 'Failed to set subscription end date',
            details: 'Could not update the Stripe subscription with an end date.'
          });
          return;
        }
      } else {
        validUntil = new Date(((subscription as any).current_period_end) * 1000);
      }
      
      console.log(`Subscription valid until: ${validUntil.toISOString()}`);
    } catch (dateError) {
      console.error('Error processing subscription data:', dateError);
      res.status(500).json({ 
        message: 'Failed to process subscription data',
        details: dateError instanceof Error ? dateError.message : 'Unknown error' 
      });
      return;
    }

    try {
      await db.query('START TRANSACTION');
      
      const [userUpdate] = await db.query(
        'UPDATE users SET subscription_level = ?, subscription_status = ?, stripe_subscription_id = ? WHERE id = ?', 
        [tier, 'active', subscriptionId, userId]
      );
      
      console.log('User update result:', userUpdate);
      
      const [existingSubscriptionResult] = await db.query(
        'SELECT id FROM subscriptions WHERE user_id = ? AND stripe_subscription_id = ?', 
        [userId, subscriptionId]
      );
      
      const existingSubscription = (existingSubscriptionResult as any[]);
      
      if (existingSubscription.length === 0) {
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
      
      const [userInfo] = await db.query('SELECT name, email, role FROM users WHERE id = ?', [userId]);
      const user = (userInfo as any[])[0];
      
      if (!user) {
        throw new Error(`User not found after update: ${userId}`);
      }
      
      const token = jwt.sign(
        {
          id: parseInt(userId),
          name: user.name,
          email: user.email,
          level: tier,
          role: user.role || 'user',
          subscription_status: 'active'
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '6h' }
      );
      
      await db.query('COMMIT');
      
      res.json({ 
        success: true, 
        tier, 
        status: 'active',
        token,
        validUntil: validUntil.toISOString(),
        subscriptionId,
        interval: interval
      });
    } catch (dbError) {
      try {
        await db.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error during transaction rollback:', rollbackErr);
      }
      
      console.error('Database error during subscription update:', dbError);
      res.status(500).json({ message: 'Failed to update subscription in database' });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ 
      message: 'Failed to verify session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getStripeProducts();
    
    if (Object.keys(products).length === 0) {
      res.status(404).json({ 
        message: 'No subscription products are available in Stripe. Please add products in your Stripe dashboard.' 
      });
      return;
    }
    
    const formattedProducts = Object.entries(products).map(([tier, info]) => {
      const currency = info.currency || 'sek';
      const price = info.unitAmount / 100;
      
      let currencySymbol = '$';
      if (currency === 'sek') currencySymbol = 'kr';
      else if (currency === 'eur') currencySymbol = '€';
      else if (currency === 'gbp') currencySymbol = '£';
      
      return {
        tier,
        productId: info.productId,
        priceId: info.priceId,
        interval: info.interval,
        price: price,
        currency: currency,
        displayPrice: `${currencySymbol}${price.toFixed(2)}`,
        displayName: `The ${tier.charAt(0).toUpperCase() + tier.slice(1)}`
      };
    });
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
    
    res.status(500).json({ 
      message: 'Failed to fetch products from Stripe API. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateProductMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    await stripe.products.update('prod_SQYojb6WgJRDVm', {
      metadata: { tier: 'curious' }
    });
    
    await stripe.products.update('prod_SQYpS7fOMik8EC', {
      metadata: { tier: 'informed' }
    });
    
    await stripe.products.update('prod_SQYpIjeHgFxuTW', {
      metadata: { tier: 'insider' }
    });
    
    res.json({ message: 'Product metadata updated successfully' });
  } catch (error) {
    console.error('Error updating product metadata:', error);
    res.status(500).json({ message: 'Failed to update product metadata' });
  }
};

export const checkSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const [userRows] = await db.query(
      'SELECT stripe_subscription_id, stripe_customer_id, name FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    const user = (userRows as any[])[0];
    if (!user || !user.stripe_subscription_id) {
      res.json({ 
        isActive: false,
        status: 'no_subscription',
        message: 'No active subscription found'
      });
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    const isActive = subscription.status === 'active';
    
    if (subscription.status !== 'active' && req.user.subscription_status === 'active') {
      await db.query(
        'UPDATE users SET subscription_status = ? WHERE id = ?',
        [subscription.status, req.user.id]
      );
      
      await db.query(
        'UPDATE subscriptions SET status = ? WHERE user_id = ? AND stripe_subscription_id = ?',
        [subscription.status, req.user.id, user.stripe_subscription_id]
      );
    }
    
    const token = jwt.sign(
      {
        id: req.user.id,
        name: user.name,
        email: req.user.email,
        level: req.user.level,
        role: req.user.role,
        subscription_status: subscription.status
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '6h' }
    );

    const currentPeriodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null;

    res.json({
      isActive,
      status: subscription.status,
      currentPeriodEnd,
      token
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ message: 'Failed to check subscription status' });
  }
};