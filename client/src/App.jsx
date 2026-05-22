import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/common/PageTransition';
import SupportWidget from './components/layout/SupportWidget';
import CompleteProfileModal from './components/features/CompleteProfileModal';

// Lazy load pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const EditListing = lazy(() => import('./pages/EditListing'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const MyListings = lazy(() => import('./pages/MyListings'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Messages = lazy(() => import('./pages/Messages'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));

// Loading spinner fallback for Suspense
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
  </div>
);

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/category/:name" element={<PageTransition><CategoryPage /></PageTransition>} />
        <Route path="/listing/:id" element={<PageTransition><ListingDetail /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/sell" element={<PageTransition><CreateListing /></PageTransition>} />
          <Route path="/edit-listing/:id" element={<PageTransition><EditListing /></PageTransition>} />
          <Route path="/my-listings" element={<PageTransition><MyListings /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
          <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />

          {/* Agent Route */}
          <Route path="/agent" element={<PageTransition><AgentDashboard /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-dark-900 flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Suspense fallback={<PageLoader />}>
                <AppRoutes />
              </Suspense>
            </main>
            <Footer />
            <SupportWidget />
            <CompleteProfileModal />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgb(var(--color-dark-800))',
                color: 'rgb(var(--color-dark-50))',
                border: '1px solid rgba(var(--color-dark-400), 0.3)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: 'rgb(var(--color-accent-500))',
                  secondary: 'rgb(var(--color-dark-800))',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'rgb(var(--color-dark-800))',
                },
              },
            }}
          />
        </div>
      </Router>
      </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
