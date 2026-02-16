import { Response } from 'express';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

export const getClassStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classes = await Class.find();
    
    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = cls.students ? cls.students.length : 0;
        
        return {
          id: cls._id,
          class: cls.name,
          grade: cls.grade,
          section: cls.section,
          total: studentCount,
          paid: 0, // Placeholder - implement when payment system is ready
          paid_half: 0, // Placeholder
          paid_nothing: studentCount, // Default all to unpaid for now
          starterpack_collected: 0, // Placeholder
          academicYear: cls.academicYear,
        };
      })
    );
    
    res.json({ classStats });
  } catch (error: any) {
    console.error('Error fetching class stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassStatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const cls = await Class.findById(id).populate('students');
    
    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    const studentCount = cls.students ? cls.students.length : 0;
    
    const classStat = {
      id: cls._id,
      class: cls.name,
      grade: cls.grade,
      section: cls.section,
      total: studentCount,
      paid: 0, // Placeholder - implement when payment system is ready
      paid_half: 0, // Placeholder
      paid_nothing: studentCount, // Default all to unpaid for now
      starterpack_collected: 0, // Placeholder
      academicYear: cls.academicYear,
      subjects: cls.subjects,
      teacher: cls.teacher,
    };
    
    res.json({ classStat });
  } catch (error: any) {
    console.error('Error fetching class stat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
