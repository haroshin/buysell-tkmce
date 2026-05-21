import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserBan,
  getAllListings,
  deleteListing
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect, admin);

router.route('/stats').get(getDashboardStats);
router.route('/users').get(getAllUsers);
router.route('/users/:id/ban').put(toggleUserBan);
router.route('/listings').get(getAllListings);
router.route('/listings/:id').delete(deleteListing);

export default router;
