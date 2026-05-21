import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import ReportModal from '../components/features/ReportModal';
import { 
  FiMapPin, 
  FiClock, 
  FiTag, 
  FiUser, 
  FiMessageSquare,
  FiShare2,
  FiHeart,
  FiEdit3,
  FiCheckCircle,
  FiEye,
  FiArrowLeft,
  FiAlertTriangle,
} from 'react-icons/fi';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [soldLoading, setSoldLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);

        // Check if item is in user's wishlist
        if (isAuthenticated) {
          try {
            const { data: profileData } = await api.get('/users/profile');
            const wishlistIds = profileData.user?.wishlist || [];
            // wishlist might contain objects or ids
            // The profile endpoint returns user data, but wishlist is stored as ObjectIds
            // We need to check from the user model
          } catch (e) {
            // Silently fail — wishlist check is non-critical
          }
        }
      } catch (error) {
        console.error('Failed to fetch listing', error);
        toast.error('Listing not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, isAuthenticated]);

  // Check wishlist status on load
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await api.get('/users/wishlist');
        const ids = data.listings.map((l) => l._id);
        setWishlisted(ids.includes(id));
      } catch (e) {
        // Non-critical
      }
    };
    checkWishlist();
  }, [id, isAuthenticated]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      const { data } = await api.post(`/users/wishlist/${id}`);
      setWishlisted(data.wishlisted);
      toast.success(data.message);
    } catch (error) {
      console.error('Wishlist toggle failed', error);
      toast.error('Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleMarkAsSold = async () => {
    setSoldLoading(true);
    try {
      const { data } = await api.put(`/listings/${id}/sold`);
      toast.success(data.message);
      setListing((prev) => ({
        ...prev,
        isSold: data.isSold,
        isActive: data.isActive,
      }));
    } catch (error) {
      console.error('Mark as sold failed', error);
      toast.error('Something went wrong');
    } finally {
      setSoldLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!listing) return null;

  const defaultImage = "https://via.placeholder.com/800x600?text=No+Image+Available";
  const images = listing.images && listing.images.length > 0 ? listing.images : [defaultImage];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = user && user._id === listing.seller?._id;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO 
        title={listing.title} 
        description={listing.description.substring(0, 150)}
        image={listing.images?.[0]}
      />
      <div className="page-container max-w-6xl">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <FiArrowLeft /> Back
        </motion.button>

        {/* Sold Banner */}
        {listing.isSold && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-red-400 font-semibold flex items-center justify-center gap-2">
              <FiCheckCircle /> This item has been sold
            </p>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Images Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="aspect-video bg-dark-800 rounded-2xl overflow-hidden border border-slate-700/50 relative">
              <img 
                src={images[activeImage]} 
                alt={listing.title} 
                className="w-full h-full object-contain"
              />
              {listing.isSold && (
                <div className="absolute inset-0 bg-dark-900/50 flex items-center justify-center">
                  <span className="text-2xl font-black text-red-400 bg-dark-900/80 px-6 py-3 rounded-xl border border-red-500/30">
                    SOLD
                  </span>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium border border-primary-500/20">
                {listing.category}
              </span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
                {listing.condition}
              </span>
              {listing.isNegotiable && (
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20">
                  Negotiable
                </span>
              )}
              {listing.isSold && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/20">
                  Sold
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {listing.title}
            </h1>
            
            <div className="text-4xl font-black text-accent-400 mb-6">
              ₹{listing.price}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center text-slate-400">
                <FiMapPin className="mr-2 text-primary-500" size={20} />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center text-slate-400">
                <FiClock className="mr-2 text-primary-500" size={20} />
                <span>{formatDate(listing.createdAt)}</span>
              </div>
              <div className="flex items-center text-slate-400">
                <FiEye className="mr-2 text-primary-500" size={20} />
                <span>{listing.views} views</span>
              </div>
            </div>

            <div className="glass-card p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={listing.seller?.avatar || 'https://via.placeholder.com/150'} 
                  alt={listing.seller?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
                />
                <div>
                  <p className="text-white font-medium text-lg">{listing.seller?.name}</p>
                  <p className="text-slate-400 text-sm">{listing.seller?.department}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <h3 className="text-xl font-semibold text-white">Description</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            <div className="flex gap-4 mt-auto">
              {!isOwner ? (
                <>
                  {listing.isSold ? (
                    <Button
                      className="flex-1 py-3 text-lg bg-red-600/20 text-red-400 border border-red-500/25 cursor-not-allowed"
                      disabled
                    >
                      <FiCheckCircle className="mr-2 text-red-500" /> Sold Out
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 py-3 text-lg"
                      variant="primary"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Please login to contact your agent');
                          navigate('/login');
                          return;
                        }
                        navigate(`/messages?seller=${listing.seller?._id}&listing=${listing._id}`);
                      }}
                    >
                      <FiMessageSquare className="mr-2" /> Contact Agent to Buy
                    </Button>
                  )}
                  <Button
                    className="px-4"
                    variant="outline"
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                  >
                    <FiHeart
                      size={24}
                      className={wishlisted ? 'fill-pink-500 text-pink-500' : ''}
                    />
                  </Button>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="bg-primary-500/10 border border-primary-500/30 text-primary-400 p-4 rounded-xl text-center font-medium">
                    This is your listing
                  </div>
                  <div className="flex gap-4">
                    <Link to={`/edit-listing/${listing._id}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        <FiEdit3 className="mr-2" /> Edit Listing
                      </Button>
                    </Link>
                    <Button
                      className="flex-1"
                      variant={listing.isSold ? 'secondary' : 'danger'}
                      onClick={handleMarkAsSold}
                      disabled={soldLoading}
                    >
                      {listing.isSold ? (
                        <><FiCheckCircle className="mr-2" /> Mark as Available</>
                      ) : (
                        <><FiCheckCircle className="mr-2" /> Mark as Sold</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Report Button */}
            {!isOwner && (
              <div className="mt-8 pt-8 border-t border-dark-800 text-center">
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to report');
                      navigate('/login');
                      return;
                    }
                    setIsReportModalOpen(true);
                  }}
                  className="text-sm text-dark-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <FiAlertTriangle /> Report this listing
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        reportedListingId={listing._id}
        reportedUserId={listing.seller?._id}
        title={listing.title}
      />
    </div>
  );
};

export default ListingDetail;
