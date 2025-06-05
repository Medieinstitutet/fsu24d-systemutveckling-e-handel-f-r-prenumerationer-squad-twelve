import { Router } from 'express';
import { register, login, getNews, cancelSubscription } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/news', getNews);
router.post('/cancel-subscription', cancelSubscription);

export default router;
