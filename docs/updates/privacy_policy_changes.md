# Privacy Policy and Terms of Use Implementation Details

This document outlines the file additions, modifications, and core code logic introduced to add the **Privacy Policy** and **Terms of Use** pages to the Buy&Sell TKMCE campus marketplace.

---

## 📂 Overview of Changed Files

The feature consists of two new page components, route definitions in the application router, and updated footer links:

| Action | File | Description |
| :--- | :--- | :--- |
| **[NEW]** | [PrivacyPolicy.jsx](file:///d:/buysell/webdev/client/src/pages/PrivacyPolicy.jsx) | Official privacy statement covering Google authentication, campus verification fields, automatic chat phone number masking, and campus-exclusive data protection. |
| **[NEW]** | [TermsOfUse.jsx](file:///d:/buysell/webdev/client/src/pages/TermsOfUse.jsx) | Guidelines detailing campus eligibility, listing rules, safe transaction best practices, and moderation. |
| **[MODIFY]** | [App.jsx](file:///d:/buysell/webdev/client/src/App.jsx) | Lazy loads both pages and maps routes to `/privacy` and `/terms`. |
| **[MODIFY]** | [Footer.jsx](file:///d:/buysell/webdev/client/src/components/layout/Footer.jsx) | Connects the footer links to the correct paths instead of placeholders (`#`). |

---

## 🔍 Code Explanation File-Wise

### 1. `PrivacyPolicy.jsx` (New Page Component)
* **Path**: [PrivacyPolicy.jsx](file:///d:/buysell/webdev/client/src/pages/PrivacyPolicy.jsx)
* **Explanation**: 
  - Builds a responsive document panel containing navigation sidebar (desktop) that matches the standard color palette (slate/dark theme with primary cobalt-blue triggers).
  - Uses `framer-motion` to smoothly fade sections in on page load.
  - Integrates the `<SEO>` header utility to optimize index meta-descriptions and document headers.
  - Explains the collection of Google OAuth profile parameters (avatar, name, email) and the necessity of verification details (department, passout year, section) to protect the campus trust ecosystem.
  - Calls out **chat safety protocols**—explaining that our server automatic mask logs hide 10-digit telephone strings as `[PHONE HIDDEN]` inside messages to prevent external harassment.

```jsx
// Core interactive navigation logic
const scrollToSection = (id) => {
  setActiveSection(id);
  const element = document.getElementById(id);
  if (element) {
    const yOffset = -90; // offset for fixed navbar
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};
```

---

### 2. `TermsOfUse.jsx` (New Page Component)
* **Path**: [TermsOfUse.jsx](file:///d:/buysell/webdev/client/src/pages/TermsOfUse.jsx)
* **Explanation**:
  - Implements the counterpart document mapping. It lays out guidelines for legal eligibility, transaction safety, and campus community moderation.
  - Highlights specific **approved categories** (textbooks, hostel gear, tools) vs. **forbidden listings** (hazardous items, unauthorized digital files).
  - Strongly recommends campus-restricted in-person handovers and direct peer payment options (UPI or cash) upon physical inspection.
  - Explains the role of Class/Department Agents and Admins who possess dashboard capabilities to review, approve, and delete listings based on reports.

---

### 3. `App.jsx` (Modified Application Router)
* **Path**: [App.jsx](file:///d:/buysell/webdev/client/src/App.jsx)
* **Explanation**:
  - Registered dynamic code split components via React's `lazy` function, ensuring these pages are only fetched over-the-wire when users click the footer links.
  - Inserted Route elements inside `AppRoutes` wrapped under the custom `<PageTransition>` component.

```diff
 const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
 const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
+const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
+const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
```
```diff
         <Route path="/listing/:id" element={<PageTransition><ListingDetail /></PageTransition>} />
         <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />
+        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
+        <Route path="/terms" element={<PageTransition><TermsOfUse /></PageTransition>} />
         
         {/* Protected Routes */}
```

---

### 4. `Footer.jsx` (Modified Footer Shell)
* **Path**: [Footer.jsx](file:///d:/buysell/webdev/client/src/components/layout/Footer.jsx)
* **Explanation**:
  - Replaced the dead `#` targets inside the links with the live endpoint paths (`/privacy` and `/terms`) to make them fully clickable.

```diff
           <div className="flex items-center gap-6">
             <Link
-              to="#"
+              to="/privacy"
               className="text-dark-500 text-sm hover:text-dark-300 transition-colors"
             >
               Privacy Policy
             </Link>
             <Link
-              to="#"
+              to="/terms"
               className="text-dark-500 text-sm hover:text-dark-300 transition-colors"
             >
               Terms of Use
             </Link>
           </div>
```
