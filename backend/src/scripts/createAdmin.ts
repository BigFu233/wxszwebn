import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/wxszweb';
    console.log(`Connecting to MongoDB at ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const adminUsername = 'admin';
    const adminEmail = 'admin@wxszweb.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [{ username: adminUsername }, { email: adminEmail }] 
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin' as UserRole
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();