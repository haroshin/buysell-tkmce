import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import api from '../services/api';
import ListingCard from '../components/features/ListingCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { CATEGORIES } from '../utils/constants';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState(sortParam);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let endpoint = `/listings?`;
        if (query) endpoint += `keyword=${encodeURIComponent(query)}&`;
        if (category && category !== 'All') endpoint += `category=${encodeURIComponent(category)}&`;
        if (sort) endpoint += `sort=${sort}`;

        const { data } = await api.get(endpoint);
        setListings(data.listings);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleApplyFilters = () => {
    updateParams({ category, sort });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setCategory('All');
    setSort('newest');
    updateParams({ category: 'All', sort: 'newest' });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="page-container">
        
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for textbooks, laptops..."
                className="w-full bg-dark-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button type="submit" className="px-8 hidden sm:flex">Search</Button>
            <Button 
              type="button" 
              variant="outline" 
              className="px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <HiOutlineFilter className="text-xl sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-6 mb-8 max-w-3xl mx-auto animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id || cat} value={cat.name || cat}>{cat.name || cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" onClick={handleClearFilters}>Clear All</Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-6">
          <h2 className="text-xl text-white font-medium">
            {query ? `Search results for "${query}"` : 'All Listings'}
            <span className="text-slate-400 text-base ml-2">({listings.length} found)</span>
          </h2>
        </div>

        {/* Results Grid */}
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
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
            <p className="text-slate-400 mb-6">We couldn't find any listings matching your criteria.</p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters & Try Again
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResults;
