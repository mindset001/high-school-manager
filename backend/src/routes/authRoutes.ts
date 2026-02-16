import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { body } from 'express-validator';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'staff', 'student', 'guardian']).withMessage('Invalid role'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
