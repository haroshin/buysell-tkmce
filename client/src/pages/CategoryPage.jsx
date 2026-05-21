import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ListingCard from '../components/features/ListingCard';
import SEO from '../components/common/SEO';
import { CATEGORIES } from '../utils/constants';

const CategoryPage = () => {
  const { name } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodedName = decodeURIComponent(name);
  // Resolve slug (id) → full category name used in the database
  // The URL uses the category id (e.g. 'textbooks-notes') but the backend
  // stores and filters by the full display name (e.g. 'Textbooks & Notes').
  const categoryInfo = CATEGORIES.find(c => c.id === decodedName || c.name === decodedName) || { name: decodedName, icon: () => null };
  const categoryNameForQuery = categoryInfo.name; // always the full DB name

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/listings?category=${encodeURIComponent(categoryNameForQuery)}`);
        setListings(data.listings);
      } catch (error) {
        console.error('Failed to fetch category listings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [categoryNameForQuery]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO 
        title={`${decodedName} Listings`} 
        description={`Browse all ${decodedName} listings on Buy&Sell TKMCE.`}
      />
      <div className="page-container">
        
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 text-3xl border border-primary-500/20">
            <categoryInfo.icon />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{categoryInfo.name}</h1>
            <p className="text-slate-400">Browse all items in this category</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card h-80 animate-pulse flex flex-col">
                <div className="h-48 bg-dark-700 w-full" />
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="h-5 bg-dark-700 w-3/4 rounded" />
                  <div className="h-4 bg-dark-700 w-1/4 rounded" />
                  <div className="mt-auto h-4 bg-dark-700 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-800/50 rounded-3xl border border-dark-700 border-dashed max-w-2xl mx-auto">
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
            <p className="text-slate-400 mb-6">There are no listings in this category yet.</p>
            <Link to="/sell" className="btn-primary">
              Be the first to post
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;
