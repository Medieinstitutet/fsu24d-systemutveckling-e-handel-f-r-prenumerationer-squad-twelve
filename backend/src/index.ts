import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import subscriptionRoutes from './routes/subscription';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';
import webhookRoute from './routes/webhook';

import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());

app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/content', contentRoutes);
app.use('/admin', adminRoutes);
app.use('/webhook', webhookRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
