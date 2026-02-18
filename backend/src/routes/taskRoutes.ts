import express from 'express';
import { createTask, getTasks, deleteTask } from '../controllers/taskController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), createTask);
router.get('/', authenticate, getTasks);
router.delete('/:id', authenticate, authorize(['admin']), deleteTask);

export default router;
