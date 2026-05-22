import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, A_B_SECTION_DEPARTMENTS, SINGLE_SECTION_DEPARTMENTS, NO_SECTION_DEPARTMENTS } from '../utils/constants';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    passoutYear: '',
    section: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-register-btn'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            width: '320',
          }
        );
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, []);

  // Mechanical Engineering — full A/B/C picker
  const hasMultipleSections = formData.department === 'Mechanical Engineering';
  // Civil, EEE, ECE, CSE — A/B picker
  const hasABSections = A_B_SECTION_DEPARTMENTS.has(formData.department);
  // Chemical, Elec & Computer, Architecture, CS&E AI, MCA — auto-set A, hidden
  const isSingleSection = SINGLE_SECTION_DEPARTMENTS.has(formData.department);
  // MTech — no section at all
  const isNoSection = NO_SECTION_DEPARTMENTS.has(formData.department);
  // Show picker for all departments with sections
  const showSectionPicker = formData.department && !isNoSection;

  // Auto-set section when department changes
  useEffect(() => {
    if (hasMultipleSections || hasABSections) {
      // User must choose — reset field
      setFormData((prev) => ({ ...prev, section: '' }));
    } else if (isSingleSection) {
      // Auto-assign Section A silently
      setFormData((prev) => ({ ...prev, section: 'A' }));
    } else {
      // MTech or no dept yet — clear section
      setFormData((prev) => ({ ...prev, section: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.department]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-50 mb-2">Create Account</h1>
            <p className="text-dark-400">Join Buy&Sell TKMCE</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-dark-200 mb-1.5">
                College Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.name@tkmce.ac.in"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark-200 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Department, Passout Year & Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-dark-200 mb-1.5">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="passoutYear" className="block text-sm font-medium text-dark-200 mb-1.5">
                  Passout Year
                </label>
                <select
                  id="passoutYear"
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select</option>
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section picker:
                - Mechanical Engineering → A / B / C
                - Civil, EEE, ECE, CSE   → A / B
                - Chemical, Arch, MCA, etc. → auto-set A (hidden)
                - MTech → no section (hidden) */}
             {showSectionPicker && (
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-dark-200 mb-1.5">
                  Section
                </label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <p className="text-xs text-dark-400 mt-1">
                    Section A is auto-assigned for this department.
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-dark-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
              id="register-submit"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-500 text-sm">or</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {/* Google Sign-Up */}
          <div className="flex justify-center mb-6">
            <div id="google-register-btn"></div>
          </div>

          {/* Login link */}
          <p className="text-center text-dark-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-400 font-semibold hover:text-primary-300 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
