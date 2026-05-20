import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAttendance, saveAttendance, getStudentAttendance, getStaffAttendance, saveStaffAttendance, getClassAttendanceReport, getStaffAttendanceReport } from '../controllers/attendanceController.js';

const router = express.Router();

// Report routes
router.get('/report/class/:className', authenticate, authorize('admin', 'staff'), getClassAttendanceReport);
router.get('/report/staff', authenticate, authorize('admin'), getStaffAttendanceReport);

// Staff/Admin routes for class attendance
router.get('/staff/:date', authenticate, authorize('admin'), getStaffAttendance);
router.post('/staff/:date', authenticate, authorize('admin'), saveStaffAttendance);

// Staff/Admin routes for class attendance
router.get('/:className/:date', authenticate, authorize('admin', 'staff'), getAttendance);
router.post('/:className/:date', authenticate, authorize('admin', 'staff'), saveAttendance);

// Guardian/Student routes for personal attendance history
router.get('/student/:studentId', authenticate, getStudentAttendance);

export default router;
