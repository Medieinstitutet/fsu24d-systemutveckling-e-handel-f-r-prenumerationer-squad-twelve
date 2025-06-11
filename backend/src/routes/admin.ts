import express from 'express';
import {
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/adminContentController';
import { requireAuth, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Admin must be authenticated and have role = 'admin'
router.use(requireAuth, isAdmin);

router.get('/content', getAllContent);
router.post('/content', createContent);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);

export default router;
