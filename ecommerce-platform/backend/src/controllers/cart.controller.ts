import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const cart = await cartService.getCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        throw ApiError.badRequest('productId y quantity son requeridos');
      }

      const item = await cartService.addItem(userId, productId, parseInt(quantity));

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        throw ApiError.badRequest('quantity es requerido');
      }

      const item = await cartService.updateItem(userId, itemId, parseInt(quantity));

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { itemId } = req.params;

      await cartService.removeItem(userId, itemId);

      res.status(200).json({
        success: true,
        message: 'Item eliminado del carrito',
      });
    } catch (error) {
      next(error);
    }
  },
};
