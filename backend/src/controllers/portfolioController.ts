import { Request, Response } from 'express';
import { Portfolio, Favorite, Task } from '../models/User';
import { AuthRequest } from '../types';

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, url, type, taskId } = req.body;
    const userId = req.user?._id;

    const protocol = req.protocol;
    const host = req.get('host');

    const files = req.files as any;
    const thumbnailFile = files && files.thumbnail && files.thumbnail[0];
    const mainFile = files && files.file && files.file[0];

    let thumbnailUrl = '';
    if (thumbnailFile) {
      thumbnailUrl = `${protocol}://${host}/uploads/${thumbnailFile.filename}`;
    }

    let finalUrl = url;
    if (mainFile) {
      finalUrl = `${protocol}://${host}/uploads/${mainFile.filename}`;
      if (!thumbnailUrl) {
        thumbnailUrl = finalUrl;
      }
    }

    const status = req.user && req.user.role === 'admin' ? 'approved' : 'pending';

    const portfolio = await Portfolio.create({
      user: userId,
      title,
      description,
      url: finalUrl,
      thumbnailUrl,
      type,
      status,
      task: taskId || null
    });

    if (taskId && userId) {
      try {
        const task = await Task.findById(taskId);
        if (task) {
          const assignment: any = task.assignees.find(
            (a: any) => a.user.toString() === userId.toString()
          );
          if (assignment && assignment.status === 'pending') {
            assignment.status = 'submitted';
            await task.save();
          }
        }
      } catch (err) {
        console.error('更新任务提交状态失败', err);
      }
    }

    res.status(201).json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getPortfolios = async (req: Request, res: Response) => {
  try {
    const portfolios = await Portfolio.find({ status: 'approved' })
      .populate('user', 'username email avatarUrl')
      .populate('task', 'title type')
      .sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getPortfoliosAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const portfolios = await Portfolio.find()
      .populate('user', 'username email avatarUrl')
      .populate('task', 'title type')
      .sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getPortfolioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findById(id)
      .populate('user', 'username email avatarUrl')
      .populate('task', 'title type');
    if (!portfolio || portfolio.status !== 'approved') {
      res.status(404).json({ message: '作品不存在或未发布' });
      return;
    }
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findByIdAndDelete(id);

    if (!portfolio) {
      res.status(404).json({ message: '作品不存在' });
      return;
    }

    res.json({ message: '作品已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const approvePortfolio = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: '没有权限执行此操作' });
      return;
    }
    const { id } = req.params;
    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    )
      .populate('user', 'username email avatarUrl')
      .populate('task', 'title type');
    if (!portfolio) {
      res.status(404).json({ message: '作品不存在' });
      return;
    }

    if (portfolio.task && portfolio.user && (portfolio.user as any)._id) {
      try {
        const task = await Task.findById((portfolio.task as any)._id || portfolio.task);
        if (task) {
          const userId = (portfolio.user as any)._id;
          const assignment: any = task.assignees.find(
            (a: any) => a.user.toString() === userId.toString()
          );
          if (assignment) {
            assignment.status = 'approved';
            await task.save();
          }
        }
      } catch (err) {
        console.error('更新任务通过状态失败', err);
      }
    }
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const { id } = req.params;
    const existing = await Favorite.findOne({ user: req.user._id, portfolio: id });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      res.json({ favorited: false });
      return;
    }
    await Favorite.create({ user: req.user._id, portfolio: id });
    res.json({ favorited: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getMyFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'portfolio',
        populate: { path: 'user', select: 'username email avatarUrl' }
      })
      .sort({ createdAt: -1 });
    const portfolios = favorites
      .map((f) => f.portfolio)
      .filter((p) => p);
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getMyPortfolios = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const portfolios = await Portfolio.find({ user: req.user._id })
      .populate('user', 'username email avatarUrl')
      .sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
