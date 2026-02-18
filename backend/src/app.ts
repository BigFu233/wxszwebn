import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/authRoutes';
import siteSettingRoutes from './routes/siteSettingRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Helmet setup - allow cross-origin resource sharing for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/settings', siteSettingRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Infinite Photography Club API');
});

export default app;