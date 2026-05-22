# Support Ticket System

**Date:** 2026-05-22  
**Feature:** Full Support Ticket System — Student Submission, Profile Tracking & Admin Management

---

## Summary

Added a complete support ticket system to the Buy&Sell TKMCE platform. Students can raise help requests in two places — the **Support Widget** (sticky floating button) and the **Profile page** — and track replies directly in their profile. Admins receive email alerts and manage all tickets from a new tab in the **Admin Dashboard**, where they can filter by status, expand individual tickets, write replies, and update ticket status. Email notifications are sent automatically at each stage using the existing Gmail/Nodemailer utility.

---

## What Changed

| Area | What Was Added |
|---|---|
| Backend | New `Ticket` model, controller (4 functions), route file, registered in `server.js` |
| Admin stats | `openTickets` count added to `/api/admin/stats` response |
| Support Widget | Inline ticket form slides in as a second "view" within the popup |
| Profile page | "My Support Tickets" section — create form + accordion ticket list |
| Admin Dashboard | New "Tickets" tab — status filter, expandable ticket cards, inline reply + status form |

---

## Files & Code Explanation

---

### 1. [NEW] `server/models/Ticket.js`

Defines the MongoDB schema for a support ticket.

```javascript
const ticketSchema = new mongoose.Schema({
  user        // ObjectId → ref to User who submitted it
  subject     // String, max 150 chars — ticket title
  category    // Enum: 'account' | 'listing' | 'payment' | 'agent' | 'other'
  priority    // Enum: 'low' | 'medium' | 'high'   (default: 'medium')
  description // String, max 2000 chars — full issue text
  status      // Enum: 'open' | 'in_progress' | 'resolved' | 'closed'  (default: 'open')
  adminReply  // String — admin's response text
  adminRepliedAt // Date — timestamp of last admin reply
}, { timestamps: true });
```

**Why these fields?**
- `category` lets the admin quickly triage the type of issue without reading the description.
- `priority` lets students flag urgency; the admin dashboard shows it as a colour-coded badge.
- `adminReply` + `adminRepliedAt` are stored as top-level fields (not an array) to keep it simple — one active reply per ticket is sufficient for this platform scale.

---

### 2. [NEW] `server/controllers/ticketController.js`

Four exported async functions:

#### `createTicket` — `POST /api/tickets`
- Validates that `subject`, `category`, and `description` are provided.
- Creates the ticket in MongoDB.
- Sends **two emails** via `sendEmail`:
  1. **Admin notification** — styled HTML email to `EMAIL_USER` with all ticket details (student name, subject, category, priority, description).
  2. **User confirmation** — styled HTML email back to the student with their ticket ID and a summary.
- Email failures are caught silently (try/catch) so a broken email config never crashes ticket creation.

```javascript
// Notify admin
await sendEmail({
  to: process.env.EMAIL_USER,
  subject: `[New Ticket #${ticket._id.toString().slice(-6).toUpperCase()}] ${subject}`,
  html: `...styled HTML...`,
});

// Confirm to user
await sendEmail({
  to: populatedTicket.user.email,
  subject: `Your ticket has been received — #${ticket._id.toString().slice(-6).toUpperCase()}`,
  html: `...styled HTML...`,
});
```

> The ticket ID shown in emails is the **last 6 characters** of the MongoDB ObjectId, uppercased — e.g. `#A3F9C2`. This is short and human-readable without exposing the full ObjectId.

---

#### `getMyTickets` — `GET /api/tickets/mine`
- Returns all tickets where `user === req.user._id`, sorted newest first.
- No pagination (students rarely have many tickets).

```javascript
const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
```

---

#### `getAllTickets` — `GET /api/tickets` *(admin only)*
- Supports `?status=open|in_progress|resolved|closed|all` query param.
- Paginated (10 per page) with `populate('user', 'name email avatar department')`.
- Returns `{ tickets, page, pages, total }`.

```javascript
const query = status && status !== 'all' ? { status } : {};
const tickets = await Ticket.find(query)
  .populate('user', 'name email avatar department')
  .sort({ createdAt: -1 })
  .limit(pageSize)
  .skip(pageSize * (page - 1));
```

---

#### `replyToTicket` — `PUT /api/tickets/:id/reply` *(admin only)*
- Updates `status` and/or `adminReply` + `adminRepliedAt`.
- Sends a **reply notification email** to the student with the admin's message and the new status badge.

```javascript
ticket.status = status;
ticket.adminReply = adminReply.trim();
ticket.adminRepliedAt = new Date();
await ticket.save();
// → sends email to ticket.user.email
```

---

### 3. [NEW] `server/routes/ticketRoutes.js`

```javascript
// User routes
router.route('/').post(protect, createTicket);         // Create a ticket
router.route('/mine').get(protect, getMyTickets);      // Get own tickets

// Admin routes
router.route('/').get(protect, admin, getAllTickets);          // Get all tickets
router.route('/:id/reply').put(protect, admin, replyToTicket); // Reply + update status
```

**Important:** `/mine` is registered **before** `/:id` routes to avoid Express matching the literal string `"mine"` as a MongoDB ObjectId parameter.

---

### 4. [MODIFIED] `server/server.js`

Two lines added:

```javascript
// Import
import ticketRoutes from './routes/ticketRoutes.js';

// Register
app.use('/api/tickets', ticketRoutes);
```

---

### 5. [MODIFIED] `server/controllers/adminController.js`

Added `Ticket` import and a new count to the `getDashboardStats` function:

```javascript
import Ticket from '../models/Ticket.js';

// Inside getDashboardStats:
const openTickets = await Ticket.countDocuments({
  status: { $in: ['open', 'in_progress'] }
});

res.json({
  totalUsers,
  totalListings,
  activeListings,
  soldListings,
  activeReports,
  openTickets,   // ← new field
});
```

This powers both the **stat card** in the Admin Dashboard overview and the **live count badge** on the Tickets tab button.

---

### 6. [MODIFIED] `client/src/components/layout/SupportWidget.jsx`

The widget now has two internal **views** managed by a `view` state (`'main'` | `'ticket'`):

#### View Switching
```javascript
const [view, setView] = useState('main');

// Resets to 'main' when widget closes
useEffect(() => {
  if (!isOpen) setTimeout(() => setView('main'), 300);
}, [isOpen]);
```

#### "Create a Support Ticket" Button (in main view)
Added between the "Contact Class Agent" CTA and the quick-links grid:

```jsx
<button onClick={handleOpenTicket} className="w-full py-3 px-4 rounded-xl ...">
  <p className="text-sm font-semibold ...">Create a Support Ticket</p>
  <p className="text-xs text-dark-400 ...">Get help from the admin team</p>
  <HiOutlineTicket className="..." />
</button>
```

If the user is not logged in, `handleOpenTicket` redirects to `/login` instead of showing the form.

#### Ticket Form View (slides in with AnimatePresence)
When `view === 'ticket'`:
- **Back arrow** in the header returns to `'main'`
- Header icon/title changes to a ticket icon and "Create a Ticket"
- Form fields: Subject (text input), Category (select), Priority (3 pill buttons), Description (textarea with char counter)
- Submits to `POST /api/tickets`, shows success toast, resets form, closes widget

```jsx
const handleTicketSubmit = async (e) => {
  e.preventDefault();
  await api.post('/tickets', ticketForm);
  toast.success("Ticket submitted! We'll get back to you soon.");
  setView('main');
  setIsOpen(false);
};
```

---

### 7. [MODIFIED] `client/src/pages/Profile.jsx`

#### New Imports
```javascript
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence added
import { FiLifeBuoy, FiChevronDown, FiChevronUp, FiPlus, FiSend, FiLoader } from 'react-icons/fi';
```

#### New State
```javascript
const [tickets, setTickets] = useState([]);
const [ticketsLoading, setTicketsLoading] = useState(false);
const [openTicketIdx, setOpenTicketIdx] = useState(null);   // which accordion item is open
const [showTicketForm, setShowTicketForm] = useState(false);
const [ticketSubmitting, setTicketSubmitting] = useState(false);
const [ticketForm, setTicketForm] = useState({
  subject: '', category: '', priority: 'medium', description: ''
});
```

#### `fetchMyTickets()`
Called on component mount alongside `fetchProfile()`. Hits `GET /api/tickets/mine` and stores the array in `tickets` state.

#### `handleTicketSubmit()`
Validates required fields, posts to `POST /api/tickets`, then calls `fetchMyTickets()` to refresh the list.

#### "My Support Tickets" Section (in JSX)
Placed between the Quick Links grid and the Sign Out button. Structure:

```
┌─ glass-card ──────────────────────────────────────┐
│  🛟 My Support Tickets          [+ New Ticket]    │
│                                                    │
│  ┌─ Animated create form (collapse/expand) ──────┐ │
│  │  Subject / Category / Priority / Description  │ │
│  │  [Submit Ticket]                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Ticket accordion ────────────────────────────┐ │
│  │  [Open] My laptop charger isn't working  [Med]│ │
│  │   ↓ expanded:                                 │ │
│  │    Your Message: ...                          │ │
│  │    Admin Reply: ...  (or "Waiting..." spinner)│ │
│  └───────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Status badge colours:**
| Status | Colour |
|---|---|
| Open | Blue |
| In Progress | Amber |
| Resolved | Emerald/Green |
| Closed | Grey |

**Priority badge colours:**
| Priority | Colour |
|---|---|
| Low | Emerald/Green |
| Medium | Amber |
| High | Red |

---

### 8. [MODIFIED] `client/src/pages/AdminDashboard.jsx`

#### New Imports
```javascript
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiSend } from 'react-icons/fi';
```

#### New State
```javascript
const [tickets, setTickets] = useState([]);
const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
const [expandedTicket, setExpandedTicket] = useState(null);   // ticket._id or null
const [replyForms, setReplyForms] = useState({});             // { [ticketId]: { adminReply, status } }
const [replySubmitting, setReplySubmitting] = useState({});   // { [ticketId]: boolean }
```

#### `fetchTickets(status = 'all')`
Fetches tickets from `GET /api/tickets?status=<filter>`. Called on mount and every time the admin clicks a filter button.

#### `handleReplySubmit(ticketId)`
- Validates that a reply message was typed.
- PUTs to `/api/tickets/:id/reply` with `{ status, adminReply }`.
- On success: updates the local `tickets` array in-place, resets the reply form for that ticket, collapses the card, refreshes stats.

#### "Open Tickets" Stat Card
```javascript
{ 
  label: 'Open Tickets',
  value: stats?.openTickets || 0,
  icon: FiMessageSquare,
  color: 'text-violet-400',
  bg: 'bg-violet-500/10',
  border: 'border-violet-500/20'
}
```

#### Tickets Tab Button
The tab label dynamically shows the open count when non-zero:
```javascript
{tab === 'tickets' 
  ? `Tickets${stats?.openTickets ? ` (${stats.openTickets})` : ''}` 
  : tab}
// → renders as "Tickets (3)" or just "Tickets"
```

#### Tickets Tab Panel Layout
```
┌─ Status filter bar ───────────────────────────────┐
│  [All] [Open] [In Progress] [Resolved] [Closed]   │
└────────────────────────────────────────────────────┘

┌─ Ticket card (glass-card) ────────────────────────┐
│  [Avatar] Subject title           [Open] [Medium] │
│           Student Name · Category      [▼ / ▲]    │
│                                                    │
│  ↓ expanded:                                      │
│  ┌─ Student's Message ──────────────────────────┐ │
│  │ "My issue description..."                    │ │
│  └──────────────────────────────────────────────┘ │
│  ┌─ Your Previous Reply (if any) ───────────────┐ │
│  │ "Previous reply text..."                     │ │
│  └──────────────────────────────────────────────┘ │
│  Reply & Update Status:                           │
│  ┌─ textarea ──────────────────┐ ┌─ Set Status ┐ │
│  │ Type reply...               │ │ [dropdown]  │ │
│  └─────────────────────────────┘ │ [Send Reply]│ │
│                                  └─────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## API Endpoints Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tickets` | User | Create a new ticket |
| `GET` | `/api/tickets/mine` | User | Get own tickets |
| `GET` | `/api/tickets` | Admin | Get all tickets (filterable by status) |
| `PUT` | `/api/tickets/:id/reply` | Admin | Reply to ticket + update status |

---

## Email Notifications Flow

```
Student submits ticket
        │
        ├──→ Admin gets: [New Ticket #XXXXXX] Subject — full details email
        └──→ Student gets: Ticket received confirmation with ticket ID

Admin replies via dashboard
        │
        └──→ Student gets: Ticket updated — status badge + admin reply text
```

All emails use the existing `sendEmail()` utility (`server/utils/sendEmail.js`) with the Gmail credentials from `.env` (`EMAIL_USER`, `EMAIL_PASS`). Email failures are caught and logged but do **not** block the API response.

---

## Troubleshooting & Deployment Notes

### Issue: `POST /api/tickets` returning 404 after deploy

**Root Cause:** The server was running with `npm start` → `node server.js` (plain Node, no auto-restart). New files added at runtime (`Ticket.js`, `ticketController.js`, `ticketRoutes.js`) and the changes to `server.js` are **not loaded** until the process is restarted.

**Fix:** Stop the server (`Ctrl+C`) and restart with `npm start`.

> **Recommendation:** Use `npm run dev` (nodemon) during development so the server auto-restarts on every file change. Reserve `npm start` for production only.

---

### Issue: Toast shows "Failed to submit ticket" with no useful message

**Root Cause:** The `api.js` response interceptor automatically clears the token and redirects to `/login` on any `401` response:

```javascript
if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

If the ticket API returns `401 Not authorized, no token` (because the user's session expired or the token was lost), the interceptor silently redirects. The toast shows `'Failed to submit ticket'` because `error.response?.data?.message` is never read — the redirect fires first.

**Fix:** Log back in and retry. The token is restored after login.

---

### Issue: Two `router.route('/')` calls on same path

In `ticketRoutes.js`, both `POST /` (user) and `GET /` (admin) are registered using `.route('/')` called twice. Express creates two separate Route objects on the stack, but this works correctly — each Route only responds to its registered HTTP method.

The cleaner pattern (if refactoring in future) would be to chain them:

```javascript
router.route('/')
  .post(protect, createTicket)
  .get(protect, admin, getAllTickets);
```

Both approaches behave identically in Express 4 and 5.

---

### Server Start Order

The ticket routes depend on MongoDB being connected (via `Ticket.create()`). Always ensure:
1. MongoDB is running locally (`mongod` or Docker)
2. `MONGO_URI` in `.env` is correct
3. Server starts cleanly — watch for `MongoDB Connected` in the startup log before testing
