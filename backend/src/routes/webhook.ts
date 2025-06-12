import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController';
import express from 'express';

const router = Router();

// Raw body is needed for Stripe signature verification
router.post('/stripe', 
  express.raw({ type: 'application/json' }), 
  handleWebhook
);

export default router;