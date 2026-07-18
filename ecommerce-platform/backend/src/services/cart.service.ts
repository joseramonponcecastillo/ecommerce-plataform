import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';

export const cartService = {
  async getCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return prisma.cart.create({
        data: { userId },
        include: {
          items: { include: { product: true } },
        },
      });
    }

    return cart;
  },

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw ApiError.badRequest('La cantidad debe ser mayor a 0');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw ApiError.notFound('Producto no encontrado');
    }

    if (product.stock < quantity) {
      throw ApiError.badRequest(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw ApiError.badRequest(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: { product: true },
    });
  },

  async updateItem(userId: string, itemId: string, quantity: number) {
    if (quantity < 0) {
      throw ApiError.badRequest('La cantidad no puede ser negativa');
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound('Carrito no encontrado');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) throw ApiError.notFound('Item no encontrado en el carrito');

    if (quantity === 0) {
      return prisma.cartItem.delete({ where: { id: itemId } });
    }

    if (item.product.stock < quantity) {
      throw ApiError.badRequest(`Stock insuficiente. Disponible: ${item.product.stock}`);
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound('Carrito no encontrado');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw ApiError.notFound('Item no encontrado en el carrito');

    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  },
};
