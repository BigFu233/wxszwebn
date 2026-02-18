import { Request } from 'express';
import { IUser } from '../models/User';

export type UserRole = 'guest' | 'member' | 'admin';

export interface AuthRequest extends Request {
  user?: Partial<IUser>;
}