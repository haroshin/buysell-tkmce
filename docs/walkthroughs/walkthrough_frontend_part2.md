# Phase 4 — Frontend Walkthrough Part 2: Wishlist, EditListing, ListingDetail & App

---

## File 7: [NEW] Wishlist.jsx

📁 `client/src/pages/Wishlist.jsx` — Displays saved/wishlisted items in a card grid (148 lines).

### Imports & State (Lines 1–16)

```js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import ListingCard from '../components/features/ListingCard';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
```
- **Line 6**: Reuses the existing `ListingCard` component (from Phase 3) — keeps the UI consistent with the home page and category pages.

```js
const Wishlist = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
```
- **Line 14**: `listings` — array of wishlisted listing objects.
- **Line 16**: `removingId` — tracks which item is currently being removed (shows a tiny spinner on that specific card's remove button).

### Data Fetching (Lines 18–32)

```js
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/users/wishlist');
      setListings(data.listings);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };
```
- **Line 24**: Calls `GET /api/users/wishlist`. The backend returns listings fully populated with seller data, so `ListingCard` can render them directly without any additional API calls.

### Remove Handler (Lines 34–46)

```js
  const removeFromWishlist = async (listingId) => {
    setRemovingId(listingId);
    try {
      await api.post(`/users/wishlist/${listingId}`);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setRemovingId(null);
    }
  };
```
- **Line 35**: Sets the removing ID to show a loading spinner on the specific card being removed.
- **Line 37**: Calls the same toggle endpoint used for adding — since the item is already in the wishlist, calling it again removes it.
- **Line 38**: Optimistic local update — immediately removes the card from the displayed list without waiting for a page refresh.

### Empty State (Lines 81–99)

```jsx
  {listings.length === 0 ? (
    <motion.div className="text-center py-20">
      <div className="w-24 h-24 rounded-3xl bg-dark-800 ...">
        <FiHeart className="text-4xl text-dark-500" />
      </div>
      <h3>Your wishlist is empty</h3>
      <p>Browse the marketplace and tap the heart icon on items you love to save them here.</p>
      <Link to="/" className="btn-primary ...">
        <FiShoppingBag /> Browse Marketplace
      </Link>
    </motion.div>
  )
```
- **Lines 81–99**: When there are no wishlisted items, shows a friendly empty state with a large heart icon, explanatory text, and a CTA button linking back to the homepage.

### Card Grid with Remove Overlay (Lines 100–139)

```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <AnimatePresence>
      {listings.map((listing, idx) => (
        <motion.div
          key={listing._id}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative group"
        >
          <ListingCard listing={listing} />

          {/* Remove Button Overlay */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeFromWishlist(listing._id);
            }}
            className="absolute top-3 left-3 z-10 ... opacity-0 group-hover:opacity-100"
          >
            {removingId === listing._id ? (
              <div className="... animate-spin"></div>
            ) : (
              <FiTrash2 />
            )}
          </button>

          {/* Solid heart indicator */}
          <div className="absolute top-3 right-14 z-10">
            <FiHeart className="text-pink-500 fill-pink-500 ..." />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
```
- **Line 101**: Responsive grid — 1 column mobile, 2 tablet, 3 desktop.
- **Line 102**: `AnimatePresence` allows the `exit` animation on line 108 to play when items are removed.
- **Line 108**: Exit animation — card shrinks and fades out when removed. Without `AnimatePresence`, React would instantly unmount it.
- **Line 110**: `className="relative group"` — `relative` creates a positioning context for the absolute-positioned overlay buttons. `group` enables `group-hover:` for child elements.
- **Lines 116–118**: `e.preventDefault()` and `e.stopPropagation()` — the `ListingCard` is wrapped in a `Link`, so clicking the remove button would also navigate to the listing detail page. These calls prevent that.
- **Line 122**: `opacity-0 group-hover:opacity-100` — the remove button is invisible by default, appears only when hovering over the card. Creates a clean look while keeping the action accessible.
- **Lines 125–128**: Shows a spinning loader on the specific card being removed, or a trash icon otherwise.
- **Lines 133–135**: A filled pink heart icon is overlaid on each card to visually indicate that every item here is wishlisted.

---

## File 8: [NEW] EditListing.jsx

📁 `client/src/pages/EditListing.jsx` — Pre-filled form for editing an existing listing (320 lines).

### Constants (Lines 17–31)

```js
const CATEGORIES = [
  'Textbooks & Notes', 'Electronics', 'Project Components',
  'Gaming', 'Hostel Essentials', 'Fashion',
  'Pets', 'Sports & Fitness', 'Transport',
  'Events & Tickets', 'Others',
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
```
- **Lines 17–31**: These match the `enum` values defined in the `Listing` Mongoose schema. They must be identical — if a value doesn't match the enum, MongoDB will reject the update.

### State & Data Loading (Lines 33–83)

```js
const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '',
    condition: '', location: '', isNegotiable: false, images: [],
  });
```
- **Line 34**: `useParams()` extracts the `:id` from the URL path `/edit-listing/:id`.
- **Line 35**: `useNavigate()` for programmatic navigation (redirect after save, go back).
- **Lines 40–49**: Form state object — initialized empty, then populated from the API.

```js
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);

        // Verify ownership
        if (data.seller?._id !== user?._id) {
          toast.error('You can only edit your own listings');
          navigate('/my-listings');
          return;
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price || '',
          // ... all fields
        });
      } catch (error) {
        toast.error('Listing not found');
        navigate('/my-listings');
      }
    };
    fetchListing();
  }, [id, user, navigate]);
```
- **Line 54**: Fetches the listing data using the same public endpoint used by the detail page.
- **Lines 57–60**: **Frontend ownership check** — compares the listing's seller ID with the current user's ID. If they don't match, shows an error and redirects. (The backend also checks ownership on the PUT request, so this is defense-in-depth.)
- **Lines 63–72**: Populates the form state with the existing listing data. The `|| ''` fallbacks ensure empty strings for missing fields.
- **Lines 73–76**: If the listing doesn't exist (404 from API), shows an error and redirects.
- **Line 83**: Dependency array `[id, user, navigate]` — re-runs if any of these change (e.g., navigating to edit a different listing).

### Form Handlers (Lines 85–124)

```js
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
```
- **Lines 85–91**: Generic change handler for all form fields. Uses the input's `name` attribute as the key. For checkboxes, uses `checked` (boolean) instead of `value` (string). `[name]` is a computed property name — dynamically sets the key.

```js
  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };
```
- **Lines 93–98**: Removes an image at a specific index. `filter()` creates a new array excluding the image at position `index`.

```js
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.price ||
        !form.category || !form.condition || !form.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      await api.put(`/listings/${id}`, payload);
      toast.success('Listing updated successfully!');
      navigate(`/listing/${id}`);
    } catch (error) { ... }
  };
```
- **Lines 103–106**: Client-side validation before sending the request. `trim()` ensures whitespace-only strings are rejected.
- **Line 112**: Converts the price string to a Number before sending. HTML number inputs still produce string values.
- **Line 115**: Sends PUT to `/api/listings/:id`. The backend's `updateListing` controller handles the update with ownership verification.
- **Line 117**: After successful update, navigates to the listing detail page to see the result.

### Image Preview UI (Lines 271–295)

```jsx
  {form.images.length > 0 && (
    <div className="flex gap-3 flex-wrap">
      {form.images.map((img, idx) => (
        <div className="relative group w-24 h-24 rounded-xl overflow-hidden ...">
          <img src={img} ... className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemoveImage(idx)}
            className="absolute inset-0 bg-black/60 ... opacity-0 group-hover:opacity-100"
          >
            <FiX className="text-white text-xl" />
          </button>
        </div>
      ))}
    </div>
  )}
```
- **Line 272**: Only renders the images section if there are images to show.
- **Line 285**: `type="button"` — prevents this button from submitting the form (default button type inside a form is `submit`).
- **Line 287**: Dark overlay with X icon appears on hover, covering the entire image thumbnail. Clicking it removes that image from the array.

### Negotiable Toggle (Lines 255–269)

```jsx
  <input type="checkbox" name="isNegotiable" checked={form.isNegotiable}
    onChange={handleChange} className="sr-only peer" />
  <div className="w-11 h-6 bg-dark-700 rounded-full peer
    peer-checked:bg-primary-500 ... after:content-[''] after:absolute
    after:bg-white after:rounded-full after:h-5 after:w-5
    after:transition-all peer-checked:after:translate-x-full">
  </div>
```
- **Line 263**: `sr-only` hides the actual checkbox (screen-reader only). The visual toggle is built with pure CSS using Tailwind's `peer` modifier.
- **Line 266**: `peer-checked:bg-primary-500` — when the hidden checkbox is checked, the track background turns purple. `peer-checked:after:translate-x-full` — the white circle (knob) slides to the right.

---

## File 9: [MODIFIED] ListingDetail.jsx

📁 `client/src/pages/ListingDetail.jsx` — Listing detail view with functional wishlist/sold buttons (331 lines, previously 189 lines).

### New State Variables (Lines 30–32)

```js
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [soldLoading, setSoldLoading] = useState(false);
```
- **Line 30**: Tracks whether the current listing is in the user's wishlist (controls the heart icon fill).
- **Line 31**: Loading state for the wishlist toggle button.
- **Line 32**: Loading state for the mark-as-sold button.

### Wishlist Status Check (Lines 64–77)

```js
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await api.get('/users/wishlist');
        const ids = data.listings.map((l) => l._id);
        setWishlisted(ids.includes(id));
      } catch (e) {
        // Non-critical
      }
    };
    checkWishlist();
  }, [id, isAuthenticated]);
```
- **Line 67**: Skip check if user isn't logged in — unauthenticated users can't have wishlists.
- **Line 69**: Fetches the full wishlist to get all listing IDs.
- **Line 70**: Extracts just the `_id` values into a flat array.
- **Line 71**: Checks if the current listing's ID is in that array. Sets the `wishlisted` state accordingly.
- **Line 73**: Silent failure — this is a UI enhancement, not critical functionality. If it fails, the heart just defaults to unfilled.

### Wishlist Toggle Handler (Lines 79–97)

```js
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      const { data } = await api.post(`/users/wishlist/${id}`);
      setWishlisted(data.wishlisted);
      toast.success(data.message);
    } catch (error) { ... }
    finally { setWishlistLoading(false); }
  };
```
- **Lines 80–84**: Unauthenticated user guard — if someone clicks the heart without being logged in, they get redirected to login.
- **Line 89**: Uses the `wishlisted` boolean from the API response to update the heart icon state. This is more reliable than toggling locally, because the server is the source of truth.

### Mark as Sold Handler (Lines 99–115)

```js
  const handleMarkAsSold = async () => {
    setSoldLoading(true);
    try {
      const { data } = await api.put(`/listings/${id}/sold`);
      toast.success(data.message);
      setListing((prev) => ({
        ...prev,
        isSold: data.isSold,
        isActive: data.isActive,
      }));
    } catch (error) { ... }
  };
```
- **Lines 104–108**: Updates the listing state locally with the values returned from the API. This immediately:
  - Shows/hides the "SOLD" overlay on the image.
  - Shows/hides the red "Sold" badge.
  - Shows/hides the sold banner at the top.
  - Changes the button text between "Mark as Sold" and "Mark as Available".

### Sold Banner & Image Overlay (Lines 154–188)

```jsx
  {listing.isSold && (
    <motion.div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center">
      <p className="text-red-400 font-semibold ...">
        <FiCheckCircle /> This item has been sold
      </p>
    </motion.div>
  )}
```
- **Lines 155–165**: Red banner that appears at the top of the page when the item is sold.

```jsx
  {listing.isSold && (
    <div className="absolute inset-0 bg-dark-900/50 flex items-center justify-center">
      <span className="text-2xl font-black text-red-400 bg-dark-900/80 px-6 py-3 rounded-xl border border-red-500/30">
        SOLD
      </span>
    </div>
  )}
```
- **Lines 182–188**: Semi-transparent dark overlay on the main image with a large "SOLD" text stamp in the center.

### Updated Action Buttons (Lines 276–320)

```jsx
  {!isOwner ? (
    <>
      <Button variant="primary" ...>
        <FiMessageSquare /> Message Seller
      </Button>
      <Button variant="outline" onClick={handleToggleWishlist} disabled={wishlistLoading}>
        <FiHeart size={24} className={wishlisted ? 'fill-pink-500 text-pink-500' : ''} />
      </Button>
    </>
  ) : (
    <div className="w-full space-y-3">
      <div className="bg-primary-500/10 ...">This is your listing</div>
      <div className="flex gap-4">
        <Link to={`/edit-listing/${listing._id}`}>
          <Button variant="outline"><FiEdit3 /> Edit Listing</Button>
        </Link>
        <Button variant={listing.isSold ? 'secondary' : 'danger'} onClick={handleMarkAsSold}>
          {listing.isSold ? 'Mark as Available' : 'Mark as Sold'}
        </Button>
      </div>
    </div>
  )}
```
- **Lines 277–293**: **Buyer view** (not the owner):
  - Message Seller button (placeholder for Phase 5 messaging).
  - Heart/wishlist button — `wishlisted ? 'fill-pink-500 text-pink-500' : ''` fills the heart icon pink when wishlisted, outline when not. `disabled={wishlistLoading}` prevents double-clicks.

- **Lines 294–319**: **Owner view** (the seller):
  - Info banner: "This is your listing".
  - Edit button wrapped in `<Link>` — navigates to `/edit-listing/:id`.
  - Sold toggle button — changes variant between `danger` (red) and `secondary` (green/teal) based on current sold state. Label dynamically shows "Mark as Sold" or "Mark as Available".

---

## File 10: [MODIFIED] App.jsx

📁 `client/src/App.jsx` — Application router (79 lines).

### New Imports (Lines 12, 16–17)

```diff
+import EditListing from './pages/EditListing';
+import MyListings from './pages/MyListings';
+import Wishlist from './pages/Wishlist';
```
- Three new page components imported for routing.

### New Protected Routes (Lines 38–40)

```jsx
  <Route element={<ProtectedRoute />}>
    <Route path="/profile" element={<Profile />} />
    <Route path="/sell" element={<CreateListing />} />
    <Route path="/edit-listing/:id" element={<EditListing />} />   {/* NEW */}
    <Route path="/my-listings" element={<MyListings />} />         {/* NEW */}
    <Route path="/wishlist" element={<Wishlist />} />              {/* NEW */}
  </Route>
```
- **Line 35**: `<ProtectedRoute />` is a wrapper that checks if the user is authenticated. If not, it redirects to `/login`. All child routes require authentication.
- **Line 38**: `/edit-listing/:id` — the `:id` is a dynamic URL parameter. React Router makes it available via `useParams()` in the EditListing component.
- **Line 39**: `/my-listings` — maps to the MyListings management page.
- **Line 40**: `/wishlist` — maps to the Wishlist page.

> [!NOTE]
> The Navbar component (unchanged in Phase 4) already had links to `/my-listings`, `/wishlist`, and `/profile` in its nav links array from the earlier phases. These links now correctly resolve to the new pages.

---

## Build Verification

```
✓ 504 modules transformed
✓ built in 24.58s

dist/index.html                   0.72 kB
dist/assets/index-yo8tXWbc.css   50.90 kB
dist/assets/index-dkiVA2LI.js   519.67 kB
```

- **0 errors** — all imports resolve, all components render, all API calls are correctly structured.
