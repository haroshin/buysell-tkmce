import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brokerAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  platformFee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Requested'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
