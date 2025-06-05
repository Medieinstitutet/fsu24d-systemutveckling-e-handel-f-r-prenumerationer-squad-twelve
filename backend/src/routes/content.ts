import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSubscriptionLevel } from '../middleware/subscriptionMiddleware';

const router = Router();

// Free content
router.get('/free-articles', (req, res) => {
  res.json({ articles: [/* Free articles */] });
});

// Basic tier content
router.get('/curious-articles', 
  requireAuth, 
  requireSubscriptionLevel('curious'), 
  (req, res) => {
    res.json({ articles: [/* Curious tier articles */] });
  }
);

// Mid tier content
router.get('/informed-articles', 
  requireAuth, 
  requireSubscriptionLevel('informed'), 
  (req, res) => {
    res.json({ articles: [/* Informed tier articles */] });
  }
);

// Premium tier content
router.get('/insider-articles', 
  requireAuth, 
  requireSubscriptionLevel('insider'), 
  (req, res) => {
    res.json({ articles: [/* Insider tier articles */] });
  }
);

export default router;