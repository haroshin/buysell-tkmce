# Changes Log — Agent Broker & Fee Collection System

**Date:** 2026-05-18  
**Feature:** Class-Based Agent Broker System (10% Platform Fee)

---

## Summary
This update introduces a full agent-broker system. Buyers now contact their own class agent (matched by Department + Passout Year + Section) instead of messaging sellers directly. The agent facilitates the deal and collects a 10% platform fee. Phone numbers are automatically masked in all chats.

---

## Backend Changes

### NEW FILES

| File | Description |
|---|---|
| `server/models/Transaction.js` | New model to track the full lifecycle of a brokered deal (buyer, seller, agent, fee, status) |
| `server/controllers/agentController.js` | 3 new functions: `getActiveTransactions`, `updateTransactionStatus`, `getAgentStats` |
| `server/routes/agentRoutes.js` | New protected routes under `/api/agent/` requiring `agentOrAdmin` role |
| `server/middleware/enforcement.js` | Middleware that blocks users with overdue fees (>7 days) from creating listings or messaging |

### MODIFIED FILES

#### `server/models/User.js`
- Replaced `year` (enum 1-4) → `passoutYear` (Number, no manual update needed)
- Added `section` field (Enum: `'A'`, `'B'`, `'C'`, `'None'`)
- Updated `role` enum from `['user', 'admin']` → `['user', 'agent', 'admin']`

#### `server/models/Listing.js`
- Added `soldAt` Date field to track exactly when a product was purchased and completed

#### `server/controllers/authController.js`
- `registerUser`: Now accepts `passoutYear` and `section` instead of `year`
- `getUserProfile`: Now returns `passoutYear` and `section` in the response

#### `server/controllers/messageController.js`
- Added **Broker Routing Logic** in `sendMessage`:
  - Standard users (`role: 'user'`) are automatically rerouted to their class Agent
  - Agent is found by matching `department` + `passoutYear` + `section`
  - Falls back to an Admin if no agent is found for that class
  - Creates a `Transaction` record when a buyer first contacts an agent
- Added **Broker Routing Override** in `getMessages`:
  - Standard users are automatically redirected to their class Agent's chat thread, ensuring they never see the Seller's name, avatar, or department details
- Agents and admins can message anyone directly (no rerouting)
- Added **Phone Number Masking**: Regex `/\b\d[\d\s\-]{8,}\d\b/g` masks phone numbers as `[PHONE HIDDEN]`

#### `server/middleware/auth.js`
- Added new `agentOrAdmin` middleware function (allows both agents and admins to pass)
- Exported alongside existing `protect` and `admin`

#### `server/routes/messageRoutes.js`
- Added `checkPendingFees` enforcement middleware to the `POST /send` route

#### `server/routes/listingRoutes.js`
- Added `checkPendingFees` enforcement middleware to the `POST /` (createListing) route

#### `server/server.js`
- Imported and registered `agentRoutes` under `/api/agent`

#### `server/controllers/listingController.js`
- Updated `getListings` query to filter out listings that are marked as sold (`isSold: true`) only if the sale happened **more than 7 days ago**, implementing the requested persistence policy

#### `server/controllers/agentController.js`
- Modified `updateTransactionStatus`: When an agent marks a transaction as `Completed`, it automatically sets the associated listing's `isSold: true` and `soldAt: new Date()` in the database

---

## Frontend Changes

### NEW FILES

| File | Description |
|---|---|
| `client/src/pages/AgentDashboard.jsx` | Full agent dashboard with stats cards, filter tabs, and transaction management table |
| `client/src/components/common/ScrollToTop.jsx` | Helper component to reset window scroll position to (0,0) on page transitions |

### MODIFIED FILES

#### `client/src/pages/Register.jsx`
- Replaced `year` dropdown (static 1-4) with `passoutYear` dropdown (dynamically generated from `new Date().getFullYear()` + 4 years ahead — self-updating every year)
- Added `section` dropdown (A, B, C) that automatically hides itself if the user selects **MTech**
- Updated `formData` state accordingly

#### `client/src/pages/ListingDetail.jsx`
- Changed **"Message Seller"** button text to **"Contact Agent to Buy"**
- Updated the toast error message accordingly
- Automatically hides the purchase CTA and shows a disabled **"Sold Out"** badge if the item is already sold

#### `client/src/components/features/ListingCard.jsx`
- Added a gorgeous, high-end visual overlay and **"Sold"** badge for items marked as completed, ensuring they are distinct but remain visible for the 7-day retention period

#### `client/src/App.jsx`
- Added lazy import for `AgentDashboard`
- Added protected route `/agent` → `<AgentDashboard />`
- Imported and integrated `<ScrollToTop />` right inside the main router to fix scroll preservation bugs on route navigation

#### `client/src/components/layout/Navbar.jsx`
- Added Agent Dashboard to the mobile nav links array (visible to `agent` and `admin` roles)
- Added Agent Dashboard icon link to the desktop navbar (visible to `agent` and `admin` roles)

---

## New API Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/agent/stats` | Agent/Admin | Get dashboard stats (requested, in-progress, completed, fees) |
| `GET` | `/api/agent/transactions` | Agent/Admin | Get all assigned transactions |
| `PUT` | `/api/agent/transactions/:id` | Agent/Admin | Update a transaction status |

---

## How to Test

1. Register 3 users:
   - **Agent**: Department = `Civil Engineering`, passoutYear = `2027`, Section = `A`, role = `agent` (set in DB)
   - **Buyer**: Department = `Civil Engineering`, passoutYear = `2027`, Section = `A`, role = `user`
   - **Seller**: Any department, has an active listing
2. Log in as **Buyer** → go to the Seller's listing → click **"Contact Agent to Buy"**
3. Verify the chat thread opens with the **Agent**, not the Seller
4. Log in as **Agent** → go to `/agent` → verify the transaction appears as "Requested"
5. Agent clicks **"Contact Seller"** → verify a new chat opens with the Seller
6. Agent clicks **"Mark Complete"** → verify status updates to "Completed"
7. Try sending a phone number (e.g., `9876543210`) in chat → verify it is stored as `[PHONE HIDDEN]`


