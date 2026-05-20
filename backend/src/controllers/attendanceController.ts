import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance.js';
import { StaffAttendance } from '../models/StaffAttendance.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Get attendance for a specific class on a specific date
export const getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className, date } = req.params;

    let attendance = await Attendance.findOne({ class: className, date })
      .populate('records.student', 'firstName lastName studentId')
      .populate('recordedBy', 'firstName lastName');

    if (!attendance) {
      // Return empty 200 response so frontend can generate a blank sheet
      res.json(null);
      return;
    }

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save or Update attendance for a class on a specific date
export const saveAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className, date } = req.params;
    const { records } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let attendance = await Attendance.findOne({ class: className, date });

    if (attendance) {
      attendance.records = records;
      attendance.recordedBy = userId as any;
      await attendance.save();
    } else {
      attendance = new Attendance({
        class: className,
        date,
        records,
        recordedBy: userId,
      });
      await attendance.save();
    }

    // Return the updated document with populated fields
    await attendance.populate('records.student', 'firstName lastName studentId');
    res.json({ message: 'Attendance saved successfully', attendance });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all attendance records for a specific student (used by Guardian view)
export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    // We search all Attendance documents where records contains the student
    const attendances = await Attendance.find({ 'records.student': studentId })
      .sort({ date: -1 })
      .select('date class records');

    // Filter down the records array to only include the requested student
    const formattedHistory = attendances.map(att => {
      const studentRecord = att.records.find(r => r.student.toString() === studentId);
      return {
        date: att.date,
        class: att.class,
        status: studentRecord?.status,
        remarks: studentRecord?.remarks
      };
    }).filter(record => record.status); // Only return if they were actually in the records

    // Calculate stats
    const stats = {
      Present: formattedHistory.filter(r => r.status === 'Present').length,
      Absent: formattedHistory.filter(r => r.status === 'Absent').length,
      Late: formattedHistory.filter(r => r.status === 'Late').length,
      total: formattedHistory.length
    };

    res.json({ stats, history: formattedHistory });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// STAFF ATTENDANCE
// ==========================================

export const getStaffAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.params;

    let attendance = await StaffAttendance.findOne({ date })
      .populate({
        path: 'records.staff',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('recordedBy', 'firstName lastName');

    if (!attendance) {
      res.json(null);
      return;
    }

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStaffAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const { records } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let attendance = await StaffAttendance.findOne({ date });

    if (attendance) {
      attendance.records = records;
      attendance.recordedBy = userId as any;
      await attendance.save();
    } else {
      attendance = new StaffAttendance({
        date,
        records,
        recordedBy: userId,
      });
      await attendance.save();
    }

    await attendance.populate({
      path: 'records.staff',
      populate: { path: 'userId', select: 'firstName lastName email' }
    });
    
    res.json({ message: 'Staff Attendance saved successfully', attendance });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// ATTENDANCE REPORTS
// ==========================================

export const getClassAttendanceReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className } = req.params;
    const { startDate, endDate } = req.query;

    const query: any = { class: className };
    if (startDate && endDate) {
      query.date = { $gte: startDate as string, $lte: endDate as string };
    }

    const attendances = await Attendance.find(query).populate('records.student', 'firstName lastName studentId');

    const report: Record<string, any> = {};

    attendances.forEach(att => {
      att.records.forEach(record => {
        const studentId = record.student._id.toString();
        if (!report[studentId]) {
          report[studentId] = {
            student: record.student,
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }
        
        const status = record.status.toLowerCase();
        if (['present', 'absent', 'late'].includes(status)) {
          report[studentId][status]++;
        }
        report[studentId].total++;
      });
    });

    res.json({ data: Object.values(report) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStaffAttendanceReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate as string, $lte: endDate as string };
    }

    const attendances = await StaffAttendance.find(query).populate({
      path: 'records.staff',
      populate: { path: 'userId', select: 'firstName lastName email' }
    });

    const report: Record<string, any> = {};

    attendances.forEach(att => {
      att.records.forEach(record => {
        const staffId = record.staff._id.toString();
        if (!report[staffId]) {
          report[staffId] = {
            staff: record.staff,
            present: 0,
            absent: 0,
            late: 0,
            onLeave: 0,
            total: 0
          };
        }
        
        const status = record.status;
        if (status === 'Present') report[staffId].present++;
        else if (status === 'Absent') report[staffId].absent++;
        else if (status === 'Late') report[staffId].late++;
        else if (status === 'On Leave') report[staffId].onLeave++;
        
        report[staffId].total++;
      });
    });

    res.json({ data: Object.values(report) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
