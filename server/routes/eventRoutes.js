import express from 'express';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getPendingEvents, 
  verifyEvent 
} from '../controllers/eventController.js';
import { protect, admin, agentOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, admin, createEvent);

router.route('/pending')
  .get(protect, agentOrAdmin, getPendingEvents);

router.route('/:id/verify')
  .put(protect, agentOrAdmin, verifyEvent);

router.route('/:id')
  .put(protect, admin, updateEvent)
  .delete(protect, admin, deleteEvent);

export default router;
