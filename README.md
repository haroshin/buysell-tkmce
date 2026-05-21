# 🎓 Buy&Sell TKMCE — Campus Marketplace

> A trusted, student-only buy & sell platform built for TKM College of Engineering (TKMCE).  
> Verified students can list, discover, and purchase items safely through a class-agent broker system.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

- 🔐 **Campus-Verified Users** — Only registered TKMCE students can access the platform
- 🏷️ **Item Listings** — Post textbooks, electronics, lab equipment, and more with photos
- 🤝 **Class Agent Broker System** — Buyers are routed to their class agent who facilitates the deal and collects a 10% platform fee
- 💬 **Secure Messaging** — Direct chat between students and agents; phone numbers are auto-masked
- 🎫 **Support Tickets** — Students can raise support tickets; admins manage and resolve them
- 🌗 **Light & Dark Mode** — Cobalt & Neon Yellow-Gold premium theme with smooth toggle
- ⚡ **Premium Animations** — GPU-accelerated page transitions, staggered grids, animated counters, and glow effects
- 🛡️ **Admin Dashboard** — Manage users, listings, reports, and support tickets

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & page transitions |
| React Router v6 | Client-side routing |
| Axios | API communication |
| React Hot Toast | Notification toasts |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment config |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/haroshin/buysell-tkmce.git
cd buysell-tkmce
```

### 2. Configure environment variables

**Server** — create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Client** — create `client/.env` (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install dependencies & start

**Backend:**
```bash
cd server
npm install
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
buysell-tkmce/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── common/      # Button, Card, Input, SEO...
│       │   ├── features/    # ListingCard, etc.
│       │   └── layout/      # Navbar, Footer, SupportWidget
│       ├── context/         # AuthContext, ThemeContext
│       ├── pages/           # All route pages
│       ├── services/        # Axios API client
│       └── utils/           # Constants, helpers
│
├── server/                  # Node.js + Express backend
│   ├── config/              # DB connection
│   ├── controllers/         # Route handler logic
│   ├── middleware/          # Auth, enforcement middleware
│   ├── models/              # Mongoose schemas
│   └── routes/              # Express route definitions
│
└── docs/                    # Feature documentation & changelogs
```

---

## 🎨 Design System

- **Primary**: Cobalt Blue `#2563EB` (light) / Neon Blue `#60A5FA` (dark)
- **Accent**: Laser Gold-Yellow `#FACC15`
- **Background**: Frosty Icy Blue `#F4F7FC` (light) / Midnight Charcoal `#090C15` (dark)
- **Font**: Inter (Google Fonts)

---

## 🤝 Contributing

This project is built by students for students. Pull requests are welcome.

---

## 📄 License

MIT © Haroshin K K
