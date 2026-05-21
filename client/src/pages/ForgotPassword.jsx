import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─── Step indicators ────────────────────────────────────────────────────────
const steps = ['Enter Email', 'Verify OTP', 'New Password'];

const StepDot = ({ index, current }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        index < current
          ? 'bg-primary-500 text-white'
          : index === current
          ? 'bg-accent-500 text-white scale-110 shadow-lg shadow-accent-500/30'
          : 'bg-dark-700 text-dark-400'
      }`}
    >
      {index < current ? '✓' : index + 1}
    </div>
    {index < steps.length - 1 && (
      <div
        className={`w-10 h-0.5 transition-all duration-500 ${
          index < current ? 'bg-primary-500' : 'bg-dark-700'
        }`}
      />
    )}
  </div>
);

// ─── OTP Input ───────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const digits = value.split('').concat(Array(6 - value.length).fill(''));

  const handleKey = (e, idx) => {
    const key = e.key;
    if (key === 'Backspace') {
      const next = value.slice(0, -1);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
    } else if (/^\d$/.test(key)) {
      const next = (value + key).slice(0, 6);
      onChange(next);
      if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          readOnly
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={() => document.getElementById(`otp-${i}`)?.select()}
          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-dark-800 text-dark-50 outline-none transition-all duration-200
            ${d ? 'border-primary-500 text-primary-400' : 'border-dark-600 focus:border-primary-500'}`}
        />
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent! Check your inbox.');
      setStep(1);
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the full 6-digit OTP'); return; }
    setStep(2);
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { toast.error('Please fill in all fields'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Try again.');
      if (err.response?.data?.message?.includes('OTP')) {
        setStep(1); // go back to OTP step
        setOtp('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP cooldown ───────────────────────────────────────────────────
  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent!');
      setOtp('');
      startCooldown();
    } catch (err) {
      toast.error('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <HiOutlineShieldCheck className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50 mb-2">Reset Password</h1>
            <p className="text-dark-400 text-sm">
              {step === 0 && "Enter your email to receive an OTP"}
              {step === 1 && `OTP sent to ${email}`}
              {step === 2 && "Set your new password"}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center mb-8 gap-0">
            {steps.map((_, i) => <StepDot key={i} index={i} current={step} />)}
          </div>

          {/* ── Step 0: Email ── */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-medium text-dark-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@tkmce.ac.in"
                      className="input-field pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  id="send-otp-btn"
                >
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Send OTP'}
                </button>
              </motion.form>
            )}

            {/* ── Step 1: OTP ── */}
            {step === 1 && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-4 text-center">
                    Enter the 6-digit OTP
                  </label>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 6}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="verify-otp-btn"
                >
                  Verify OTP
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => { setStep(0); setOtp(''); }}
                    className="text-sm text-dark-400 hover:text-dark-300 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <HiOutlineArrowLeft className="text-xs" /> Change email
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Step 2: New Password ── */}
            {step === 2 && (
              <motion.form
                key="password-step"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-dark-200 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="input-field pl-10 pr-10"
                      required
                      autoFocus
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

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-dark-200 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                    >
                      {showConfirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newPassword !== confirmPassword}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="reset-password-btn"
                >
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to login */}
          <p className="text-center text-dark-400 text-sm mt-6">
            Remembered it?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
