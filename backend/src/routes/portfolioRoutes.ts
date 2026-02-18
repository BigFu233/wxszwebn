import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createPortfolio,
  getPortfolios,
  deletePortfolio,
  toggleFavorite,
  getMyFavorites,
  getPortfoliosAdmin,
  approvePortfolio,
  getPortfolioById,
  getMyPortfolios
} from '../controllers/portfolioController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  createPortfolio
);
router.get('/admin', authenticate, authorize(['admin']), getPortfoliosAdmin);
router.get('/favorites/me', authenticate, getMyFavorites);
router.get('/mine', authenticate, getMyPortfolios);
router.get('/', getPortfolios);
router.post('/:id/approve', authenticate, authorize(['admin']), approvePortfolio);
router.post('/:id/favorite', authenticate, toggleFavorite);
router.get('/:id', getPortfolioById);
router.delete('/:id', authenticate, authorize(['admin']), deletePortfolio);

export default router;
