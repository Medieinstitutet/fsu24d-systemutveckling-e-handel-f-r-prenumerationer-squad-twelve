import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  createCheckoutSession, 
  handleWebhook, 
  getUserSubscription,
  verifySession
} from '../controllers/subscriptionController';
import express from 'express';

const router = Router();

router.post('/create-checkout', requireAuth, createCheckoutSession);

router.get('/my-subscription', requireAuth, getUserSubscription);

router.get('/verify-session', requireAuth, verifySession);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;