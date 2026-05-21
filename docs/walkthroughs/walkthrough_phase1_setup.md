# Phase 1 — Project Setup & Architecture

## Overview
Phase 1 established the foundational MERN stack architecture for the Buy&Sell TKMCE platform, including database connection, server setup, and the custom frontend design system.

## Backend Foundation

### `server/server.js`
- Express application entry point.
- Configured essential middleware: `express.json()` for parsing bodies, `cors()` for cross-origin requests, and `morgan` for logging in development.

### `server/config/db.js`
- MongoDB connection using Mongoose.
- Implements robust error handling and process exit on connection failure.

## Frontend Foundation

### `client/src/index.css`
- Defines the core design language.
- Includes custom Google Fonts (Outfit and Plus Jakarta Sans).
- Establishes CSS variables for the color palette (Dark theme, Primary Purple, Accent Teal).
- Creates global utility classes like `.glass-card` and `.btn-primary` to enforce the premium UI aesthetic.

### `client/tailwind.config.js`
- Extended the default Tailwind theme to map our custom colors (`primary`, `accent`, `dark`).
- Added custom font families matching `index.css`.

### `client/src/services/api.js`
- Configured an Axios instance pointing to the backend API (`http://localhost:5000/api`).
- Includes request interceptors to automatically attach the JWT token from `localStorage` to every request.
- Includes response interceptors to handle 401 Unauthorized errors (automatically logging the user out if their token expires).
