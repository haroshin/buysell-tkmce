import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import ListingCard from '../components/features/ListingCard';
import {
  FiHeart,
  FiTrash2,
  FiShoppingBag,
} from 'react-icons/fi';

const Wishlist = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/users/wishlist');
      setListings(data.listings);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (listingId) => {
    setRemovingId(listingId);
    try {
      await api.post(`/users/wishlist/${listingId}`);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      toast.error('Something went wrong');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="page-container max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
              <FiHeart className="text-xl text-pink-400" />
            </div>
            My Wishlist
          </h1>
          <p className="text-dark-400 mt-2 ml-[52px]">
            {listings.length > 0
              ? `${listings.length} item${listings.length !== 1 ? 's' : ''} saved`
              : 'Items you save will appear here'}
          </p>
        </motion.div>

        {/* Wishlist Content */}
        {listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-dark-800 flex items-center justify-center mx-auto mb-6">
              <FiHeart className="text-4xl text-dark-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-dark-400 mb-6 max-w-sm mx-auto">
              Browse the marketplace and tap the heart icon on items you love to save them here.
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingBag /> Browse Marketplace
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {listings.map((listing, idx) => (
                <motion.div
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="relative group"
                >
                  <ListingCard listing={listing} />

                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(listing._id);
                    }}
                    disabled={removingId === listing._id}
                    className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-dark-900/80 backdrop-blur-sm border border-dark-700 flex items-center justify-center text-pink-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    {removingId === listing._id ? (
                      <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiTrash2 className="text-sm" />
                    )}
                  </button>

                  {/* Solid heart indicator */}
                  <div className="absolute top-3 right-14 z-10">
                    <FiHeart className="text-pink-500 fill-pink-500 text-lg drop-shadow-lg" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
