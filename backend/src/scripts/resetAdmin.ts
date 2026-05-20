import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models/User';

async function reset() {
  try {
    await mongoose.connect(config.mongodb.uri);
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.updateOne({ email: 'admin@school.com' }, { password: hashedPassword });
    console.log('Password for admin@school.com reset to Admin@123');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}
reset();
