import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone } = req.body;

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
      phone,
      role: 'guest' as UserRole
    });

    res.status(201).json({ message: '注册成功', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // Identifier can be email or username

    let user = await User.findOne({ email: identifier });
    if (!user) {
      user = await User.findOne({ username: identifier });
    }

    if (!user) {
      res.status(401).json({ message: '账号或密码错误' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: '账号或密码错误' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
