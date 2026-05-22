import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { validationResult } from 'express-validator';


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, department, passoutYear, section } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      department,
      passoutYear,
      section: section || 'None'
    });

    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          passoutYear: user.passoutYear,
          section: user.section,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          passoutYear: user.passoutYear,
          section: user.section,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          passoutYear: user.passoutYear,
          section: user.section,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpire');
    if (!user) {
      // Return success to avoid user enumeration
      return res.json({ message: 'If that email exists, an OTP has been sent.' });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOTP = await bcrypt.hash(otp, salt); // store hashed
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f8fafc;border-radius:16px;overflow:hidden">
        <div style="background:#2881ff;padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;font-weight:700">Buy&amp;Sell TKMCE</h1>
          <p style="margin:8px 0 0;opacity:.85">Password Reset Request</p>
        </div>
        <div style="padding:32px">
          <p style="margin:0 0 16px">Hi <strong>${user.name}</strong>,</p>
          <p style="margin:0 0 24px;color:#94a3b8">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#1e293b;border:2px solid #eab308;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#eab308">${otp}</span>
          </div>
          <p style="margin:0;color:#64748b;font-size:13px">If you didn't request a password reset, please ignore this email. Your account is safe.</p>
        </div>
      </div>
    `;

    await sendEmail({ to: user.email, subject: 'Your Buy&Sell TKMCE Password Reset OTP', html });
    res.json({ message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpire +password');
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const otpMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!otpMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (!user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Auth user with Google token
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  try {
    // Verify the Google ID token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await googleRes.json();
    const { sub: googleId, email, name, picture } = payload;

    // Verify audience matches if defined in environment variables
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Google token audience mismatch' });
    }

    // Try to find user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // If user exists but googleId is not linked, link it
      let wasModified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        wasModified = true;
      }
      // Google logins are verified
      if (!user.isVerified) {
        user.isVerified = true;
        wasModified = true;
      }
      if (wasModified) {
        await user.save();
      }
    } else {
      // Create new user (no password, department, passoutYear, or section yet)
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        isVerified: true
      });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        passoutYear: user.passoutYear,
        section: user.section,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google Authentication Server Error' });
  }
};

export { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, googleLogin };
