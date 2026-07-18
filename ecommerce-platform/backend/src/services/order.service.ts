import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/generateOrderNumber';

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export const orderService = {
  async getOrders(userId: string, isAdmin: boolean) {
    const where = isAdmin ? {} : { userId };

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getOrderById(orderId: string, userId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound('Orden no encontrada');
    }

    if (!isAdmin && order.userId !== userId) {
      throw ApiError.forbidden('No tienes permiso para ver esta orden');
    }

    return order;
  },

  async checkout(userId: string, items: CheckoutItem[]) {
    if (!items || items.length === 0) {
      throw ApiError.badRequest('El carrito está vacío');
    }

    // Ejecutar transacción ACID
    const result = await prisma.$transaction(async (tx) => {
      // 1. Bloquear productos para evitar condiciones de carrera (SELECT FOR UPDATE)
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // 2. Validar que todos los productos existen y están activos
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Producto no encontrado: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw ApiError.badRequest(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }
      }

      // 3. Descontar stock de cada producto
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Calcular total
      let total = 0;
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        total += Number(product.price) * item.quantity;
      }

      // 5. Crear la orden
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: 'PENDING',
          total,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 6. Vaciar el carrito del usuario
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return order;
    }, {
      // Aislamiento SERIALIZABLE para máxima seguridad en concurrencia
      isolationLevel: 'Serializable',
    });

    return result;
  },

  async updateStatus(orderId: string, status: string) {
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest('Estado de orden inválido');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Orden no encontrada');

    // Si se cancela, restaurar stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({
          where: { orderId },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: status as any },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
      });
    }

    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
  },
};
