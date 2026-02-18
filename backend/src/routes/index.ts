import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/auth', authRoutes);

export default router;