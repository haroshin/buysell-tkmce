import express from 'express';
import {
  submitReport,
  getReports,
  updateReportStatus
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Publicly authenticated routes
router.route('/').post(protect, submitReport);

// Admin-only routes
router.route('/').get(protect, admin, getReports);
router.route('/:id').put(protect, admin, updateReportStatus);

export default router;
