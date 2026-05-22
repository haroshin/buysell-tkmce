import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { FiClock, FiMapPin, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ListingCard = ({ listing }) => {
  const {
    _id,
    title,
    price,
    condition,
    images,
    location,
    createdAt,
    category
  } = listing;

  const defaultImage = "https://via.placeholder.com/400x300?text=No+Image+Available";
  const displayImage = images && images.length > 0 ? images[0] : defaultImage;

  // Format date loosely (e.g., "2 days ago")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/listing/${_id}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this listing: "${title}" for ₹${price} on Buy&Sell TKMCE!`,
        url: shareUrl,
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      });
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy link:', error);
          toast.error('Failed to copy link');
        });
    }
  };

  return (
    <Link to={`/listing/${_id}`}>
      <Card hover className="h-full flex flex-col group">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-slate-800">
          <img 
            src={displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Sold Badge Overlay */}
          {listing.isSold && (
            <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-red-500 text-white font-extrabold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-lg shadow-lg border border-red-400/50">
                Sold
              </span>
            </div>
          )}
          {/* Share Button */}
          <div className="absolute top-3 left-3 z-20">
            <button
              onClick={handleShare}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 transition-colors shadow-lg flex items-center justify-center"
              title="Share Listing"
            >
              <FiShare2 size={16} />
            </button>
          </div>
          {/* Condition Badge */}
          <div className="absolute top-3 right-3 z-20">
            <span className="bg-slate-900/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full border border-slate-700">
              {condition}
            </span>
          </div>
          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-primary-500 text-white text-xs px-2.5 py-1 rounded-full shadow-lg">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
              {title}
            </h3>
            <span className="text-xl font-black text-accent-400 whitespace-nowrap">
              ₹{price}
            </span>
          </div>
          
          <div className="mt-auto pt-4 space-y-2">
            <div className="flex items-center text-slate-400 text-sm">
              <FiMapPin className="mr-2 text-slate-500" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center text-slate-500 text-xs">
              <FiClock className="mr-2" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ListingCard;
