import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSubscriptionLevel } from '../middleware/subscriptionMiddleware';

const router = Router();

// 🔒 Example authenticated route
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'Access granted ✅',
    user: req.user,
  });
});

// 🔒 Dynamic protected route: /protected/:tier
router.get('/:tier', requireAuth, (req: Request, res: Response, next) => {
  const tier = req.params.tier;

  const validTiers = ['curious', 'informed', 'insider'];
  if (!validTiers.includes(tier)) {
    res.status(400).json({ message: 'Invalid tier requested' });
    return;
  }

  const gate = requireSubscriptionLevel(tier as any);
  gate(req, res, () => {
    res.send(`This is premium content for ${tier} subscribers or higher.`);
  });
});

export default router;
