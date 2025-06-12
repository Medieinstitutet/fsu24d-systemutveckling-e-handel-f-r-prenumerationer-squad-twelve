import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = express.Router();

// Stripe webhook uses raw body, not JSON
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
