import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getUsers,
  uploadAvatar,
  uploadAvatarForUser,
  getCurrentUser,
  updateCurrentUser,
  createUserByAdmin,
  updateUserRole
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', authenticate, authorize(['admin']), getUsers);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/:id/avatar', authenticate, authorize(['admin']), upload.single('avatar'), uploadAvatarForUser);
router.post('/', authenticate, authorize(['admin']), createUserByAdmin);
router.put('/:id/role', authenticate, authorize(['admin']), updateUserRole);

export default router;
