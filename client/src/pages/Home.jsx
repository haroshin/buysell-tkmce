import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineCash,
} from 'react-icons/hi';
import { CATEGORIES } from '../utils/constants';
import api from '../services/api';
import ListingCard from '../components/features/ListingCard';
import SEO from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import EventCalendar from '../components/features/EventCalendar';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const matches = value.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
    const num = matches ? parseInt(matches[2], 10) : 0;
    let animationFrameId;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = progress * (2 - progress); // easeOutQuad
      setCount(Math.floor(eased * num));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);
  const matches = value.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  const prefix = matches ? matches[1] : '';
  const suffix = matches ? matches[3] : '';
  return <span>{prefix}{count}{suffix}</span>;
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const { data } = await api.get('/listings?limit=8');
        setRecentListings(data.listings);
      } catch (error) {
        console.error('Failed to fetch listings', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const { data } = await api.get('/listings/public/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch public stats', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchRecentListings();
    fetchStats();
  }, []);

  const formatListingsCount = (count) => {
    return count !== undefined && count !== null ? `${count}+` : '0+';
  };

  const formatStudentsCount = (count) => {
    return count !== undefined && count !== null ? `${count}+` : '0+';
  };

  const formatSavedAmount = (amount) => {
    if (amount === undefined || amount === null || amount === 0) return '₹0';
    if (amount < 1000) return `₹${amount}`;
    if (amount < 100000) {
      const thousands = Math.round(amount / 1000);
      return `₹${thousands}K+`;
    }
    const lakhs = Math.round(amount / 100000);
    return `₹${lakhs}L+`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: HiOutlineShieldCheck,
      title: 'Campus Verified',
      description: 'Only verified TKMCE students can post and buy. Safe and secure transactions.',
      color: 'bg-primary-500',
    },
    {
      icon: HiOutlineLightningBolt,
      title: 'Instant Connect',
      description: 'Message sellers directly. No middlemen. Quick and easy communication.',
      color: 'bg-accent-500',
    },
    {
      icon: HiOutlineUserGroup,
      title: 'Community Driven',
      description: 'Built by students, for students. Help your juniors with affordable deals.',
      color: 'bg-primary-500',
    },
    {
      icon: HiOutlineCash,
      title: 'Best Deals',
      description: 'Find the best prices on campus. Negotiate and get the deals you deserve.',
      color: 'bg-accent-500',
    },
  ];

  return (
    <div className="pt-16 lg:pt-18 pb-12">
      <SEO 
        title="Buy, Sell & Trade" 
        description="Join the TKMCE marketplace to find textbooks, lab equipment, and more. A secure platform for students by students."
      />
      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="page-container relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
                🎓 TKM College of Engineering
              </span>
            </motion.div>

            {/* Heading */}
            <h1
              className="reveal-text text-4xl sm:text-5xl lg:text-7xl font-bold text-dark-50 leading-tight mb-6"
            >
              Buy & Sell Within{' '}
              <span className="gradient-text">Your Campus</span>
            </h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 text-balance"
            >
              The trusted marketplace for TKMCians. Find textbooks, electronics,
              project components, and more — all from your fellow students.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-primary-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition-opacity duration-500" />
                <div className="relative flex items-center bg-dark-800 rounded-2xl border border-dark-700">
                  <HiOutlineSearch className="absolute left-4 text-dark-400 text-xl" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent pl-12 pr-32 py-4 text-dark-50 placeholder-dark-400 focus:outline-none rounded-2xl text-lg"
                    id="hero-search-input"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 btn-primary py-2.5 px-6 text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Quick stats */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-8 sm:gap-12 text-sm"
            >
              {statsLoading ? (
                <div className="flex gap-8 sm:gap-12 items-center animate-pulse py-2">
                  <div className="h-8 w-20 bg-dark-800 rounded-lg border border-dark-700" />
                  <div className="w-px h-8 bg-dark-700" />
                  <div className="h-8 w-20 bg-dark-800 rounded-lg border border-dark-700" />
                  <div className="w-px h-8 bg-dark-700" />
                  <div className="h-8 w-20 bg-dark-800 rounded-lg border border-dark-700" />
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">
                      <AnimatedCounter value={formatListingsCount(stats?.activeListings)} />
                    </p>
                    <p className="text-dark-400">Active Listings</p>
                  </div>
                  <div className="w-px h-10 bg-dark-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">
                      <AnimatedCounter value={formatStudentsCount(stats?.totalStudents)} />
                    </p>
                    <p className="text-dark-400">Students</p>
                  </div>
                  <div className="w-px h-10 bg-dark-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">
                      <AnimatedCounter value={formatSavedAmount(stats?.totalSaved)} />
                    </p>
                    <p className="text-dark-400">Saved</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Browse Listings Section */}
      <section className="py-16 lg:py-20 bg-dark-900 border-t border-dark-800">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-heading mb-2">
                Browse <span className="gradient-text">Listings</span>
              </h2>
              <p className="text-dark-400">Latest items posted by your peers</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/search" className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors group">
                View all <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
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
          ) : recentListings.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recentListings.map(listing => (
                <motion.div key={listing._id} variants={fadeInUp}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-dark-800/50 rounded-2xl border border-dark-700 border-dashed">
              <p className="text-dark-400">No listings found. Be the first to sell something!</p>
              <Link to="/sell" className="mt-4 inline-block btn-primary px-6 py-2">
                Create Listing
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 lg:py-20 bg-dark-950/20 border-t border-dark-800">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-heading mb-3">
              Campus Events <span className="gradient-text">Calendar</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-lg mx-auto">
              Stay updated with academic fests, exam timetables, workshops, and college activities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 border border-dark-700/50"
          >
            <EventCalendar />
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-heading mb-3">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-lg mx-auto">
              Find exactly what you need across 11 categories
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="glass-card-hover p-5 flex flex-col items-center text-center gap-3 group block"
                  id={`category-${category.id}`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <category.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-100 text-sm group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-dark-500 text-xs mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-dark-950/50">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-heading mb-3">
              Why <span className="gradient-text">Buy&Sell TKMCE</span>?
            </h2>
            <p className="text-dark-400 text-lg max-w-lg mx-auto">
              Built specifically for the TKMCE community
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card p-6 text-center group hover:border-primary-500/20 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="font-semibold text-dark-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Solid Theme BG */}
            <div className="absolute inset-0 bg-primary-500/10 border border-primary-500/20" />
            <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" />

            <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-50 mb-4">
                Ready to start{' '}
                <span className="gradient-text">selling?</span>
              </h2>
              <p className="text-dark-300 text-lg max-w-lg mx-auto mb-8">
                Join hundreds of TKMCians already buying and selling on campus.
                Create your account and post your first listing today!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/sell" : "/register"}
                  className="btn-primary text-base py-3 px-8 flex items-center gap-2"
                >
                  Start Selling
                  <HiOutlineArrowRight />
                </Link>
                <Link
                  to="/search"
                  className="btn-outline text-base py-3 px-8"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
