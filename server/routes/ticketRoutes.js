import express from 'express';
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  replyToTicket,
} from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.route('/').post(protect, createTicket);
router.route('/mine').get(protect, getMyTickets);

// Admin routes
router.route('/').get(protect, admin, getAllTickets);
router.route('/:id/reply').put(protect, admin, replyToTicket);

export default router;
