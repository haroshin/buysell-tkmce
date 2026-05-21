import Transaction from '../models/Transaction.js';

// @desc    Blocks users with overdue pending fees from creating listings or messaging
export const checkPendingFees = async (req, res, next) => {
  try {
    if (req.user.role === 'agent' || req.user.role === 'admin') {
      return next(); // Agents and admins are never blocked
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const overdueTransaction = await Transaction.findOne({
      buyer: req.user._id,
      status: { $in: ['Requested', 'In Progress'] },
      createdAt: { $lt: sevenDaysAgo }
    });

    if (overdueTransaction) {
      return res.status(403).json({
        message:
          'You have an overdue platform fee. Please contact your class agent to complete your pending transaction before proceeding.'
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
