# Phase 6 — Backend Code Walkthrough (Line-by-Line)

---

## File 1: [NEW] Report.js Model

📁 `server/models/Report.js` — Mongoose schema for the moderation system.

```js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
```
- **Lines 1-16**: Defines the core relationships. A report must have a `reporter`. It can optionally target a `reportedListing` AND/OR a `reportedUser`. This flexibility allows users to report either an offensive item or an abusive seller.

```js
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the report'],
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});
```
- **Lines 17-31**: `reason` stores the user's explanation. `status` tracks the administrative workflow, defaulting to `pending`. `adminNotes` provides an optional internal memo field for moderators to leave notes on why a report was resolved or dismissed.

---

## File 2: [MODIFIED] User.js & auth.js Middleware

📁 `server/models/User.js`

```diff
   role: {
     type: String,
     enum: ['user', 'admin'],
     default: 'user'
   },
+  isBanned: {
+    type: Boolean,
+    default: false
+  },
```
- Added the `isBanned` boolean field. When set to `true` by an admin, the user loses platform access.

📁 `server/middleware/auth.js`

```diff
       // Get user from the token
       req.user = await User.findById(decoded.id).select('-password');
 
+      if (req.user.isBanned) {
+        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
+      }
+
       next();
```
- In the `protect` middleware, right after validating the JWT token, we check if the user's `isBanned` flag is true. If it is, we instantly reject the request with a `403 Forbidden` status. This securely locks banned users out of all protected routes system-wide.

---

## File 3: [NEW] adminController.js

📁 `server/controllers/adminController.js` — High privilege endpoints.

### 🔹 getDashboardStats

```js
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ isActive: true });
    const soldListings = await Listing.countDocuments({ isSold: true });
    const activeReports = await Report.countDocuments({ status: 'pending' });

    res.json({ totalUsers, totalListings, activeListings, soldListings, activeReports });
  }
```
- Executes 5 parallel (awaiting sequentially here for simplicity, though `Promise.all` could be used) count queries across three different collections to generate the top-level KPI metrics for the Admin Dashboard overview tab.

### 🔹 toggleUserBan

```js
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot ban another admin' });
      }
      
      user.isBanned = !user.isBanned;
      await user.save();
      
      res.json({ 
        message: user.isBanned ? 'User has been banned' : 'User has been unbanned',
        user: { _id: user._id, name: user.name, isBanned: user.isBanned }
      });
```
- Fetches the user by ID. A critical security check prevents an admin from accidentally (or maliciously) banning another administrator. Flips the boolean, saves, and returns the new status to update the frontend UI.

### 🔹 deleteListing

```js
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Remove from seller's listings array
      await User.findByIdAndUpdate(listing.seller, { $pull: { listings: listing._id } });

      // Remove from any wishlists
      await User.updateMany({ wishlist: listing._id }, { $pull: { wishlist: listing._id } });

      await listing.deleteOne();
      res.json({ message: 'Listing removed by admin' });
```
- Not only deletes the listing, but cleans up the database references. It removes the listing ID from the seller's `listings` array, and iterates through ALL users to remove it from any `wishlist` arrays, preventing dead links.

---

## File 4: [NEW] reportController.js

📁 `server/controllers/reportController.js`

### 🔹 submitReport

```js
    if (reportedListingId) {
      const listing = await Listing.findById(reportedListingId);
      // ...
      if (listing.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report your own listing' });
      }
    }
```
- Protects against abuse by preventing users from reporting their own listings or their own accounts. Validates that the targeted entity actually exists before creating the report.

### 🔹 getReports

```js
    const query = status === 'all' ? {} : { status };
    
    const count = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email isBanned')
      .populate('reportedListing', 'title isSold isActive')
      .sort({ createdAt: -1 })
      // ... pagination
```
- Fetches reports and heavily populates them with nested data. Notice it pulls `isBanned` from the `reportedUser` so the admin dashboard can clearly display if the offending user has already been dealt with.

---

## File 5: Routing & Registration

📁 `server/routes/adminRoutes.js`
```js
router.use(protect, admin);
router.route('/stats').get(getDashboardStats);
// ...
```
- The `router.use(protect, admin)` applies BOTH security middlewares to every single route in this file. `protect` verifies the JWT, and `admin` verifies `req.user.role === 'admin'`.

📁 `server/server.js`
```diff
+import adminRoutes from './routes/adminRoutes.js';
+import reportRoutes from './routes/reportRoutes.js';
...
+app.use('/api/admin', adminRoutes);
+app.use('/api/reports', reportRoutes);
```
- Mounts the new router files to the Express application.
