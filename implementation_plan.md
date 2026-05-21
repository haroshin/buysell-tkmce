# 🎓 Buy&Sell TKMCE — Implementation Plan

> A college marketplace platform for TKM College of Engineering students to buy, sell, and exchange items within the campus community.

---

## 📋 Project Overview

| Detail | Value |
|--------|-------|
| **Project Name** | Buy&Sell TKMCE |
| **Frontend** | React (Vite) + Tailwind CSS v3 |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Image Storage** | Cloudinary / Local uploads |
| **Architecture** | MERN Stack (Monorepo) |

---

## 🗂️ Categories (11)

| # | Category | Icon | Description |
|---|----------|------|-------------|
| 1 | Textbooks & Notes | 📚 | Books, notes, solved papers, study guides |
| 2 | Electronics | 💻 | Laptops, phones, tablets, accessories |
| 3 | Project Components | 🔧 | Arduino, Raspberry Pi, sensors, motors, breadboards, ICs |
| 4 | Gaming | 🎮 | Consoles, controllers, games, gaming peripherals |
| 5 | Hostel Essentials | 🛋️ | Furniture, appliances, room decor |
| 6 | Fashion | 👕 | Clothing, shoes, bags, accessories |
| 7 | Pets | 🐾 | Pet adoption, pet supplies, food, accessories |
| 8 | Sports & Fitness | 🏋️ | Rackets, gym gear, musical instruments |
| 9 | Transport | 🚲 | Bicycles, two-wheelers, accessories |
| 10 | Events & Tickets | 🎟️ | Fest passes, concert tickets |
| 11 | Others | 📦 | Miscellaneous items |

---

## 🏗️ Project Structure

```
d:\buysell\webdev\
├── client/                    # React Frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/            # Images, icons, fonts
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Button, Input, Modal, Card, etc.
│   │   │   ├── layout/        # Navbar, Footer, Sidebar
│   │   │   └── features/      # Feature-specific components
│   │   ├── pages/             # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── context/           # React Context (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind imports
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── upload.js          # Multer image upload
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   ├── server.js              # Entry point
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🗄️ Database Schemas

### User Schema
```javascript
{
  name:           String,       // Full name
  email:          String,       // College email (unique)
  password:       String,       // Hashed (bcrypt)
  phone:          String,       // Contact number
  department:     String,       // CSE, ECE, ME, etc.
  year:           Number,       // 1, 2, 3, 4
  avatar:         String,       // Profile picture URL
  role:           String,       // "user" | "admin"
  isVerified:     Boolean,      // Email verified
  listings:       [ObjectId],   // References to listings
  wishlist:       [ObjectId],   // Saved listings
  createdAt:      Date,
  updatedAt:      Date
}
```

### Listing Schema
```javascript
{
  title:          String,       // Item title
  description:    String,       // Detailed description
  price:          Number,       // Asking price (₹)
  category:       String,       // One of the 11 categories
  condition:      String,       // "New" | "Like New" | "Good" | "Fair"
  images:         [String],     // Array of image URLs (max 5)
  seller:         ObjectId,     // Reference to User
  location:       String,       // Hostel/Department
  isNegotiable:   Boolean,      // Price negotiable?
  isSold:         Boolean,      // Mark as sold
  isActive:       Boolean,      // Listing visible?
  views:          Number,       // View count
  createdAt:      Date,
  updatedAt:      Date
}
```

### Message Schema
```javascript
{
  sender:         ObjectId,     // User who sent
  receiver:       ObjectId,     // User who receives
  listing:        ObjectId,     // Related listing
  content:        String,       // Message text
  isRead:         Boolean,
  createdAt:      Date
}
```

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login & get JWT token |
| GET | `/me` | Get current user profile |
| POST | `/forgot-password` | Send password reset email |
| PUT | `/reset-password/:token` | Reset password |

### Listing Routes (`/api/listings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all listings (with filters & pagination) |
| GET | `/:id` | Get single listing detail |
| POST | `/` | Create new listing (auth required) |
| PUT | `/:id` | Update listing (owner only) |
| DELETE | `/:id` | Delete listing (owner only) |
| GET | `/category/:category` | Get listings by category |
| GET | `/search?q=` | Search listings |
| PUT | `/:id/sold` | Mark as sold |

### User Routes (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| GET | `/my-listings` | Get current user's listings |
| POST | `/wishlist/:id` | Add/remove from wishlist |
| GET | `/wishlist` | Get wishlist items |

### Message Routes (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send message to seller |
| GET | `/conversations` | Get all conversations |
| GET | `/:userId` | Get messages with a user |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/listings` | Get all listings |
| DELETE | `/listings/:id` | Remove listing |
| PUT | `/users/:id/ban` | Ban a user |
| GET | `/stats` | Dashboard statistics |

---

## 🎨 UI/UX Design Plan

### Color Palette
| Token | Color | Usage |
|-------|-------|-------|
| Primary | `#6C63FF` (Indigo/Purple) | Buttons, links, accents |
| Secondary | `#00D9A6` (Teal/Mint) | Success states, highlights |
| Dark BG | `#0F172A` | Dark mode background |
| Card BG | `#1E293B` | Card backgrounds |
| Text Primary | `#F8FAFC` | Main text (dark mode) |
| Text Muted | `#94A3B8` | Secondary text |
| Danger | `#EF4444` | Errors, delete actions |
| Warning | `#F59E0B` | Warnings, pending states |

### Typography
- **Font:** Inter (Google Fonts)
- **Headings:** Bold, clean hierarchy
- **Body:** Regular weight, good line height

### Key UI Features
- 🌙 **Dark mode** as default (modern & premium feel)
- ✨ **Glassmorphism** cards with backdrop blur
- 🎭 **Smooth animations** using Framer Motion
- 📱 **Fully responsive** (mobile-first)
- 🔍 **Real-time search** with debouncing
- 🏷️ **Category chips** with icons
- 🖼️ **Image carousel** on listing pages
- 💬 **In-app messaging** between buyers & sellers

---

## 📦 Development Phases

### Phase 1 — Project Setup & Foundation
- [x] Define project structure
- [ ] Initialize React app with Vite
- [ ] Install & configure Tailwind CSS v3
- [ ] Set up Express server
- [ ] Connect MongoDB (Mongoose)
- [ ] Configure environment variables
- [ ] Set up project folder structure

### Phase 2 — Authentication System
- [x] User registration (with college email validation)
- [x] Login with JWT
- [x] Password hashing (bcrypt)
- [x] Protected routes (frontend & backend)
- [x] Auth context in React
- [x] Login & Register pages with beautiful UI

### Phase 3 — Core Listing Features
- [x] Create listing form (with image upload)
- [x] Listing card component
- [x] Home page with featured/recent listings
- [x] Category browsing page
- [x] Listing detail page
- [x] Search with filters (category, price range, condition)
- [x] Pagination

### Phase 4 — User Features
- [x] User profile page
- [x] Edit profile
- [x] My Listings (manage own posts)
- [x] Wishlist / Saved items
- [x] Mark listing as sold

### Phase 5 — Messaging & Communication
- [x] Contact seller button
- [x] In-app messaging system
- [x] Conversations list
- [x] Message notifications

### Phase 6 — Admin Panel & Polish
- [x] Admin dashboard with stats
- [x] Manage users & listings
- [x] Report/flag system
- [x] Performance optimization
- [x] SEO meta tags
- [x] Final UI polish & animations

---

## 🛠️ Key Dependencies

### Frontend (client)
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "framer-motion": "^11.x",
  "react-icons": "^5.x",
  "react-hot-toast": "^2.x",
  "react-dropzone": "^14.x",
  "tailwindcss": "^3.x",
  "@tailwindcss/forms": "^0.5.x",
  "autoprefixer": "^10.x",
  "postcss": "^8.x"
}
```

### Backend (server)
```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "multer": "^1.x",
  "cloudinary": "^2.x",
  "cors": "^2.x",
  "dotenv": "^16.x",
  "express-validator": "^7.x",
  "helmet": "^7.x",
  "morgan": "^1.x"
}
```

---

## 🚀 Deployment Plan

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel / Netlify | Free tier, auto-deploy from Git |
| Backend | Render / Railway | Free tier available |
| Database | MongoDB Atlas | Free 512MB cluster |
| Images | Cloudinary | Free 25GB storage |
| Domain | Custom (optional) | buysell-tkmce.vercel.app |

---

## 🎯 Pages Summary

| Page | Route | Auth Required |
|------|-------|--------------|
| Home | `/` | No |
| Login | `/login` | No |
| Register | `/register` | No |
| Browse Category | `/category/:name` | No |
| Search Results | `/search` | No |
| Listing Detail | `/listing/:id` | No |
| Create Listing | `/sell` | ✅ Yes |
| My Listings | `/my-listings` | ✅ Yes |
| Profile | `/profile` | ✅ Yes |
| Wishlist | `/wishlist` | ✅ Yes |
| Messages | `/messages` | ✅ Yes |
| Admin Panel | `/admin` | ✅ Admin only |

---

> [!IMPORTANT]
> This plan will be built **phase by phase**. Each phase will be completed and tested before moving to the next. Phase 1 (Project Setup) is the starting point.

> [!NOTE]
> **Estimated Build Time:** 6 phases, building incrementally. The frontend prototype with sample data can be ready first, then backend integration follows.
