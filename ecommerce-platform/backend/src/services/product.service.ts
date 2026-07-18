import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ProductFilters } from '../types';

export const productService = {
  async getAll(filters: ProductFilters) {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (inStock) where.stock = { gt: 0 };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Producto no encontrado');
    return product;
  },

  async create(data: any) {
    return prisma.product.create({ data });
  },

  async update(id: string, data: any) {
    await this.getById(id); // Verifica existencia
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.product.delete({ where: { id } });
  },

  async getCategories() {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category);
  },
};
