import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'Access granted ✅',
    user: req.user, // Now properly typed
  });
});

export default router;
