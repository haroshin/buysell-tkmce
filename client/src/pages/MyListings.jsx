import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiRotateCcw,
  FiMapPin,
  FiClock,
  FiEye,
  FiPlus,
  FiPackage,
  FiFilter,
  FiAlertCircle,
} from 'react-icons/fi';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'sold'
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/users/my-listings${params}`);
      setListings(data.listings);
    } catch (error) {
      console.error('Failed to fetch listings', error);
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSold = async (listingId) => {
    try {
      const { data } = await api.put(`/listings/${listingId}/sold`);
      toast.success(data.message);
      fetchListings();
    } catch (error) {
      console.error('Failed to toggle sold status', error);
      toast.error('Something went wrong');
    }
  };

  const confirmDelete = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    setDeletingId(listingToDelete._id);

    try {
      await api.delete(`/listings/${listingToDelete._id}`);
      toast.success('Listing deleted');
      setListings((prev) => prev.filter((l) => l._id !== listingToDelete._id));
    } catch (error) {
      console.error('Failed to delete listing', error);
      toast.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setListingToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image';

  const filterTabs = [
    { key: 'all', label: 'All', count: null },
    { key: 'active', label: 'Active', count: null },
    { key: 'sold', label: 'Sold', count: null },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="page-container max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                <FiPackage className="text-xl text-primary-400" />
              </div>
              My Listings
            </h1>
            <p className="text-dark-400 mt-2 ml-[52px]">
              Manage and track all your marketplace posts
            </p>
          </div>
          <Link to="/sell" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus className="text-lg" /> New Listing
          </Link>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-2 mb-8"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25'
                  : 'bg-dark-800 text-dark-300 border border-dark-700 hover:text-white hover:border-dark-500'
              }`}
              id={`filter-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-3xl text-dark-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? "You haven't posted any listings yet" : `No ${filter} listings`}
            </h3>
            <p className="text-dark-400 mb-6">
              {filter === 'all' ? 'Start selling by creating your first listing!' : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <Link to="/sell" className="btn-primary inline-flex items-center gap-2">
                <FiPlus /> Create Listing
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, idx) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`glass-card overflow-hidden ${listing.isSold ? 'opacity-75' : ''}`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <Link
                    to={`/listing/${listing._id}`}
                    className="sm:w-48 sm:h-36 aspect-video sm:aspect-auto flex-shrink-0 bg-dark-800 overflow-hidden"
                  >
                    <img
                      src={listing.images?.[0] || defaultImage}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <Link
                          to={`/listing/${listing._id}`}
                          className="text-lg font-bold text-white hover:text-primary-400 transition-colors truncate"
                        >
                          {listing.title}
                        </Link>
                        {listing.isSold && (
                          <span className="badge-sold whitespace-nowrap">Sold</span>
                        )}
                        {listing.isNegotiable && !listing.isSold && (
                          <span className="badge-negotiable whitespace-nowrap">Negotiable</span>
                        )}
                      </div>

                      <p className="text-2xl font-black text-accent-400 mb-3">₹{listing.price}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-400">
                        <span className="flex items-center gap-1.5">
                          <FiMapPin className="text-dark-500" /> {listing.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiClock className="text-dark-500" /> {formatDate(listing.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiEye className="text-dark-500" /> {listing.views} views
                        </span>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-primary-500/10 text-primary-400 rounded-full text-xs font-medium">
                          {listing.category}
                        </span>
                        <span className="px-2.5 py-0.5 bg-dark-700 text-dark-300 rounded-full text-xs font-medium">
                          {listing.condition}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:justify-center">
                      <Link
                        to={`/edit-listing/${listing._id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-white border border-dark-600 transition-all duration-300 text-xs font-medium"
                        title="Edit"
                      >
                        <FiEdit3 className="text-sm" /> Edit
                      </Link>

                      <button
                        onClick={() => handleToggleSold(listing._id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-300 text-xs font-medium ${
                          listing.isSold
                            ? 'bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 border-accent-500/20'
                            : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                        }`}
                        title={listing.isSold ? 'Mark as Available' : 'Mark as Sold'}
                      >
                        {listing.isSold ? (
                          <><FiRotateCcw className="text-sm" /> Relist</>
                        ) : (
                          <><FiCheckCircle className="text-sm" /> Sold</>
                        )}
                      </button>

                      <button
                        onClick={() => confirmDelete(listing)}
                        disabled={deletingId === listing._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400 border border-red-500/15 transition-all duration-300 text-xs font-medium disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 className="text-sm" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overlay"
                onClick={() => setShowDeleteModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="glass-card p-8 max-w-md w-full border border-red-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                    <FiAlertCircle className="text-2xl text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">Delete Listing?</h3>
                  <p className="text-dark-400 text-center text-sm mb-6">
                    Are you sure you want to delete "<span className="text-white">{listingToDelete?.title}</span>"?
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      disabled={deletingId}
                      className="flex-1 py-2.5"
                    >
                      <FiTrash2 className="mr-2" />
                      {deletingId ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MyListings;
