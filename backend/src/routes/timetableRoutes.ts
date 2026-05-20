import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getTimetable, saveTimetable } from '../controllers/timetableController.js';

const router = express.Router();

// Get timetable for a specific class (accessible to all authenticated users)
router.get('/:className', authenticate, getTimetable);

// Save/Update timetable for a class (admin only)
router.put('/:className', authenticate, authorize('admin'), saveTimetable);

export default router;
