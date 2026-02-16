import { Response } from 'express';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Guardian } from '../models/Guardian.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

export const getHomeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalStudents, totalStaffs, totalGuardians, totalClasses] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Guardian.countDocuments(),
      Class.countDocuments(),
    ]);

    res.json({
      data: {
        total_students: totalStudents,
        total_staffs: totalStaffs,
        total_guardians: totalGuardians,
        total_subject: 0, // Placeholder for subjects when implemented
        total_classes: totalClasses,
      },
    });
  } catch (error: any) {
    console.error('Error fetching home analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
