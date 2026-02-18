import express from 'express';
import multer from 'multer';
import path from 'path';
import { getSettings, updateSettings } from '../controllers/siteSettingController';
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

router.get('/', getSettings);
router.put('/', authenticate, authorize(['admin']), updateSettings);
router.post('/upload', authenticate, authorize(['admin']), upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: '请上传文件' });
    return;
  }
  // Construct URL dynamically based on request host
  const protocol = req.protocol;
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;
