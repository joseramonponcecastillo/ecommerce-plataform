import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw ApiError.badRequest('Todos los campos son requeridos');
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw ApiError.badRequest('Email y contraseña son requeridos');
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const user = await authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
