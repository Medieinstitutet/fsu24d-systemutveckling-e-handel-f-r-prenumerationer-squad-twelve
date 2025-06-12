import { Request, Response, NextFunction } from 'express';

const subscriptionLevels = {
  free: 0,
  curious: 1,
  informed: 2,
  insider: 3,
};

type SubscriptionLevel = keyof typeof subscriptionLevels;

export const requireSubscriptionLevel = (requiredLevel: SubscriptionLevel) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.subscription_status === 'failed') {
      res
        .status(403)
        .json({
          message:
            'Your subscription payment failed. Please retry to regain access.',
        });
      return;
    }

    const userLevel = req.user.level as SubscriptionLevel;
    const userSubscriptionValue = subscriptionLevels[userLevel] || 0;
    const requiredSubscriptionValue = subscriptionLevels[requiredLevel];

    if (userSubscriptionValue < requiredSubscriptionValue) {
      res.status(403).json({
        message: `This content requires ${requiredLevel} subscription or higher`,
        currentLevel: userLevel,
        requiredLevel: requiredLevel,
      });
      return;
    }

    next();
  };
};
