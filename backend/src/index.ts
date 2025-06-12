import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import subscriptionRoutes from './routes/subscription';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhook';
import { startCronJobs } from './utils/cronJobs';

dotenv.config();

const app = express();
app.use(cors());

// Important: Add this BEFORE the json body parser middleware
// The raw webhook endpoint needs the raw body for signature verification
app.use('/webhook', webhookRoutes);

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/content', contentRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});
