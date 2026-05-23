import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlineHeart,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/messages/unread-count');
        setUnreadCount(data.count);
      } catch (e) { /* non-critical */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { path: '/sell', label: 'Sell Item', icon: HiOutlinePlusCircle },
        { path: '/my-listings', label: 'My Listings', icon: HiOutlineViewGrid },
        { path: '/wishlist', label: 'Wishlist', icon: HiOutlineHeart },
        { path: '/messages', label: 'Messages', icon: HiOutlineChat },
        { path: '/profile', label: 'Profile', icon: HiOutlineUser },
      ]
    : [];

  if (isAuthenticated && user?.role === 'admin') {
    navLinks.splice(1, 0, { path: '/calendar', label: 'Events Calendar', icon: HiOutlineCalendar });
  }

  if (isAuthenticated && user?.role === 'admin') {
    navLinks.splice(1, 0, { path: '/admin', label: 'Admin Panel', icon: HiOutlineShieldCheck });
  }

  if (isAuthenticated && (user?.role === 'agent' || user?.role === 'admin')) {
    navLinks.splice(1, 0, { path: '/agent', label: 'Agent Dashboard', icon: HiOutlineShieldCheck });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-dark-50 leading-tight">
                Buy&Sell
              </h1>
              <p className="text-[10px] font-medium text-primary-400 -mt-0.5 tracking-wider">
                TKMCE
              </p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-lg mx-6"
          >
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for textbooks, electronics, components..."
                className="w-full bg-dark-800/80 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-50 placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all duration-300"
                id="search-input"
              />
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2.5 mr-1 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <HiOutlineSun className="text-xl text-accent-500 animate-pulse-slow" />
              ) : (
                <HiOutlineMoon className="text-xl text-primary-500" />
              )}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/sell"
                  className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
                >
                  <HiOutlinePlusCircle className="text-lg" />
                  <span>Sell</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="p-2.5 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
                  title="Wishlist"
                >
                  <HiOutlineHeart className="text-xl" />
                </Link>
                <Link
                  to="/messages"
                  className="relative p-2.5 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
                  title="Messages"
                >
                  <HiOutlineChat className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/calendar"
                    className="p-2.5 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
                    title="Events Calendar"
                  >
                    <HiOutlineCalendar className="text-xl" />
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2.5 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
                    title="Admin Panel"
                  >
                    <HiOutlineShieldCheck className="text-xl" />
                  </Link>
                )}
                {(user?.role === 'agent' || user?.role === 'admin') && (
                  <Link
                    to="/agent"
                    className="p-2.5 rounded-xl text-dark-300 hover:text-accent-500 hover:bg-dark-800 transition-all duration-300"
                    title="Agent Dashboard"
                  >
                    <HiOutlineShieldCheck className="text-xl" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-2 rounded-xl text-dark-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-all duration-300"
                  title="Logout"
                >
                  <HiOutlineLogout className="text-xl" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary text-sm py-2 px-5"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-dark-300 hover:bg-dark-800 transition-colors"
            id="mobile-menu-toggle"
          >
            {isMenuOpen ? (
              <HiOutlineX className="text-2xl" />
            ) : (
              <HiOutlineMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="page-container py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="md:hidden">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-50 placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    id="mobile-search-input"
                  />
                </div>
              </form>

              {/* Theme Toggle - Mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-dark-200 hover:bg-dark-800 hover:text-dark-50 border border-transparent hover:border-dark-700 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <HiOutlineSun className="text-xl text-accent-500" />
                  ) : (
                    <HiOutlineMoon className="text-xl text-primary-500" />
                  )}
                  <span className="font-medium">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <span className="text-xs text-dark-400">
                  {theme === 'dark' ? 'Switch' : 'Switch'}
                </span>
              </button>

              {isAuthenticated ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === link.path
                          ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                          : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50'
                      }`}
                    >
                      <link.icon className="text-xl" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <HiOutlineLogout className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-secondary text-sm py-2.5 flex-1 text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary text-sm py-2.5 flex-1 text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
