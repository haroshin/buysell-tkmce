# Phase 6 — Frontend Code Walkthrough (Line-by-Line)

---

## File 1: [NEW] SEO.jsx Component

📁 `client/src/components/common/SEO.jsx` — Reusable meta-tag manager.

```jsx
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  const siteTitle = 'Buy&Sell TKMCE';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDesc = 'The official marketplace for TKM College of Engineering...';
  const defaultImage = 'https://icon-library.com/...';

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      
      {/* OpenGraph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:image" content={image || defaultImage} />
```
- **Lines 1-20**: Imports `Helmet`. Accepts dynamic props like `title` and `image`. If props aren't provided, it falls back to defaults. It generates both standard HTML `<meta>` tags and OpenGraph (OG) tags used by social media platforms to generate link preview cards.

---

## File 2: [MODIFIED] App.jsx (Performance Optimization)

📁 `client/src/App.jsx` — Implementing React Lazy Loading.

```js
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
// ... 10 more lazy imports
```
- **Lines 1-18**: Replaced standard static `import Home from './pages/Home'` with `React.lazy()`. This tells Vite/Rollup during the build process to "code-split" these components into their own separate `.js` chunk files, rather than bundling them all into one massive `index.js` file.

```jsx
// Loading spinner fallback for Suspense
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 ... animate-spin"></div>
  </div>
);
```
- **Lines 20-25**: A simple spinner component. Because the javascript files for routes are now downloaded on-demand over the network, there will be a split-second delay. `Suspense` displays this loader while the chunk downloads.

```jsx
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
```
- **Lines 27-40**: `<HelmetProvider>` is added at the root so `<SEO>` components deep in the tree can modify the document head. The `<Routes>` block is wrapped in `<Suspense fallback={<PageLoader />}>` to handle the lazy-loaded components.

---

## File 3: [NEW] ReportModal.jsx

📁 `client/src/components/features/ReportModal.jsx` — Moderation UI.

```jsx
const ReportModal = ({ isOpen, onClose, reportedListingId, reportedUserId, title }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
```
- **Lines 8-10**: The modal accepts IDs for the listing or user being reported.

```jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error('Please provide a reason');

    setSubmitting(true);
    try {
      await api.post('/reports', { reportedListingId, reportedUserId, reason });
      toast.success('Report submitted successfully...');
      setReason('');
      onClose();
    } // ... catch
  };
```
- **Lines 12-28**: Validates input, sends a POST request to `/api/reports`, clears the form state, and triggers the `onClose` prop to hide the modal.

```jsx
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ...">
```
- **Lines 31-41**: Standard Framer Motion modal pattern. A dark backdrop overlay, and a centered content card that animates in (`opacity` and `scale`).

---

## File 4: [NEW] AdminDashboard.jsx

📁 `client/src/pages/AdminDashboard.jsx` — The massive control center.

### 🔹 State & Fetching

```js
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchStats(); fetchUsers(); fetchReports();
  }, []);
```
- **Lines 11-20**: Three primary data buckets. Fetches all three endpoints immediately on mount.

### 🔹 Action Handlers

```js
  const handleToggleBan = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: data.user.isBanned } : u));
    }
  };
```
- **Lines 49-56**: Calls the ban endpoint, then optimally updates the local `users` array by mapping over it and flipping the `isBanned` property of the specific user, preventing a full page refetch.

```js
  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}`, { status });
      setReports(reports.filter(r => r._id !== reportId));
      fetchStats();
    }
  };
```
- **Lines 58-66**: Updates report status. Uses `.filter()` to immediately remove the resolved report from the UI array. Calls `fetchStats()` to update the "Pending Reports" metric card.

### 🔹 UI Rendering

```jsx
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {['overview', 'users', 'reports'].map((tab) => (
            <button onClick={() => setActiveTab(tab)} className={`... ${activeTab === tab ? 'bg-primary-500 text-white' : '...'}`}>
              {tab}
            </button>
          ))}
        </div>
```
- **Lines 98-109**: Renders the tab navigation. Clicking a tab updates the `activeTab` state.

```jsx
        {/* Users Tab */}
        {activeTab === 'users' && (
           // ... table rendering ...
           <td className="p-4 text-right">
             {u.role !== 'admin' && (
               <button onClick={() => handleToggleBan(u._id)} className="...">
                 {u.isBanned ? <FiShield /> : <FiShieldOff />}
               </button>
             )}
           </td>
```
- **Lines 131-180**: The users table. The action button is completely hidden if the user row being rendered is an `admin` (since admins can't ban admins). The button toggles between a red shield (ban) and a white shield (unban) based on the `isBanned` status.

```jsx
        {/* Reports Tab */}
        {report.reportedListing && (
          <div className="flex items-center gap-2 text-dark-300">
            <FiPackage className="text-primary-400" /> 
            Target Listing: <a href={`/listing/${report.reportedListing._id}`} ...>{report.reportedListing.title}</a>
          </div>
        )}
```
- **Lines 207-212**: In the reports list, provides a direct hyperlink to the reported listing so the admin can review the content themselves in a new tab before taking action.

---

## File 5: [MODIFIED] Navbar.jsx

📁 `client/src/components/layout/Navbar.jsx`

```js
  if (isAuthenticated && user?.role === 'admin') {
    navLinks.splice(1, 0, { path: '/admin', label: 'Admin Panel', icon: HiOutlineShieldCheck });
  }
```
- **Lines 63-65**: The `navLinks` array is generated conditionally. If the user is logged in *and* has the `admin` role, we inject the Admin Panel link into the navigation array at index 1 using `.splice()`.
