import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';

// @desc    Get all transactions assigned to the logged-in agent/admin
// @route   GET /api/agent/transactions
// @access  Private/Agent
export const getActiveTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ brokerAgent: req.user._id })
      .populate('listing', 'title images price category')
      .populate('buyer', 'name avatar department passoutYear section')
      .populate('seller', 'name avatar department')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a transaction's status
// @route   PUT /api/agent/transactions/:id
// @access  Private/Agent
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Requested', 'In Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Ensure only the assigned agent or an admin can update this
    if (
      transaction.brokerAgent.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized to update this transaction' });
    }

    transaction.status = status;

    if (status === 'Completed') {
      transaction.completedAt = new Date();

      // Mark the listing as sold
      await Listing.findByIdAndUpdate(transaction.listing, {
        isSold: true,
        soldAt: new Date()
      });
    }

    await transaction.save();

    res.json({
      message: `Transaction marked as ${status}`,
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get summary stats for the agent dashboard
// @route   GET /api/agent/stats
// @access  Private/Agent
export const getAgentStats = async (req, res) => {
  try {
    const agentId = req.user._id;

    const requested = await Transaction.countDocuments({ brokerAgent: agentId, status: 'Requested' });
    const inProgress = await Transaction.countDocuments({ brokerAgent: agentId, status: 'In Progress' });
    const completed = await Transaction.countDocuments({ brokerAgent: agentId, status: 'Completed' });

    const completedTransactions = await Transaction.find({ brokerAgent: agentId, status: 'Completed' });
    const totalFeesCollected = completedTransactions.reduce((sum, t) => sum + t.platformFee, 0);

    res.json({ requested, inProgress, completed, totalFeesCollected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
