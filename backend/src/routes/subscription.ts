import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  createCheckoutSession, 
  getUserSubscription,
  verifySession
} from '../controllers/subscriptionController';

const router = Router();

router.post('/create-checkout', requireAuth, createCheckoutSession);
router.get('/my-subscription', requireAuth, getUserSubscription);
router.get('/verify-session', requireAuth, verifySession);

export default router;