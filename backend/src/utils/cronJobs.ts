import cron from 'node-cron';
import { db } from './db'; // adjust if your db.ts path differs

export function startCronJobs() {
  console.log('🕒 Cron jobs started');

  // Every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running daily subscription expiration check...');

    try {
      // Step 1: Mark expired subscriptions in subscriptions table
      await db.query(`
        UPDATE subscriptions
        SET status = 'failed'
        WHERE status = 'active' AND valid_until < NOW()
      `);

      // Step 2: Mark users as failed if their active subscription expired
      await db.query(`
        UPDATE users
        SET subscription_status = 'failed'
        WHERE subscription_status = 'active'
          AND id IN (
            SELECT user_id FROM subscriptions
            WHERE status = 'failed'
          )
      `);

      console.log('✅ Expired subscriptions marked as failed.');
    } catch (err) {
      console.error('❌ Error running cron job:', err);
    }
  });
}
