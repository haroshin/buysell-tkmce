# Phase 4 — Frontend Walkthrough Part 1: Profile & MyListings

---

## File 5: [REBUILT] Profile.jsx

📁 `client/src/pages/Profile.jsx` — Full user profile dashboard (401 lines). Previously just a basic card with name/email, now features stats, inline editing, and quick links.

### Imports (Lines 1–23)

```js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { FiEdit3, FiPackage, FiHeart, ... } from 'react-icons/fi';
```
- **Line 1**: `useState` for managing component state (edit form, loading, etc). `useEffect` for running API calls on mount.
- **Line 2**: `Link` for declarative navigation to other pages (My Listings, Wishlist, etc).
- **Line 3**: `motion` from Framer Motion — wraps HTML elements to add entrance animations (fade/slide in).
- **Line 4**: `toast` for showing success/error notification popups.
- **Line 5**: `api` is the pre-configured Axios instance that automatically attaches the JWT token to every request.
- **Line 6**: `useAuth` is the custom hook to access the auth context (current user, logout function, etc).
- **Lines 7–8**: Reusable UI components from the project's component library.
- **Lines 9–23**: Feather Icons — each icon is imported individually for tree-shaking (only used icons are bundled).

### Constants (Lines 25–36)

```js
const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  // ... 8 more
];
```
- **Lines 25–36**: Static array of TKM College department names used to populate the department dropdown in the edit form.

### Component State (Lines 38–51)

```js
const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', phone: '', department: '', year: '',
  });
```
- **Line 39**: Extracts `user` (current user object), `updateUser` (function to sync state across the app), and `logout` from the auth context.
- **Line 40**: `profileData` — full profile data fetched from the API (more complete than the context `user` which only has basic fields).
- **Line 41**: `stats` — dashboard statistics object `{ totalListings, activeListing, soldListings, wishlistCount }`.
- **Line 42**: `loading` — starts as `true`, becomes `false` once the API call completes (controls the spinner).
- **Line 43**: `isEditing` — boolean toggle for showing/hiding the edit form section.
- **Line 44**: `saving` — tracks if the update API call is in progress (disables the save button to prevent double-submission).
- **Lines 46–51**: `editForm` — controlled form state. Initialized empty, populated when profile data loads.

### API Functions (Lines 53–105)

```js
  useEffect(() => {
    fetchProfile();
  }, []);
```
- **Lines 53–55**: Runs `fetchProfile()` once on component mount (empty dependency array `[]`). This is the standard React pattern for fetching data when a page loads.

```js
  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfileData(data.user);
      setStats(data.stats);
      setEditForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        department: data.user.department || '',
        year: data.user.year || '',
      });
    } catch (error) { ... }
    finally { setLoading(false); }
  };
```
- **Line 59**: Calls `GET /api/users/profile` — the Axios instance prepends the base URL and attaches the JWT token automatically.
- **Lines 60–61**: Stores the user object and stats separately in state.
- **Lines 62–67**: Pre-populates the edit form with current values. The `|| ''` fallback ensures form inputs always have a string value (prevents React "uncontrolled to controlled" warnings).
- **Line 72**: `finally` block — sets `loading` to `false` regardless of success or failure, so the spinner always disappears.

```js
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', editForm);
      setProfileData(data.user);
      updateUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) { ... }
    finally { setSaving(false); }
  };
```
- **Line 77**: `e.preventDefault()` stops the form from performing a traditional HTML form submission (which would reload the page).
- **Line 81**: Sends a PUT request with the edit form data as the request body.
- **Line 82**: Updates the local profile data displayed on this page.
- **Line 83**: `updateUser()` from AuthContext — updates the global user state and localStorage so other components (like the Navbar avatar) reflect the change immediately.
- **Line 84**: Closes the edit form panel.

### Stats Card Data (Lines 117–154)

```js
  const statCards = [
    {
      label: 'Total Listings',
      value: stats?.totalListings || 0,
      icon: FiPackage,
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/20',
      textColor: 'text-primary-400',
    },
    // ... Active, Sold, Wishlist
  ];
```
- **Lines 117–154**: Defines an array of stat card configurations. Each card has a `label`, `value` (from API stats), `icon` (React component reference), and Tailwind color classes. This data-driven approach avoids duplicating JSX for each card — they're rendered in a `.map()` loop.

### JSX Rendering — Profile Header (Lines 156–233)

```jsx
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glass-card p-8 mb-8"
  >
```
- **Lines 161–165**: Framer Motion wrapper — element starts invisible and 20px below its final position, then animates to full opacity and correct position over 0.5 seconds. `glass-card` is a custom Tailwind component class (glassmorphism with backdrop blur).

```jsx
  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-[3px]">
    <img src={userData?.avatar} ... className="w-full h-full rounded-2xl object-cover bg-dark-800" />
  </div>
```
- **Lines 170–176**: Avatar with gradient border effect. The outer div has a gradient background with `p-[3px]` (3px padding), and the inner image fills everything except that padding, creating a colored border effect.

```jsx
  <button onClick={() => setIsEditing(!isEditing)} ...>
    {isEditing ? <FiX /> : <FiEdit3 />}
    {isEditing ? 'Cancel' : 'Edit Profile'}
  </button>
```
- **Lines 210–216**: Toggle button — switches between "Edit Profile" (with pencil icon) and "Cancel" (with X icon) depending on the `isEditing` state.

### JSX Rendering — Stats Grid (Lines 235–256)

```jsx
  <motion.div ... className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {statCards.map((stat, idx) => (
      <div className={`glass-card p-5 ${stat.borderColor} border ...`}>
        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} ...`}>
          <stat.icon className={`text-xl ${stat.textColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-dark-400">{stat.label}</p>
        </div>
      </div>
    ))}
  </motion.div>
```
- **Line 240**: Responsive grid — 2 columns on mobile, 4 columns on large screens.
- **Line 248**: `<stat.icon />` — dynamically renders the icon component stored in the stat object. React allows components to be stored as variables and rendered with JSX syntax.

### JSX Rendering — Edit Form (Lines 258–331)

```jsx
  {isEditing && (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} ...>
      <form onSubmit={handleEditSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Full Name" value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
```
- **Line 259**: Conditional rendering — the entire edit form section only renders when `isEditing` is `true`.
- **Lines 260–263**: Animated expand effect — starts at 0 height and expands.
- **Line 274**: Spread operator `{ ...editForm, name: e.target.value }` — creates a copy of the form state with only the `name` field updated. This is the standard React pattern for updating a single field in an object state.

### JSX Rendering — Quick Links (Lines 333–378)

```jsx
  <Link to="/my-listings" className="glass-card p-6 hover:border-primary-500/30 ... group ...">
    <div className="... group-hover:bg-primary-500/20 transition-colors">
      <FiPackage className="text-xl text-primary-400" />
    </div>
    <div>
      <h3 className="text-white font-semibold group-hover:text-primary-400">My Listings</h3>
    </div>
  </Link>
```
- The `group` class on the parent Link enables Tailwind's `group-hover:` variants on children. When the user hovers anywhere on the card, the icon background brightens and the title text changes color — creating a cohesive hover effect.

---

## File 6: [NEW] MyListings.jsx

📁 `client/src/pages/MyListings.jsx` — Listing management page with filter tabs, actions, and delete modal (341 lines).

### Component State (Lines 22–30)

```js
const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
```
- **Line 25**: `listings` — array of listing objects fetched from the API.
- **Line 27**: `filter` — current active tab (`'all'`, `'active'`, or `'sold'`). Defaults to `'all'`.
- **Line 28**: `deletingId` — stores the ID of a listing currently being deleted (to show loading state on that specific button).
- **Lines 29–30**: Modal state — `showDeleteModal` controls visibility, `listingToDelete` stores the full listing object so the modal can show its title.

### Data Fetching (Lines 32–48)

```js
  useEffect(() => {
    fetchListings();
  }, [filter]);
```
- **Lines 32–34**: Re-fetches listings whenever `filter` changes. So clicking a filter tab triggers a new API call automatically.

```js
  const fetchListings = async () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    const { data } = await api.get(`/users/my-listings${params}`);
    setListings(data.listings);
  };
```
- **Line 38**: Sets loading to `true` at the start (shows spinner while fetching).
- **Line 39**: Builds the query string — if filter is `'active'`, URL becomes `/users/my-listings?status=active`. If `'all'`, no query parameter is sent.
- **Line 40**: Calls the backend endpoint. The JWT token is attached automatically by the Axios interceptor.

### Action Handlers (Lines 50–82)

```js
  const handleToggleSold = async (listingId) => {
    const { data } = await api.put(`/listings/${listingId}/sold`);
    toast.success(data.message);
    fetchListings();
  };
```
- **Lines 50–59**: Calls the toggle-sold endpoint, shows a toast with the response message ("Listing marked as sold" or "Listing marked as available"), then refetches the full list to update the UI.

```js
  const confirmDelete = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };
```
- **Lines 61–64**: Opens the delete confirmation modal. Instead of deleting immediately, it stores the listing and shows a confirmation dialog — preventing accidental deletions.

```js
  const handleDelete = async () => {
    if (!listingToDelete) return;
    setDeletingId(listingToDelete._id);
    try {
      await api.delete(`/listings/${listingToDelete._id}`);
      toast.success('Listing deleted');
      setListings((prev) => prev.filter((l) => l._id !== listingToDelete._id));
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setListingToDelete(null);
    }
  };
```
- **Line 67**: Guard clause — prevents execution if somehow called without a listing selected.
- **Line 71**: Sends DELETE request to the backend.
- **Line 73**: Optimistic update — removes the listing from the local state array immediately without refetching from the server. `filter()` creates a new array excluding the deleted listing.
- **Lines 77–80**: Cleanup in `finally` — resets all modal-related state regardless of success/failure.

### Filter Tabs UI (Lines 129–150)

```jsx
  {filterTabs.map((tab) => (
    <button
      onClick={() => setFilter(tab.key)}
      className={`... ${
        filter === tab.key
          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25'
          : 'bg-dark-800 text-dark-300 border border-dark-700 ...'
      }`}
    >
      {tab.label}
    </button>
  ))}
```
- **Lines 136–149**: Renders 3 filter buttons. The active tab gets highlighted styling (purple background/text/border), inactive tabs get muted dark styling. Clicking a tab updates the `filter` state, which triggers the `useEffect` to refetch listings.

### Listing Row UI (Lines 178–283)

```jsx
  <motion.div
    className={`glass-card overflow-hidden ${listing.isSold ? 'opacity-75' : ''}`}
  >
    <div className="flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <Link to={`/listing/${listing._id}`} className="sm:w-48 sm:h-36 ...">
        <img src={listing.images?.[0] || defaultImage} ... />
      </Link>
```
- **Line 186**: Sold listings get `opacity-75` — visually dimmed to indicate they're no longer active.
- **Line 188**: Layout switches from vertical (stacked) on mobile to horizontal (side-by-side) on larger screens using `flex-col sm:flex-row`.
- **Line 195**: `listing.images?.[0]` — optional chaining on the array. If `images` is undefined or empty, falls back to placeholder.

```jsx
      {/* Actions */}
      <div className="flex sm:flex-col gap-2 ...">
        <Link to={`/edit-listing/${listing._id}`} ...>
          <FiEdit3 /> Edit
        </Link>
        <button onClick={() => handleToggleSold(listing._id)} ...>
          {listing.isSold ? <><FiRotateCcw /> Relist</> : <><FiCheckCircle /> Sold</>}
        </button>
        <button onClick={() => confirmDelete(listing)} ...>
          <FiTrash2 /> Delete
        </button>
      </div>
```
- **Line 246**: Edit link navigates to `/edit-listing/:id` — the EditListing page.
- **Lines 253–267**: Sold toggle button changes its label and color based on current state:
  - If already sold: shows "Relist" with green accent styling.
  - If active: shows "Sold" with yellow styling.
- **Line 270**: Delete button opens the confirmation modal instead of deleting directly.

### Delete Modal (Lines 285–333)

```jsx
  <AnimatePresence>
    {showDeleteModal && (
      <>
        <motion.div className="overlay" onClick={() => setShowDeleteModal(false)} />
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full border border-red-500/20">
            <FiAlertCircle className="text-2xl text-red-400" />
            <h3>Delete Listing?</h3>
            <p>Are you sure you want to delete "{listingToDelete?.title}"?</p>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
```
- **Line 286**: `AnimatePresence` enables exit animations — without it, React would instantly unmount the modal.
- **Line 289–295**: Two-layer approach: a dark backdrop overlay (clicking it closes the modal) and a centered modal container.
- **Line 308**: Shows the listing title in the confirmation message so the user knows exactly what they're deleting.
