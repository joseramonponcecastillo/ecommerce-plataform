import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { ApiError } from '../utils/ApiError';

export const productController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        inStock: req.query.inStock === 'true',
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await productService.getAll(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock, category, imageUrl } = req.body;

      if (!name || !description || price === undefined || stock === undefined || !category) {
        throw ApiError.badRequest('Todos los campos requeridos deben ser proporcionados');
      }

      const product = await productService.create({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        imageUrl,
      });

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.update(id, req.body);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Producto eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};
