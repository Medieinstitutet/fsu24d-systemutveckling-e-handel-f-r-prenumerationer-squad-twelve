import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController';
import express from 'express';

const router = Router();


router.post('/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;