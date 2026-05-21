import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { DEPARTMENTS, A_B_SECTION_DEPARTMENTS, SINGLE_SECTION_DEPARTMENTS, NO_SECTION_DEPARTMENTS } from '../utils/constants';
import {
  FiEdit3,
  FiPackage,
  FiHeart,
  FiCheckCircle,
  FiCalendar,
  FiMail,
  FiPhone,
  FiBook,
  FiSave,
  FiX,
  FiTrendingUp,
  FiShoppingBag,
  FiAward,
  FiLock,
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    department: '',
    passoutYear: '',
    section: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const hasMultipleSections = editForm.department === 'Mechanical Engineering';
  const hasABSections = A_B_SECTION_DEPARTMENTS.has(editForm.department);
  const isSingleSection = SINGLE_SECTION_DEPARTMENTS.has(editForm.department);
  const showSectionPicker = editForm.department && editForm.department !== 'MTech';

  // Auto-set/reset section when department changes
  useEffect(() => {
    if (!isEditing) return;
    const hasMultiple = editForm.department === 'Mechanical Engineering';
    const hasAB = A_B_SECTION_DEPARTMENTS.has(editForm.department);
    const isSingle = SINGLE_SECTION_DEPARTMENTS.has(editForm.department);

    if (hasMultiple || hasAB) {
      if (editForm.section !== 'A' && editForm.section !== 'B' && !(hasMultiple && editForm.section === 'C')) {
        setEditForm(prev => ({ ...prev, section: '' }));
      }
    } else if (isSingle) {
      setEditForm(prev => ({ ...prev, section: 'A' }));
    } else {
      setEditForm(prev => ({ ...prev, section: 'None' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.department, isEditing]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfileData(data.user);
      setStats(data.stats);
      setEditForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        department: data.user.department || '',
        passoutYear: data.user.passoutYear || '',
        section: data.user.section || 'None',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (showSectionPicker && !editForm.section) {
      toast.error('Please select your section');
      setSaving(false);
      return;
    }

    try {
      const submitData = { ...editForm };
      
      // If user attempted to type anything in password fields
      if (showPasswordFields && (editForm.currentPassword || editForm.newPassword || editForm.confirmNewPassword)) {
        if (!editForm.currentPassword) {
          toast.error('Please enter your current password');
          setSaving(false);
          return;
        }
        if (!editForm.newPassword) {
          toast.error('Please enter a new password');
          setSaving(false);
          return;
        }
        if (editForm.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters');
          setSaving(false);
          return;
        }
        if (editForm.newPassword !== editForm.confirmNewPassword) {
          toast.error('New passwords do not match');
          setSaving(false);
          return;
        }
      } else {
        // Remove password fields so we don't send empty/unchanged credentials to backend
        delete submitData.currentPassword;
        delete submitData.newPassword;
        delete submitData.confirmNewPassword;
      }

      const { data } = await api.put('/users/profile', submitData);
      setProfileData(data.user);
      updateUser(data.user);
      setIsEditing(false);
      setShowPasswordFields(false);
      setEditForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    if (profileData) {
      setEditForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        passoutYear: profileData.passoutYear || '',
        section: profileData.section || 'None',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const userData = profileData || user;

  const statCards = [
    {
      label: 'Total Listings',
      value: stats?.totalListings || 0,
      icon: FiPackage,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/20',
      textColor: 'text-primary-400',
    },
    {
      label: 'Active',
      value: stats?.activeListing || 0,
      icon: FiTrendingUp,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-500/10',
      borderColor: 'border-accent-500/20',
      textColor: 'text-accent-400',
    },
    {
      label: 'Sold',
      value: stats?.soldListings || 0,
      icon: FiShoppingBag,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-500/10',
      borderColor: 'border-accent-500/20',
      textColor: 'text-accent-400',
    },
    {
      label: 'Wishlist',
      value: stats?.wishlistCount || 0,
      icon: FiHeart,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/20',
      textColor: 'text-primary-400',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="page-container max-w-5xl">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-primary-500 p-[3px]">
                <img
                  src={userData?.avatar}
                  alt={userData?.name}
                  className="w-full h-full rounded-2xl object-cover bg-dark-800"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-500 border-2 border-dark-900 flex items-center justify-center">
                <FiCheckCircle className="text-white text-xs" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{userData?.name}</h1>
                  <p className="text-dark-400 text-sm flex items-center gap-2">
                    <FiMail className="text-primary-500" />
                    {userData?.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 bg-primary-500/15 text-primary-400 rounded-full text-xs font-semibold border border-primary-500/25 flex items-center gap-1.5">
                      <FiAward className="text-sm" />
                      {userData?.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                    {userData?.department && (
                      <span className="px-3 py-1 bg-dark-700 text-dark-200 rounded-full text-xs font-semibold border border-dark-600 flex items-center gap-1.5">
                        <FiBook className="text-sm" />
                        {userData.department}
                        {userData.section && userData.section !== 'None' ? ` (Sec ${userData.section})` : ''}
                      </span>
                    )}
                    {userData?.passoutYear && (
                      <span className="px-3 py-1 bg-dark-700 text-dark-200 rounded-full text-xs font-semibold border border-dark-600">
                        Batch of {userData.passoutYear}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-white border border-dark-600 transition-all duration-300 text-sm font-medium"
                >
                  {isEditing ? <FiX className="text-lg" /> : <FiEdit3 className="text-lg" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-dark-400">
                {userData?.phone && (
                  <span className="flex items-center gap-1.5">
                    <FiPhone className="text-primary-500" /> {userData.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="text-primary-500" />
                  Joined {formatDate(userData?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat, idx) => (
            <div
              key={stat.label}
              className={`glass-card p-5 ${stat.borderColor} border flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-dark-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit3 className="text-primary-500" /> Edit Profile
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  id="edit-name"
                />
                <Input
                  label="Phone Number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  id="edit-phone"
                />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                    id="edit-department"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                 <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Passout Year</label>
                  <select
                    value={editForm.passoutYear}
                    onChange={(e) => setEditForm({ ...editForm, passoutYear: e.target.value })}
                    className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                    id="edit-passoutYear"
                  >
                    <option value="">Select Passout Year</option>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
                {showSectionPicker && (
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Section</label>
                    <select
                      value={editForm.section}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      id="edit-section"
                      required
                      disabled={isSingleSection}
                    >
                      {isSingleSection ? (
                        <option value="A">Section A</option>
                      ) : (
                        <>
                          <option value="">Select Section</option>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          {hasMultipleSections && (
                            <option value="C">Section C</option>
                          )}
                        </>
                      )}
                    </select>
                    {isSingleSection && (
                      <p className="text-xs text-primary-400 font-medium">
                        Section A is auto-assigned for this department.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Change Password Section */}
              <div className="border-t border-slate-700/60 pt-5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <FiLock className="text-primary-500" />
                  {showPasswordFields ? 'Hide Password Settings' : 'Change Password'}
                </button>

                {showPasswordFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4 pt-1"
                  >
                    <Input
                      type="password"
                      label="Current Password"
                      value={editForm.currentPassword}
                      onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      id="edit-current-password"
                    />
                    <Input
                      type="password"
                      label="New Password"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      id="edit-new-password"
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      value={editForm.confirmNewPassword}
                      onChange={(e) => setEditForm({ ...editForm, confirmNewPassword: e.target.value })}
                      placeholder="••••••••"
                      id="edit-confirm-new-password"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="px-6 py-2.5">
                  <FiSave className="mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <Link
            to="/my-listings"
            className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
              <FiPackage className="text-xl text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">My Listings</h3>
              <p className="text-dark-400 text-sm">Manage your posts</p>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="glass-card p-6 hover:border-accent-500/30 transition-all duration-300 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
              <FiHeart className="text-xl text-accent-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold group-hover:text-accent-400 transition-colors">Wishlist</h3>
              <p className="text-dark-400 text-sm">Saved items</p>
            </div>
          </Link>

          <Link
            to="/sell"
            className="glass-card p-6 hover:border-accent-500/30 transition-all duration-300 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
              <FiShoppingBag className="text-xl text-accent-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold group-hover:text-accent-400 transition-colors">Sell an Item</h3>
              <p className="text-dark-400 text-sm">Create new listing</p>
            </div>
          </Link>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-500/8 hover:bg-red-500/15 text-red-400 rounded-xl transition-all duration-300 border border-red-500/15 hover:border-red-500/30 font-semibold text-sm"
            id="logout-button"
          >
            Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
