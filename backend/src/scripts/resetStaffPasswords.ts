import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/User.js';

async function resetStaffPasswords() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Staff@123', 10);
    
    // Find all users with role 'staff'
    const result = await User.updateMany(
      { role: 'staff' },
      { $set: { password: hashedPassword } }
    );

    console.log(`Successfully reset passwords for ${result.modifiedCount} staff members to Staff@123`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetStaffPasswords();
