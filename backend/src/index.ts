import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});