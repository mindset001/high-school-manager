import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizSubmissions,
  getStudentQuizAttempts
} from '../controllers/quizController.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'staff'), createQuiz);
router.get('/', authenticate, getQuizzes);
router.get('/:id', authenticate, getQuizById);
router.post('/:id/submit', authenticate, submitQuiz);
router.get('/:id/submissions', authenticate, authorize('admin', 'staff'), getQuizSubmissions);
router.get('/student/:studentId', authenticate, getStudentQuizAttempts);

export default router;
