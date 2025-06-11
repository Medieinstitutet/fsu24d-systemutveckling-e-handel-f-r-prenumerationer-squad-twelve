import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from '../utils/db';

dotenv.config();

const accessPriority: { [key: string]: number } = {
  free: 0,
  curious: 1,
  informed: 2,
  insider: 3,
};

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables!');
  process.exit(1);
}

// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log('REGISTER: Missing fields:', { name, email, password });
    res.status(400).json({ message: 'Name, email and password are required.' });
    return;
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [
      email,
    ]);
    if ((existing as any[]).length > 0) {
      console.log(`REGISTER: User already exists with email ${email}`);
      res.status(409).json({ message: 'User already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Add default role as 'user'
    await db.query(
      'INSERT INTO users (name, email, password, subscription_level, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'free', 'user']
    );

    console.log(`REGISTER: User registered successfully with email ${email}`);
    res.status(201).json({ message: 'User registered successfully ✅' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('LOGIN: Missing email or password');
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const user = (rows as any[])[0];

    if (!user) {
      console.log(`LOGIN: User not found with email ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`LOGIN: Password mismatch for email ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.subscription_level || 'free',
        role: user.role || 'user',
        subscription_status: user.subscription_status || 'inactive', // ✅ NEW
      },
      JWT_SECRET,
      { expiresIn: '6h' }
    );

    console.log(`LOGIN: User logged in successfully with email ${email}`);
    res.json({ message: 'Login successful ✅', token });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET NEWS BY USER LEVEL
export const getNews = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('GET NEWS: No authorization header or bad format');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('GET NEWS: Received token:', token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('GET NEWS: Decoded JWT token:', decoded);

    const userLevel = decoded.level;
    if (userLevel === undefined || accessPriority[userLevel] === undefined) {
      console.error(
        'GET NEWS: Invalid or missing user level in token:',
        userLevel
      );
      res
        .status(403)
        .json({ message: 'Forbidden - invalid subscription level' });
      return;
    }

    const allowedLevels = Object.entries(accessPriority)
      .filter(([_, value]) => value <= accessPriority[userLevel])
      .map(([key]) => key);

    console.log('GET NEWS: Allowed news levels for user:', allowedLevels);

    const [rows] = await db.query(
      `SELECT * FROM content WHERE access_level IN (?) ORDER BY created_at DESC`,
      [allowedLevels]
    );

    console.log(`GET NEWS: Returning ${(rows as any[]).length} news articles`);
    res.json(rows);
  } catch (err) {
    console.error('GET NEWS: Token verification error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// CANCEL SUBSCRIPTION
export const cancelSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('CANCEL SUBSCRIPTION: Missing or bad auth header');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    console.log(`CANCEL SUBSCRIPTION: User ID from token: ${userId}`);

    await db.query(
      "UPDATE users SET subscription_status = 'cancelled' WHERE id = ?",
      [userId]
    );

    const newToken = jwt.sign(
      {
        id: userId,
        name: decoded.name,
        email: decoded.email,
        level: decoded.level, // ✅ keep the level
        role: decoded.role,
        subscription_status: 'cancelled',
      },
      JWT_SECRET,
      { expiresIn: '6h' }
    );

    res.json({
      message:
        'Subscription marked as cancelled. Access will remain active until the end of the paid period.',
      token: newToken,
    });
  } catch (err) {
    console.error('CANCEL SUBSCRIPTION ERROR:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
