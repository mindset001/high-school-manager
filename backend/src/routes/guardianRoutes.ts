import { Router } from 'express';
import {
  getAllGuardians,
  getGuardianById,
  createGuardian,
  updateGuardian,
  deleteGuardian,
  getGuardianWards,
  getGuardianWardById,
} from '../controllers/guardianController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Ward (student) routes for guardians - must come before /:id route
router.get('/ward', authorize('guardian'), getGuardianWards);
router.get('/wards', authorize('guardian'), getGuardianWards);
router.get('/ward/:id', authorize('guardian'), getGuardianWardById);

// General guardian routes
router.get('/', authorize('admin', 'staff'), getAllGuardians);
router.get('/:id', authorize('admin', 'staff', 'guardian'), getGuardianById);
router.post('/', authorize('admin'), createGuardian);
router.put('/:id', authorize('admin', 'guardian'), updateGuardian);
router.delete('/:id', authorize('admin'), deleteGuardian);

export default router;
