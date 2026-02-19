import express from 'express';
import { createTask, getTasks, deleteTask, getMyTasks, updateTaskAssignees } from '../controllers/taskController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), createTask);
router.get('/', authenticate, authorize(['admin']), getTasks);
router.get('/mine', authenticate, getMyTasks);
router.put('/:id/assignees', authenticate, authorize(['admin']), updateTaskAssignees);
router.delete('/:id', authenticate, authorize(['admin']), deleteTask);

export default router;
