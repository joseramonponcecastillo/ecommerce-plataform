import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { stripeService } from '../services/stripe.service';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const orderController = {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user!;
      const isAdmin = user.role === 'ADMIN';

      const orders = await orderService.getOrders(user.id, isAdmin);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user!;
      const isAdmin = user.role === 'ADMIN';
      const { id } = req.params;

      const order = await orderService.getOrderById(id, user.id, isAdmin);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest('Debes proporcionar al menos un item para el checkout');
      }

      // Validar estructura de items
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          throw ApiError.badRequest('Cada item debe tener productId y quantity válidos');
        }
      }

      // 1. Crear la orden con transacción ACID (valida stock y descuenta)
      const order = await orderService.checkout(userId, items);

      // 2. Simular procesamiento de pago con Stripe
      const paymentResult = await stripeService.createPaymentIntent({
        amount: Number(order.total),
        currency: 'usd',
        orderId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          userId,
        },
      });

      // 3. Si el pago fue exitoso, actualizar estado a PAID
      if (paymentResult.success) {
        await orderService.updateStatus(order.id, 'PAID');
      }

      res.status(201).json({
        success: true,
        data: {
          order: {
            ...order,
            status: 'PAID',
          },
          payment: paymentResult,
        },
        message: `Orden ${order.orderNumber} creada y pagada exitosamente`,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw ApiError.badRequest('El estado es requerido');
      }

      const order = await orderService.updateStatus(id, status);

      res.status(200).json({
        success: true,
        data: order,
        message: `Estado de la orden actualizado a ${status}`,
      });
    } catch (error) {
      next(error);
    }
  },
};
