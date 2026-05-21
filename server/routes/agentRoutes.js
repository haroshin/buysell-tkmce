import express from 'express';
import {
  getActiveTransactions,
  updateTransactionStatus,
  getAgentStats
} from '../controllers/agentController.js';
import { protect, agentOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All agent routes require authentication and agent/admin role
router.use(protect, agentOrAdmin);

// @route  GET /api/agent/stats
router.get('/stats', getAgentStats);

// @route  GET /api/agent/transactions
router.get('/transactions', getActiveTransactions);

// @route  PUT /api/agent/transactions/:id
router.put('/transactions/:id', updateTransactionStatus);

export default router;
