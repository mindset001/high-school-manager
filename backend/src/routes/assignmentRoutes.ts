import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import {
  getAssignments,
  createAssignment,
  getSubmissions,
  getStudentSubmission,
  submitAssignment,
  gradeSubmission
} from '../controllers/assignmentController.js';

const router = express.Router();

// Get assignments (accessible to all authenticated users)
router.get('/', authenticate, getAssignments);

// Create assignment (staff/admin only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'staff'),
  upload.single('file'),
  createAssignment
);

// Get submissions for an assignment
router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorize('admin', 'staff'),
  getSubmissions
);

// Get specific student's submission
router.get(
  '/:assignmentId/submissions/:studentId',
  authenticate,
  getStudentSubmission
);

// Submit an assignment (students/guardians)
router.post(
  '/submit',
  authenticate,
  upload.single('file'),
  submitAssignment
);

// Grade a submission (staff/admin only)
router.put(
  '/submissions/:submissionId/grade',
  authenticate,
  authorize('admin', 'staff'),
  gradeSubmission
);

export default router;
