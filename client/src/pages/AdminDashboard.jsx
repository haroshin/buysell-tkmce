import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiPackage, FiAlertOctagon, FiTrendingUp, 
  FiTrash2, FiShield, FiShieldOff, FiCheck, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/common/SEO';
import Button from '../components/common/Button';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchReports();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports?status=pending');
      setReports(data.reports);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      toast.success(data.message);
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: data.user.isBanned } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}`, { status });
      toast.success(`Report marked as ${status}`);
      setReports(reports.filter(r => r._id !== reportId));
      fetchStats();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await api.delete(`/admin/listings/${listingId}`);
      toast.success('Listing deleted');
      // If it was attached to a report, remove the report from view
      setReports(reports.filter(r => r.reportedListing?._id !== listingId));
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: FiPackage, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
    { label: 'Sold Items', value: stats?.soldListings || 0, icon: FiTrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
    { label: 'Pending Reports', value: stats?.activeReports || 0, icon: FiAlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO title="Admin Dashboard" description="Manage the Buy&Sell TKMCE platform" />
      <div className="page-container max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-dark-400">Platform overview and moderation tools</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          {['overview', 'users', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
              <div key={idx} className={`glass-card p-6 border ${stat.border}`}>
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`text-2xl ${stat.color}`} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-dark-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden border border-dark-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    <th className="p-4 text-sm font-semibold text-dark-300">User</th>
                    <th className="p-4 text-sm font-semibold text-dark-300">Department</th>
                    <th className="p-4 text-sm font-semibold text-dark-300">Role</th>
                    <th className="p-4 text-sm font-semibold text-dark-300">Status</th>
                    <th className="p-4 text-sm font-semibold text-dark-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover bg-dark-700" />
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-dark-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-dark-300">{u.department || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-accent-500/20 text-accent-400'}`}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(u._id)}
                            className={`p-2 rounded-lg transition-colors ${u.isBanned ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                            title={u.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            {u.isBanned ? <FiShield /> : <FiShieldOff />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-8 text-center text-dark-400">No users found.</div>}
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {reports.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-2xl text-accent-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                <p className="text-dark-400">There are no pending reports to review.</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report._id} className="glass-card p-6 border border-red-500/20">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
                          Report
                        </span>
                        <span className="text-dark-400 text-sm">
                          By <span className="text-dark-200">{report.reporter?.name}</span>
                        </span>
                      </div>
                      
                      <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700 mb-4">
                        <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">"{report.reason}"</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {report.reportedListing && (
                          <div className="flex items-center gap-2 text-dark-300">
                            <FiPackage className="text-primary-400" /> 
                            Target Listing: <a href={`/listing/${report.reportedListing._id}`} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">{report.reportedListing.title}</a>
                          </div>
                        )}
                        {report.reportedUser && (
                          <div className="flex items-center gap-2 text-dark-300">
                            <FiUsers className="text-accent-400" /> 
                            Target User: <span className="text-white">{report.reportedUser.name}</span>
                            {report.reportedUser.isBanned && <span className="text-red-400 text-xs">(Banned)</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="lg:w-48 flex flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-dark-700 pt-4 lg:pt-0 lg:pl-6">
                      <p className="text-xs text-dark-500 font-medium mb-1">Moderation Actions</p>
                      {report.reportedListing && (
                        <Button variant="danger" className="w-full text-xs py-2" onClick={() => handleDeleteListing(report.reportedListing._id)}>
                          <FiTrash2 /> Delete Listing
                        </Button>
                      )}
                      {report.reportedUser && !report.reportedUser.isBanned && (
                        <Button variant="outline" className="w-full text-xs py-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleToggleBan(report.reportedUser._id)}>
                          <FiShieldOff /> Ban User
                        </Button>
                      )}
                      <div className="h-px bg-dark-700 my-1 w-full" />
                      <Button variant="outline" className="w-full text-xs py-2 border-accent-500/30 text-accent-400 hover:bg-accent-500/10" onClick={() => handleResolveReport(report._id, 'resolved')}>
                        <FiCheck /> Mark Resolved
                      </Button>
                      <Button variant="ghost" className="w-full text-xs py-2" onClick={() => handleResolveReport(report._id, 'dismissed')}>
                        <FiX /> Dismiss Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
