import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/checkout', orderController.checkout);
router.patch('/:id/status', authorize('ADMIN'), orderController.updateStatus);

export default router;
