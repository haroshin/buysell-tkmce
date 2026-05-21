# Phase 4 — Backend Code Walkthrough (Line-by-Line)

---

## File 1: [NEW] userController.js

📁 `server/controllers/userController.js` — Contains 5 API endpoint handlers for user profile, listings, and wishlist management.

```js
import User from '../models/User.js';
import Listing from '../models/Listing.js';
```
- **Line 1**: Imports the `User` Mongoose model — needed to find/update user documents in MongoDB.
- **Line 2**: Imports the `Listing` Mongoose model — needed to count listings and verify listing existence for wishlist.

---

### 🔹 getProfile (Lines 4–48)

```js
// @desc    Get user profile (full details)
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
```
- **Lines 4–6**: JSDoc-style comments documenting the endpoint's purpose, HTTP route, and access level.
- **Line 7**: Declares an async arrow function exported as a named export. Takes Express `req` (request) and `res` (response) objects.

```js
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'listings',
        options: { sort: { createdAt: -1 } }
      });
```
- **Line 8**: Opens a try-catch block for error handling.
- **Lines 9–13**: Finds the user by their ID (`req.user._id` is set by the `protect` middleware after JWT verification). `.populate()` replaces the `listings` ObjectId array with actual listing documents, sorted newest-first.

```js
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
```
- **Lines 15–17**: Guard clause — if no user found, return 404 error and stop execution.

```js
    const totalListings = await Listing.countDocuments({ seller: req.user._id });
    const activeListing = await Listing.countDocuments({ seller: req.user._id, isActive: true, isSold: false });
    const soldListings = await Listing.countDocuments({ seller: req.user._id, isSold: true });
```
- **Line 20**: Counts ALL listings where the `seller` field matches the current user's ID.
- **Line 21**: Counts only listings that are both `isActive: true` AND `isSold: false` — these are currently visible on the marketplace.
- **Line 22**: Counts only listings marked as sold (`isSold: true`).

```js
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      stats: {
        totalListings,
        activeListing,
        soldListings,
        wishlistCount: user.wishlist?.length || 0
      }
    });
```
- **Lines 24–43**: Sends back a JSON response with two objects:
  - `user`: Explicitly picks safe fields to return (avoids leaking password hash or other sensitive data).
  - `stats`: Dashboard statistics computed above. `wishlistCount` uses optional chaining (`?.`) — if `wishlist` is undefined, it defaults to `0`.

```js
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
```
- **Lines 44–47**: Catch block — logs the error to server console and returns a generic 500 error to the client.

---

### 🔹 updateProfile (Lines 50–88)

```js
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, department, year, avatar } = req.body;
```
- **Line 55**: Finds the user document by ID (not using `findByIdAndUpdate` because we want Mongoose middleware like `pre('save')` to run if needed).
- **Line 61**: Destructures the editable fields from the request body. Note: `email` and `password` are intentionally excluded — they cannot be changed through this endpoint.

```js
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (avatar !== undefined) user.avatar = avatar;
```
- **Lines 63–67**: Conditionally updates each field. `name` uses truthy check (can't be empty string). Other fields use `!== undefined` check so that empty strings and `null` are valid values (user can clear their phone number).

```js
    const updatedUser = await user.save();
```
- **Line 69**: Saves the modified document back to MongoDB. Mongoose validators run on save, and any `pre('save')` middleware executes (important for the password hashing hook in the User model, though password isn't changed here).

```js
    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        // ... other safe fields
      }
    });
```
- **Lines 71–83**: Returns the updated user data. The frontend uses this to update the local auth context state.

---

### 🔹 getMyListings (Lines 90–115)

```js
export const getMyListings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.user._id };
```
- **Line 95**: Extracts the optional `status` query parameter from the URL (e.g., `?status=active`).
- **Line 97**: Starts building a MongoDB query object. Every query must filter by `seller` matching the current user.

```js
    if (status === 'active') {
      query.isActive = true;
      query.isSold = false;
    } else if (status === 'sold') {
      query.isSold = true;
    }
```
- **Lines 99–104**: Adds additional filters based on the `status` parameter:
  - `'active'`: Only currently-listed items (active and not sold).
  - `'sold'`: Only sold items.
  - No status / `'all'`: Returns everything (no additional filter).

```js
    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .populate('seller', 'name avatar department');

    res.json({ listings });
```
- **Lines 106–110**: Executes the query, sorts newest-first, populates the `seller` reference with only `name`, `avatar`, and `department` fields. Returns the array wrapped in an object.

---

### 🔹 toggleWishlist (Lines 117–152)

```js
export const toggleWishlist = async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);
```
- **Line 122**: Gets the listing ID from the URL parameter (e.g., `/wishlist/abc123`).
- **Line 123**: Fetches the full user document (need the `wishlist` array to modify).

```js
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
```
- **Lines 130–133**: Verifies the listing actually exists before adding to wishlist. Prevents saving references to deleted listings.

```js
    const index = user.wishlist.indexOf(listingId);
```
- **Line 135**: Searches the `wishlist` array for the listing ID. Returns the index if found, or `-1` if not.

```js
    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from wishlist', wishlisted: false, wishlist: user.wishlist });
    } else {
      user.wishlist.push(listingId);
      await user.save();
      res.json({ message: 'Added to wishlist', wishlisted: true, wishlist: user.wishlist });
    }
```
- **Lines 137–146**: Toggle logic:
  - **If found** (`index > -1`): Removes it using `splice()` (removes 1 element at that index). Returns `wishlisted: false`.
  - **If not found**: Adds it with `push()`. Returns `wishlisted: true`.
  - The `wishlisted` boolean is used by the frontend to update the heart icon immediately.

---

### 🔹 getWishlist (Lines 154–179)

```js
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: {
        path: 'seller',
        select: 'name avatar department'
      }
    });
```
- **Lines 159–165**: Nested populate — first replaces ObjectIds in `wishlist` with full Listing documents, then within each listing, replaces the `seller` ObjectId with User data (name, avatar, department). This gives the frontend everything needed to render listing cards.

```js
    const wishlist = user.wishlist.filter(item => item !== null);
    res.json({ listings: wishlist });
```
- **Line 172**: Filters out `null` entries. This handles cases where a listing was wishlisted but later deleted from the database — the ObjectId would still be in the array but `populate()` returns `null` for missing documents.
- **Line 174**: Returns the filtered array as `listings` to match the same shape used by other listing endpoints.

---

## File 2: [NEW] userRoutes.js

📁 `server/routes/userRoutes.js` — Maps URL paths to controller functions.

```js
import express from 'express';
import {
  getProfile, updateProfile, getMyListings, toggleWishlist, getWishlist
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
```
- **Lines 1–9**: Imports Express, all 5 controller functions, and the JWT authentication middleware.

```js
const router = express.Router();
```
- **Line 11**: Creates a new Express Router instance — a mini-application that can have its own routes.

```js
router.use(protect);
```
- **Line 14**: Applies the `protect` middleware to ALL routes in this file. Every request must include a valid JWT token in the `Authorization` header. This is cleaner than adding `protect` to each route individually.

```js
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);
```
- **Lines 16–18**: Route chaining — GET `/profile` calls `getProfile`, PUT `/profile` calls `updateProfile`. Same URL, different HTTP methods.

```js
router.get('/my-listings', getMyListings);
```
- **Line 20**: GET `/my-listings` — fetches the current user's listings. Accepts optional `?status=active|sold` query parameter.

```js
router.route('/wishlist')
  .get(getWishlist);
router.post('/wishlist/:id', toggleWishlist);
```
- **Lines 22–25**: Two wishlist routes:
  - GET `/wishlist` — returns all wishlisted items.
  - POST `/wishlist/:id` — toggles a specific listing in/out of wishlist. The `:id` is a URL parameter captured as `req.params.id`.

```js
export default router;
```
- **Line 27**: Exports the router so `server.js` can mount it.

---

## File 3: [MODIFIED] server.js

📁 `server/server.js` — Only 2 lines were added:

```diff
+import userRoutes from './routes/userRoutes.js';
```
- **Line 8**: Imports the new user routes module.

```diff
+app.use('/api/users', userRoutes);
```
- **Line 29**: Mounts the user router at the `/api/users` prefix. So `router.get('/profile')` in userRoutes becomes `GET /api/users/profile` in the full app.

---

## File 4: [MODIFIED] listingController.js — markAsSold

📁 `server/controllers/listingController.js` — Only the `markAsSold` function was changed (lines 159–188):

```diff
-// @desc    Mark listing as sold
+// @desc    Toggle listing sold status
```
- Comment updated to reflect the new toggle behavior.

```diff
-    listing.isSold = true;
-    listing.isActive = false;
+    listing.isSold = !listing.isSold;
+    listing.isActive = !listing.isSold;
```
- **Line 175**: `!listing.isSold` — flips the boolean. If it was `false`, becomes `true` (sold). If it was `true`, becomes `false` (available again).
- **Line 176**: `isActive` is always the opposite of `isSold`. When sold, the listing becomes inactive (hidden from marketplace). When relisted, it becomes active again.

```diff
-    res.json({ message: 'Listing marked as sold' });
+    res.json({ 
+      message: listing.isSold ? 'Listing marked as sold' : 'Listing marked as available',
+      isSold: listing.isSold,
+      isActive: listing.isActive
+    });
```
- **Lines 179–183**: Response now includes:
  - Dynamic message based on the new state.
  - `isSold` and `isActive` booleans so the frontend can update the UI without refetching.
