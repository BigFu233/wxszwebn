import { Request, Response } from 'express';
import { Task } from '../models/User';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, deadline } = req.body;
    // Assuming authentication middleware adds user to req
    const userId = (req as any).user._id;

    const task = await Task.create({
      title,
      description,
      deadline,
      createdBy: userId
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().populate('createdBy', 'username email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      res.status(404).json({ message: '任务不存在' });
      return;
    }

    res.json({ message: '任务已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
