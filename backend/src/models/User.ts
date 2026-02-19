import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'guest' | 'member' | 'admin';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['guest', 'member', 'admin'], default: 'guest' },
  avatarUrl: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

export interface IPortfolio extends Document {
  user: IUser['_id'];
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'photo' | 'video' | 'post_prod';
  status: 'pending' | 'approved';
  task?: ITask['_id'] | null;
  createdAt: Date;
}

const PortfolioSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  type: { type: String, enum: ['photo', 'video', 'post_prod'], required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  task: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
}, { timestamps: true });

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);

export interface ITaskAssignment {
  user: IUser['_id'];
  status: 'pending' | 'submitted' | 'approved';
}

export interface ITask extends Document {
  title: string;
  description?: string;
  deadline?: Date;
  type?: 'photo' | 'video' | 'post_prod' | 'general';
  createdBy: IUser['_id'];
  assignees: ITaskAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskAssignmentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'submitted', 'approved'], default: 'pending' }
}, { _id: false });

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  type: { type: String, enum: ['photo', 'video', 'post_prod', 'general'], default: 'general' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignees: [TaskAssignmentSchema],
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', TaskSchema);

export interface IFavorite extends Document {
  user: IUser['_id'];
  portfolio: IPortfolio['_id'];
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio', required: true },
}, { timestamps: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
