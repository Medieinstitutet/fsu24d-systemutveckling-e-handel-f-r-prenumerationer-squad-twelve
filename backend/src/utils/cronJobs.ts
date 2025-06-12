import cron from 'node-cron';
import { db } from './db';
import stripe from './stripe';

export const startCronJobs = (): void => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription renewal check...');
    await checkExpiringSubscriptions();
  });
};

async function checkExpiringSubscriptions() {
  try {
    // Get subscriptions expiring in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [subscriptions] = await db.query(
      `SELECT user_id, stripe_subscription_id, valid_until 
       FROM subscriptions 
       WHERE status = 'active' 
       AND valid_until BETWEEN ? AND ?`,
      [now, tomorrow]
    );
    
    console.log(`Found ${(subscriptions as any[]).length} subscriptions expiring soon`);
    
    for (const sub of (subscriptions as any[])) {
      try {
        // Check status in Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        
        if (stripeSubscription.status === 'active') {
          // Subscription is still active in Stripe, update our records
          const newValidUntil = new Date((stripeSubscription as any).current_period_end * 1000);
          
          await db.query(
            'UPDATE subscriptions SET valid_until = ? WHERE stripe_subscription_id = ?',
            [newValidUntil, sub.stripe_subscription_id]
          );
          
          console.log(`Updated subscription ${sub.stripe_subscription_id} for user ${sub.user_id} with new end date ${newValidUntil}`);
        }
      } catch (err) {
        console.error(`Error checking subscription ${sub.stripe_subscription_id}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in subscription renewal cron job:', err);
  }
}