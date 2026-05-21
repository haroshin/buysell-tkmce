# Phase 2 — Authentication System

## Overview
Phase 2 implemented full JWT-based authentication, allowing users to register, log in, and maintain a secure session across the application.

## Backend Changes

### `server/models/User.js`
- Defined the User schema with `name`, `email`, `password`, `department`, `year`, and `role`.
- Added a `pre('save')` Mongoose hook to automatically hash passwords using `bcryptjs` before saving to the database.
- Added a `matchPassword` method to compare plain-text passwords during login.

### `server/controllers/authController.js`
- **`register`**: Validates input, checks for existing email, creates a new user, and returns a JWT token.
- **`login`**: Verifies email and password, returning a JWT token on success.
- **`getMe`**: Uses the JWT token to fetch the currently authenticated user's profile.

### `server/middleware/auth.js`
- Created the `protect` middleware.
- Intercepts requests, extracts the token from the `Authorization: Bearer <token>` header, verifies it using `jsonwebtoken`, and attaches the decoded user to `req.user`.

## Frontend Changes

### `client/src/context/AuthContext.jsx`
- React Context provider that manages the global authentication state (`user`, `isAuthenticated`, `loading`).
- Persists the JWT token in `localStorage`.
- Provides `login`, `register`, and `logout` functions to all child components.

### `client/src/pages/Register.jsx` & `Login.jsx`
- Responsive, glassmorphism-styled forms for user onboarding.
- Handled form state, error display (via `react-hot-toast`), and automatic redirection on success.

### `client/src/components/common/ProtectedRoute.jsx`
- A wrapper component for React Router.
- Checks `isAuthenticated`; if false, redirects the user to `/login` before rendering the protected content.
