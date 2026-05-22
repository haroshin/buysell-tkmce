import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiPackage, FiAlertOctagon, FiTrendingUp, 
  FiTrash2, FiShield, FiShieldOff, FiCheck, FiX,
  FiMessageSquare, FiChevronDown, FiChevronUp, FiSend,
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
  const [tickets, setTickets] = useState([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replyForms, setReplyForms] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchReports();
    fetchTickets();
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

  const fetchTickets = async (status = 'all') => {
    try {
      const query = status !== 'all' ? `?status=${status}` : '';
      const { data } = await api.get(`/tickets${query}`);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTicketFilterChange = (status) => {
    setTicketStatusFilter(status);
    fetchTickets(status);
  };

  const handleReplyChange = (ticketId, field, value) => {
    setReplyForms(prev => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], [field]: value },
    }));
  };

  const handleReplySubmit = async (ticketId) => {
    const form = replyForms[ticketId] || {};
    if (!form.adminReply?.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    setReplySubmitting(prev => ({ ...prev, [ticketId]: true }));
    try {
      const { data } = await api.put(`/tickets/${ticketId}/reply`, {
        status: form.status || 'in_progress',
        adminReply: form.adminReply,
      });
      toast.success('Reply sent successfully!');
      setTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
      setReplyForms(prev => ({ ...prev, [ticketId]: { adminReply: '', status: '' } }));
      setExpandedTicket(null);
      fetchStats();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplySubmitting(prev => ({ ...prev, [ticketId]: false }));
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
    { label: 'Open Tickets', value: stats?.openTickets || 0, icon: FiMessageSquare, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
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
          {['overview', 'users', 'reports', 'tickets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {tab === 'tickets' ? `Tickets${stats?.openTickets ? ` (${stats.openTickets})` : ''}` : tab}
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

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open', cls: 'text-blue-400' },
                { value: 'in_progress', label: 'In Progress', cls: 'text-amber-400' },
                { value: 'resolved', label: 'Resolved', cls: 'text-emerald-400' },
                { value: 'closed', label: 'Closed', cls: 'text-dark-400' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleTicketFilterChange(f.value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                    ticketStatusFilter === f.value
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-500 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {tickets.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="text-2xl text-dark-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No tickets found</h3>
                <p className="text-dark-400">There are no support tickets matching this filter.</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const STATUS_STYLES = {
                  open: { label: 'Open', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
                  in_progress: { label: 'In Progress', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
                  resolved: { label: 'Resolved', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
                  closed: { label: 'Closed', cls: 'bg-dark-700 text-dark-400 border-dark-600' },
                };
                const CATEGORY_LABELS = {
                  account: 'Account Issue', listing: 'Listing Problem',
                  payment: 'Payment & Fees', agent: 'Agent Issue', other: 'Other',
                };
                const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };
                const statusInfo = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
                const isExpanded = expandedTicket === ticket._id;
                const replyForm = replyForms[ticket._id] || { adminReply: '', status: ticket.status };

                return (
                  <div key={ticket._id} className="glass-card overflow-hidden border border-dark-700">
                    {/* Ticket Header */}
                    <button
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket._id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-dark-800/30 transition-colors"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <img src={ticket.user?.avatar} alt={ticket.user?.name} className="w-10 h-10 rounded-full object-cover bg-dark-700 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{ticket.subject}</p>
                          <p className="text-dark-400 text-xs mt-0.5">
                            {ticket.user?.name} · {CATEGORY_LABELS[ticket.category] || ticket.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.cls}`}>{statusInfo.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          ticket.priority === 'high' ? 'text-red-400 border-red-500/30 bg-red-500/10'
                          : ticket.priority === 'medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}>{PRIORITY_LABELS[ticket.priority]}</span>
                        {isExpanded ? <FiChevronUp className="text-dark-400" /> : <FiChevronDown className="text-dark-400" />}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-dark-700 p-5 space-y-4">
                        {/* User's message */}
                        <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                          <p className="text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-2">Student's Message</p>
                          <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        </div>

                        {/* Existing reply */}
                        {ticket.adminReply && (
                          <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-2">Your Previous Reply</p>
                            <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">{ticket.adminReply}</p>
                          </div>
                        )}

                        {/* Reply form */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-dark-300 uppercase tracking-wider">Reply & Update Status</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <textarea
                                value={replyForm.adminReply || ''}
                                onChange={(e) => handleReplyChange(ticket._id, 'adminReply', e.target.value)}
                                placeholder="Type your reply to the student..."
                                rows={3}
                                className="w-full bg-dark-900 border border-dark-600 text-dark-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-dark-500 transition-all resize-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold text-dark-400">Set Status</label>
                              <select
                                value={replyForm.status || ticket.status}
                                onChange={(e) => handleReplyChange(ticket._id, 'status', e.target.value)}
                                className="bg-dark-900 border border-dark-600 text-dark-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 transition-all"
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleReplySubmit(ticket._id)}
                                disabled={replySubmitting[ticket._id]}
                                className="btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
                              >
                                {replySubmitting[ticket._id] ? 'Sending...' : <><FiSend className="text-sm" /> Send Reply</>}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
