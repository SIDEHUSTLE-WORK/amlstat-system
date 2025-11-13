// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { Organization } from '../models/Organization';

// 🔥 LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      where: { email, isActive: true },
      include: [{ model: Organization }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateToken(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId 
      },
      '15m' // Access token expires in 15 minutes
    );

    const refreshToken = generateToken(
      { id: user.id },
      '7d' // Refresh token expires in 7 days
    );

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });

    console.log('✅ User logged in:', email);
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

// 🔥 REGISTER (For creating new users)
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role, organizationId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      organizationId,
      isActive: true
    });

    // Get user with organization
    const userWithOrg = await User.findByPk(user.id, {
      include: [{ model: Organization }]
    });

    // Generate tokens
    const accessToken = generateToken(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId 
      },
      '15m'
    );

    const refreshToken = generateToken(
      { id: user.id },
      '7d'
    );

    // Remove password from response
    const userResponse = {
      id: userWithOrg!.id,
      email: userWithOrg!.email,
      name: userWithOrg!.name,
      role: userWithOrg!.role,
      organizationId: userWithOrg!.organizationId,
      organization: userWithOrg!.organization,
      isActive: userWithOrg!.isActive,
      createdAt: userWithOrg!.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });

    console.log('✅ User registered:', email);
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

// 🔥 REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Get user
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Organization }]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId 
      },
      '15m'
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });

    console.log('✅ Token refreshed for:', user.email);
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// 🔥 LOGOUT
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a production app, you'd invalidate the token here
    // For now, we just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });

    console.log('✅ User logged out:', req.user?.email);
  } catch (error) {
    console.error('❌ Logout error:', error);
    next(error);
  }
};

// 🔥 GET CURRENT USER
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      include: [{ model: Organization }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    next(error);
  }
};

// 🔥 FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken({ id: user.id }, '1h');

    // In production, send email with reset link
    // await sendResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // For development only - remove in production!
      devOnly: { resetToken }
    });

    console.log('✅ Password reset requested for:', email);
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    next(error);
  }
};

// 🔥 RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = verifyToken(token);

    // Get user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password reset successful'
    });

    console.log('✅ Password reset for:', user.email);
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }
};

// 🔥 CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

    console.log('✅ Password changed for:', user.email);
  } catch (error) {
    console.error('❌ Change password error:', error);
    next(error);
  }
};