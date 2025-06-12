import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  createCheckoutSession, 
  getUserSubscription,
  verifySession,
  getProducts,
  updateProductMetadata,
  checkSubscriptionStatus
} from '../controllers/subscriptionController';

const router = Router();

router.post('/create-checkout', requireAuth, createCheckoutSession);
router.get('/my-subscription', requireAuth, getUserSubscription);
router.get('/verify-session', requireAuth, verifySession);
router.get('/products', getProducts);
router.post('/update-metadata', requireAuth, updateProductMetadata);
router.get('/check-status', requireAuth, checkSubscriptionStatus);

export default router;