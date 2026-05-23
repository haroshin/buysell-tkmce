import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- Security Middlewares ---

// Configure security response headers
app.use(helmet({
  contentSecurityPolicy: false // Disabled by default for easy loading of external asset icons and assets
}));

// Restrict incoming JSON payload size to 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize inputs to prevent MongoDB Operator Injection (NoSQL Injection)
app.use(mongoSanitize());

// Protect against HTTP Parameter Pollution
app.use(hpp());

// CORS Whitelisting
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// General Request Rate Limiter (100 requests per 15 mins)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Authentication Brute-Force Limiter (5 requests per minute)
const authBruteForceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: 'Too many authentication attempts. Please try again in a minute.' }
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authBruteForceLimiter);
app.use('/api/auth/register', authBruteForceLimiter);
app.use('/api/auth/forgot-password', authBruteForceLimiter);
app.use('/api/auth/reset-password', authBruteForceLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
