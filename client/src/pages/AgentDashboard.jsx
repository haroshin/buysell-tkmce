import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import {
  FiUsers, FiPackage, FiCheckCircle, FiDollarSign,
  FiMessageSquare, FiRefreshCw, FiXCircle, FiClock
} from 'react-icons/fi';

const STATUS_COLORS = {
  Requested:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed:   'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled:   'bg-red-500/20 text-red-400 border-red-500/30',
};

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('All');
  const [updating, setUpdating]         = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, txRes] = await Promise.all([
        api.get('/agent/stats'),
        api.get('/agent/transactions'),
      ]);
      setStats(statsRes.data);
      setTransactions(txRes.data.transactions);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    setUpdating(transactionId);
    try {
      const { data } = await api.put(`/agent/transactions/${transactionId}`, { status: newStatus });
      toast.success(data.message);
      setTransactions((prev) =>
        prev.map((t) => (t._id === transactionId ? { ...t, status: newStatus } : t))
      );
      // Refresh stats
      const statsRes = await api.get('/agent/stats');
      setStats(statsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleContactSeller = (sellerId, listingId) => {
    navigate(`/messages?seller=${sellerId}&listing=${listingId}`);
  };

  const filteredTransactions = filter === 'All'
    ? transactions
    : transactions.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO title="Agent Dashboard | Buy&Sell TKMCE" description="Manage your brokered transactions." />
      <div className="page-container max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">Agent Dashboard</h1>
          <p className="text-dark-400">
            Managing transactions for{' '}
            <span className="text-primary-400 font-semibold">
              {user?.department} — {user?.section !== 'None' ? `Section ${user?.section}, ` : ''}
              Batch of {user?.passoutYear}
            </span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Requested',       value: stats.requested,        icon: FiClock,        color: 'text-yellow-400' },
              { label: 'In Progress',     value: stats.inProgress,       icon: FiRefreshCw,    color: 'text-blue-400'   },
              { label: 'Completed',       value: stats.completed,        icon: FiCheckCircle,  color: 'text-green-400'  },
              { label: 'Fees Collected',  value: `₹${stats.totalFeesCollected}`, icon: FiDollarSign, color: 'text-accent-400' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl bg-dark-800 ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-dark-400 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Requested', 'In Progress', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                filter === f
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-dark-800 text-dark-300 border-dark-700 hover:border-primary-500/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="glass-card p-12 text-center text-dark-400">
            <FiPackage size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No transactions found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx, idx) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                  {/* Listing Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={tx.listing?.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={tx.listing?.title}
                      className="w-16 h-16 rounded-xl object-cover border border-dark-700 flex-shrink-0"
                    />
                    <div>
                      <p className="text-white font-semibold">{tx.listing?.title}</p>
                      <p className="text-accent-400 font-bold">₹{tx.listing?.price}</p>
                      <p className="text-dark-400 text-sm">
                        Platform Fee: <span className="text-green-400 font-semibold">₹{tx.platformFee}</span>
                      </p>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <img
                      src={tx.buyer?.avatar}
                      alt={tx.buyer?.name}
                      className="w-10 h-10 rounded-full border border-dark-700"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{tx.buyer?.name}</p>
                      <p className="text-dark-400 text-xs">
                        {tx.buyer?.department} · {tx.buyer?.section !== 'None' ? `Sec ${tx.buyer?.section}` : ''} · {tx.buyer?.passoutYear}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[tx.status]}`}>
                    {tx.status}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {tx.status === 'Requested' && (
                      <>
                        <button
                          onClick={() => handleContactSeller(tx.seller?._id, tx.listing?._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-sm hover:bg-primary-500/30 transition-colors"
                        >
                          <FiMessageSquare size={14} /> Contact Seller
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tx._id, 'In Progress')}
                          disabled={updating === tx._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                        >
                          <FiRefreshCw size={14} /> Start Deal
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tx._id, 'Cancelled')}
                          disabled={updating === tx._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                          <FiXCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {tx.status === 'In Progress' && (
                      <>
                        <button
                          onClick={() => handleContactSeller(tx.seller?._id, tx.listing?._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-sm hover:bg-primary-500/30 transition-colors"
                        >
                          <FiMessageSquare size={14} /> Contact Seller
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tx._id, 'Completed')}
                          disabled={updating === tx._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          <FiCheckCircle size={14} /> Mark Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
