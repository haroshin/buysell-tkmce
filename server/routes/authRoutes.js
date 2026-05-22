import express from 'express';
import { check } from 'express-validator';
import { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, googleLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  registerUser
);

// Google OAuth Login route
router.post('/google', googleLogin);

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginUser
);

// Get user profile route
router.get('/me', protect, getUserProfile);

// Forgot password - send OTP
router.post('/forgot-password', forgotPassword);

// Reset password - verify OTP and update
router.post('/reset-password', resetPassword);

export default router;
