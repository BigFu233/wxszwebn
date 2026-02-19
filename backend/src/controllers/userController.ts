import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getPublicMembers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: { $in: ['member', 'admin'] } })
      .select('username email role avatarUrl createdAt phone')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }
    const { username, email, phone } = req.body;
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingEmail) {
        res.status(400).json({ message: '邮箱已被注册' });
        return;
      }
    }
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUsername) {
        res.status(400).json({ message: '用户名已被占用' });
        return;
      }
    }
    const update: any = {};
    if (username !== undefined) {
      update.username = username;
    }
    if (email !== undefined) {
      update.email = email;
    }
    if (phone !== undefined) {
      update.phone = phone;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true }
    ).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: '请先登录' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: '请上传文件' });
      return;
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const uploadAvatarForUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: '没有权限执行此操作' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: '请上传文件' });
      return;
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const createUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: '请填写完整的用户信息' });
      return;
    }

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      res.status(400).json({ message: '邮箱已被注册' });
      return;
    }

    const existingUserUsername = await User.findOne({ username });
    if (existingUserUsername) {
      res.status(400).json({ message: '用户名已被占用' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'member'
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ message: '请选择角色' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
