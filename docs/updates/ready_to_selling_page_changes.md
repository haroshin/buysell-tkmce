# Ready to Selling Page Changes

**Date:** 2026-05-21
**Feature:** Dynamic CTA Redirection based on Auth State

---

## Summary

In the landing/home page (`Home.jsx`), the call-to-action (CTA) section under **"Ready to start selling?"** contained a button labeled **"Get Started Free"** which unconditionally redirected users to `/register` (signup page).

This update implements two improvements:
1. **Dynamic Redirection:** If a user is already logged in (`isAuthenticated === true`), clicking the button redirects them directly to the **Sell page** (`/sell`). Otherwise, it redirects them to the **Signup page** (`/register`).
2. **Button Relabel:** Changed the button text from **"Get Started Free"** to **"Start Selling"** as requested.

---

## Code Changes

### MODIFIED FILES

#### `client/src/pages/Home.jsx`

```diff
@@ -13,6 +13,7 @@
 import api from '../services/api';
 import ListingCard from '../components/features/ListingCard';
 import SEO from '../components/common/SEO';
+import { useAuth } from '../context/AuthContext';
 
 const fadeInUp = {
   initial: { opacity: 0, y: 30 },
@@ -28,6 +28,7 @@
 };
 
 const Home = () => {
+  const { isAuthenticated } = useAuth();
   const [searchQuery, setSearchQuery] = useState('');
   const [recentListings, setRecentListings] = useState([]);
   const [loading, setLoading] = useState(true);
@@ -377,10 +377,10 @@
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link
-                  to="/register"
+                  to={isAuthenticated ? "/sell" : "/register"}
                   className="btn-primary text-base py-3 px-8 flex items-center gap-2"
                 >
-                  Get Started Free
+                  Start Selling
                   <HiOutlineArrowRight />
                 </Link>
                 <Link
```

- **Imports:** Imported `useAuth` from `../context/AuthContext`.
- **Logic:** Extracted the `isAuthenticated` status from the auth context.
- **Markup:** Used a ternary conditional `isAuthenticated ? "/sell" : "/register"` inside the `<Link>` component's `to` parameter and updated the button label to `"Start Selling"`.

---

## Verification & Testing

### Scenario 1: User is Logged Out
1. Open the application and ensure you are **logged out**.
2. Scroll to the bottom of the Home page to find the **"Ready to start selling?"** section.
3. Verify the primary button displays **"Start Selling"**.
4. Click **"Start Selling"**.
5. Verify you are redirected to the Signup page (`/register`).

### Scenario 2: User is Logged In
1. Log into your account.
2. Navigate back to the Home page.
3. Scroll to the bottom to find the **"Ready to start selling?"** section.
4. Click **"Start Selling"**.
5. Verify you are redirected directly to the Sell page (`/sell`).
