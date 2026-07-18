import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Público
router.get('/', productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), productController.create);
router.put('/:id', authenticate, authorize('ADMIN'), productController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.delete);

export default router;
