# Google OAuth Integration & Optional Phone Number Setup

This document records the modifications made to add Google Sign-In and handle mandatory profile setup on first login, along with making the phone number optional on registration.

---

## 📂 Summary of Touched Files

### Backend (Server)

| Action | File Path | Description |
| :--- | :--- | :--- |
| **Modify** | [User.js](file:///d:/buysell/webdev/server/models/User.js) | Added `googleId` field, made `password` conditionally required. |
| **Modify** | [authController.js](file:///d:/buysell/webdev/server/controllers/authController.js) | Implemented `googleLogin` using Google tokeninfo API validation. |
| **Modify** | [authRoutes.js](file:///d:/buysell/webdev/server/routes/authRoutes.js) | Registered `/api/auth/google` POST route. |
| **Modify** | [.env (Server)](file:///d:/buysell/webdev/server/.env) | Appended `GOOGLE_CLIENT_ID` configuration variable. |

### Frontend (Client)

| Action | File Path | Description |
| :--- | :--- | :--- |
| **Modify** | [index.html](file:///d:/buysell/webdev/client/index.html) | Added Google Identity Services script tag to `<head>`. |
| **Modify** | [.env (Client)](file:///d:/buysell/webdev/client/.env) | Created client-side `.env` and added `VITE_GOOGLE_CLIENT_ID`. |
| **Modify** | [AuthContext.jsx](file:///d:/buysell/webdev/client/src/context/AuthContext.jsx) | Added `loginWithGoogle` request context helper. |
| **Modify** | [Login.jsx](file:///d:/buysell/webdev/client/src/pages/Login.jsx) | Initialized Google login client and rendered the Google Sign-In button. |
| **Modify** | [Register.jsx](file:///d:/buysell/webdev/client/src/pages/Register.jsx) | Initialized Google client, rendered Sign-Up button, and made phone number optional. |
| **NEW** | [CompleteProfileModal.jsx](file:///d:/buysell/webdev/client/src/components/features/CompleteProfileModal.jsx) | Fullscreen blocking profile setup form for first-time Google sign-ins. |
| **Modify** | [App.jsx](file:///d:/buysell/webdev/client/src/App.jsx) | Rendered the `CompleteProfileModal` globally inside the app shell. |

---

## 💻 Detailed Code Explanations

### 1. User Database Schema & Password validation
* **File:** [User.js](file:///d:/buysell/webdev/server/models/User.js)
* **Explanation:**
  - Added `googleId` to keep track of the user's unique Google Identifier. Set `sparse: true` to prevent duplicate null values.
  - Set the `password` field's `required` validator to a dynamic function:
    ```js
    required: function() {
      return !this.googleId;
    }
    ```
    This ensures normal registration still requires passwords, but Google logins can bypass this check and save users without passwords securely.

### 2. Backend Google OAuth Controller Logic
* **File:** [authController.js](file:///d:/buysell/webdev/server/controllers/authController.js)
* **Explanation:**
  - Destructured `idToken` from client request body.
  - Queried Google's secure token information endpoint (`https://oauth2.googleapis.com/tokeninfo`) using native `fetch`:
    ```js
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    ```
  - Extracted email, name, avatar picture, and the Google `sub` unique user ID.
  - Searched for existing accounts using either the same `googleId` or the same college `email` address.
  - Automatically linked existing standard accounts to their Google ID upon logging in via Google for the first time.
  - Created a new user account if they did not exist, leaving `department` and `passoutYear` fields undefined (which later triggers profile setup).

### 3. Loading Google client API
* **File:** [index.html](file:///d:/buysell/webdev/client/index.html)
* **Explanation:**
  - Injected the Google API Client SDK loader:
    ```html
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    ```
    This script exposes the global `window.google` interface on page load.

### 4. AuthContext login handler
* **File:** [AuthContext.jsx](file:///d:/buysell/webdev/client/src/context/AuthContext.jsx)
* **Explanation:**
  - Exposed a `loginWithGoogle(idToken)` wrapper function to the application.
  - Makes a POST request to `/auth/google` with the retrieved token, saves the returned session token and user details to `localStorage`, and updates state.

### 5. Login/Signup Page Button Rendering
* **Files:** [Login.jsx](file:///d:/buysell/webdev/client/src/pages/Login.jsx) & [Register.jsx](file:///d:/buysell/webdev/client/src/pages/Register.jsx)
* **Explanation:**
  - Integrated a `useEffect` loop that safely waits for `window.google` client script to load, then triggers:
    ```js
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });
    ```
  - Calls `window.google.accounts.id.renderButton` to paint the standard, customizable Google Sign-In and Sign-Up buttons inside matching placeholder `div` containers.
  - Removed standard HTML validation requirements (`required`) for phone numbers in `Register.jsx`, so they are now fully optional.

### 6. Enforcing Profile Setup (Modal Block)
* **Files:** [CompleteProfileModal.jsx](file:///d:/buysell/webdev/client/src/components/features/CompleteProfileModal.jsx) & [App.jsx](file:///d:/buysell/webdev/client/src/App.jsx)
* **Explanation:**
  - The modal checks if an authenticated user profile is incomplete using this rule:
    ```js
    const isProfileIncomplete = () => {
      if (!user) return false;
      if (!user.department || !user.passoutYear) return true;

      const hasMultipleSections = user.department === 'Mechanical Engineering';
      const hasABSections = A_B_SECTION_DEPARTMENTS.has(user.department);
      if ((hasMultipleSections || hasABSections) && (!user.section || user.section === 'None')) {
        return true;
      }
      return false;
    };
    ```
  - If incomplete, it locks the page behind a fullscreen dark backdrop overlay and displays dropdown fields to set up **Department**, **Passout Year**, **Section**, and **Phone Number (Optional)**.
  - Enforces the section logic: Mechanical shows A/B/C sections, CSE/ECE/EEE/Civil show A/B, other departments auto-set Section A, and MTech sets no section.
  - Form submission updates the user profile backend via `PUT /api/users/profile`, closing the overlay when complete.
