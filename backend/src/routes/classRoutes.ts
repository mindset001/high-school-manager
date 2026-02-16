import { Router } from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getStudentsByClass,
} from '../controllers/classController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'staff', 'student', 'guardian'), getAllClasses);
router.get('/:id', authorize('admin', 'staff', 'student', 'guardian'), getClassById);
router.get('/:id/students', authorize('admin', 'staff'), getStudentsByClass);
router.get('/:id/student', authorize('admin', 'staff'), getStudentsByClass);
router.post('/', authorize('admin'), createClass);
router.put('/:id', authorize('admin', 'staff'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);
router.post('/:id/students', authorize('admin'), addStudentToClass);
router.delete('/:id/students/:studentId', authorize('admin'), removeStudentFromClass);

export default router;
