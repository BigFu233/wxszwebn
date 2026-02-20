import { Response } from 'express';
import { Task, Portfolio } from '../models/User';
import { AuthRequest } from '../types';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, deadline, type, assigneeIds } = req.body;

    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const userId = req.user._id;

    const assignees =
      Array.isArray(assigneeIds) && assigneeIds.length > 0
        ? assigneeIds.map((id: string) => ({ user: id, status: 'pending' }))
        : [];

    const task = await Task.create({
      title,
      description,
      deadline,
      type,
      createdBy: userId,
      assignees
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'username email')
      .populate('assignees.user', 'username email role')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
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

export const updateTaskAssignees = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assigneeIds } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: '任务不存在' });
      return;
    }

    const assignees =
      Array.isArray(assigneeIds) && assigneeIds.length > 0
        ? assigneeIds.map((uid: string) => ({ user: uid, status: 'pending' }))
        : [];

    task.assignees = assignees as any;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const userId = req.user._id;
    const tasks = await Task.find({ 'assignees.user': userId })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    const taskIds = tasks.map((t) => t._id);
    const counts = await Portfolio.aggregate([
      {
        $match: {
          user: userId,
          task: { $in: taskIds as any }
        }
      },
      {
        $group: {
          _id: '$task',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c: any) => {
      if (c._id) {
        countMap.set(c._id.toString(), c.count);
      }
    });

    res.json(
      tasks.map((task) => {
        const assignment = task.assignees.find(
          (a: any) => a.user.toString() === userId.toString()
        );
        return {
          _id: task._id,
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          type: task.type,
          createdBy: task.createdBy,
          assignmentStatus: assignment ? assignment.status : 'pending',
          submissionCount: countMap.get(task._id.toString()) || 0
        };
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
