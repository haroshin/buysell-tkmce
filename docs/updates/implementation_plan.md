# Class-Based Agent Broker & Fee Collection System

This plan outlines the architecture and steps required to build a localized broker system. Agents designated for each class (Department + Passout Year + Section) act as **brokers** between buyers and sellers, and physically collect the 10% platform fee.

---

## Complete End-to-End Workflow

```
Bob (Buyer) → [Contact Agent to Buy] → Charlie (Buyer's Class Agent)
                                                ↓
                                   Agent Dashboard shows request
                                                ↓
                          Charlie → [Contact Seller] → Alice (Seller)
                                                ↓
                              Agent negotiates price & meetup
                                                ↓
                              Physical exchange happens on campus
                                                ↓
                          Agent clicks [Mark as Completed]
                              → 10% fee is recorded as Collected
```

### What each party sees in the Messages inbox:

| Person | What they see |
|---|---|
| **Bob (Buyer)** | A chat thread with Charlie (his Agent) about the Textbook |
| **Charlie (Agent)** | Thread 1: Bob asking about the Textbook. Thread 2: Alice (Seller) being negotiated with |
| **Alice (Seller)** | A chat thread with Charlie (the Agent) |

---

## Message Routing Rules

```
Standard User  ──→  BLOCKED from messaging Seller directly
Agent          ──→  ALLOWED to message Seller directly
Admin          ──→  ALLOWED to message anyone
```

The core routing logic in the backend:

```javascript
// If sender is a regular user → redirect to their Agent
if (req.user.role === 'user') {
  receiverId = buyerAgent._id; // Override to Buyer's Class Agent
}

// If sender is an Agent → allow direct message to Seller
if (req.user.role === 'agent') {
  receiverId = req.body.receiverId; // Keep original Seller as receiver
}
```

---

## Platform Leakage Mitigation

To prevent users from bypassing the platform fee:
1. **Hide Contact Info:** Remove direct phone numbers and emails from public listings. All contact must go through the in-app messaging system.
2. **Chat Filtering:** Any message containing a 10-digit number sequence will be masked as `[PHONE HIDDEN]` before saving to the database. (Regex: `/\b\d[\d\s\-]{8,}\d\b/g`)
3. **Warning System:** Add a prominent warning in the chat that bypassing the platform fee will result in a permanent account ban.
4. **Smart Deletion Flag:** If a user deletes a listing after active conversations, the system flags it for Admin review.

---

## Proposed Changes

### Backend Models & Architecture

#### [MODIFY] server/models/User.js
- Add `'agent'` to the `role` enum → `['user', 'agent', 'admin']`.
- **Replace `year` with `passoutYear`** (Number). Never needs manual updates.
- **Add `section`** field (Enum: `['A', 'B', 'C', 'None']`). MTech defaults to `'None'`.
- Agent identity = unique combination of `department` + `passoutYear` + `section`.

#### [NEW] server/models/Transaction.js
- Tracks the full lifecycle of a brokered deal.
- Fields:
  - `listing` → the item being sold
  - `buyer` → the student buying
  - `seller` → the student selling
  - `brokerAgent` → the agent brokering the deal
  - `platformFee` → 10% of the listing price
  - `status` → Enum: `['Requested', 'In Progress', 'Completed', 'Cancelled']`
  - `createdAt`, `completedAt`

---

### Backend Controllers & Routes

#### [MODIFY] server/controllers/messageController.js
- **Buyer Routing:** When a standard user (`role: 'user'`) tries to send a message about a listing:
  1. Backend looks up the **Buyer's Agent** by matching `department` + `passoutYear` + `section`.
  2. The `receiverId` is automatically overridden to be the Buyer's Agent.
  3. A new `Transaction` record is created with status `'Requested'`.
- **Agent Privilege:** When an agent sends a message, the `receiverId` is kept as-is, allowing them to reach the Seller directly.
- **Admin Fallback:** If no agent exists for the buyer's class, route to an Admin.
- **Phone Regex Filter:** Mask phone numbers in all messages before saving to DB.

#### [NEW] server/controllers/agentController.js
- `getActiveTransactions` → Fetch all Transactions where `brokerAgent` = logged-in agent.
- `updateTransactionStatus` → Let agent move status from `Requested` → `In Progress` → `Completed`.
- `getAssignedFees` → Fetch all pending 10% fees for collection.

#### [NEW] server/middleware/enforcementMiddleware.js
- Runs on listing creation and messaging routes.
- Checks if the user has any `Transaction` with `platformFee` unpaid and older than 7 days.
- Blocks with `403 Forbidden` if overdue fees exist, prompting them to pay their class agent.

---

### Frontend Features

#### [MODIFY] client/src/pages/Register.jsx & Profile.jsx
- **Department dropdown:** Standardized list of all 11 TKMCE departments.
- **Passout Year dropdown:** Dynamically generated via `new Date().getFullYear()` showing current year + next 4 years. Will never go outdated.
- **Section dropdown (A, B, C):** Conditionally hidden/disabled when "MTech" is selected.

#### [MODIFY] Listing Detail Page
- Change **"Message Seller"** button to **"Contact Agent to Buy"**.
- Remove direct display of seller phone/email.

#### [NEW] client/src/pages/AgentDashboard.jsx
- Protected page visible only to `agent` or `admin` roles.
- Shows all active Transactions the agent is brokering.
- Each row shows: Buyer name, Item, Price, Platform Fee (10%), Status, and action buttons ("Contact Seller", "Mark Complete").

#### [MODIFY] client/src/components/Header.jsx
- Add "Agent Dashboard" nav link visible only to agents and admins.

#### [MODIFY] client/src/pages/Profile.jsx
- Add "Pending Fees" section visible to all users.
- If a user has an overdue fee, show a red warning banner blocking new listings.

---

## Verification Plan

### Backend Tests
- A standard user message to a seller is rerouted to the buyer's agent.
- An agent message to a seller is delivered without rerouting.
- Phone numbers in messages are masked to `[PHONE HIDDEN]`.
- Users with overdue fees cannot create new listings.
- If no class agent exists, the message falls back to an Admin.

### Manual Verification Steps
1. Register **User A** (Buyer: Civil, passoutYear 2027, Section A).
2. Register **User B** (Agent: Civil, passoutYear 2027, Section A).
3. Register **User C** (Seller: Mech, passoutYear 2026, Section B) with a listing.
4. Log in as User A → click "Contact Agent to Buy" on User C's listing.
5. Verify the chat opens with **User B (the Agent)**, not User C.
6. Log in as User B (Agent) → verify the buyer's request appears on the Agent Dashboard.
7. Agent clicks "Contact Seller" → verify a new chat thread opens with User C.
8. Agent clicks "Mark as Completed" → verify `Transaction.status` updates and fee is recorded.
