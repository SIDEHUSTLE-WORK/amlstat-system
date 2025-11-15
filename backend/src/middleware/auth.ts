// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/prisma';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        organizationId?: string | null;
      };
    }
  }
}

// 🔐 AUTH MIDDLEWARE
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token) as any;

    // Find user with Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { 
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check if organization is active (if user has one)
    if (user.organization && !user.organization.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Organization is inactive'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    next();
  } catch (error: any) {
    // 🔥 Handle token errors BEFORE logging
    if (error.name === 'TokenExpiredError') {
      // Don't log - this is expected behavior, frontend will refresh
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      console.error('❌ Invalid JWT token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Only log unexpected errors
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// 🔐 ADMIN MIDDLEWARE
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.role !== 'FIA_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// 🔐 ORG ADMIN MIDDLEWARE
export const orgAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.role !== 'ORG_ADMIN' && req.user.role !== 'FIA_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Organization admin access required'
    });
  }

  next();
};