// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// 🔐 LOGIN VALIDATION
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

// 🔐 REGISTER VALIDATION
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters'
    }),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('fia_admin', 'org_admin', 'org_user').required(),
    organizationId: Joi.string().uuid().optional()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

// 📊 SUBMISSION VALIDATION
export const validateSubmission = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    organizationId: Joi.string().uuid().required(),
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(2020).max(2030).required(),
    indicators: Joi.array().items(
      Joi.object({
        number: Joi.string().required(),
        name: Joi.string().required(),
        value: Joi.alternatives().try(
          Joi.number(),
          Joi.string()
        ).required()
      })
    ).required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};