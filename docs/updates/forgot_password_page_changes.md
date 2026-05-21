# Forgot Password Page Changes

**Date:** 2026-05-20
**Feature:** Forgot Password with 6-digit OTP via Gmail Email

---

## Summary

Previously, clicking **"Forgot password?"** on the login page navigated to `/forgot-password` which rendered a blank page because no route or page existed for it. This update implements a complete, production-ready, 3-step password reset flow:

1. **Step 1 — Email:** User enters their registered email. Server sends a 6-digit OTP to that email.
2. **Step 2 — OTP:** User types the 6-digit OTP received in their inbox (custom keyboard-navigable digit boxes).
3. **Step 3 — New Password:** User sets and confirms their new password. On success, they are redirected to `/login`.

The OTP is cryptographically generated, **hashed with bcrypt** before being stored in MongoDB (production-safe), and expires in **10 minutes**. A 60-second resend cooldown is enforced on the frontend.

---

## Root Cause of the Blank Page

| Problem | File | Explanation |
|---|---|---|
| Link existed but route did not | `client/src/pages/Login.jsx` line 108 | `<Link to="/forgot-password">` was already in the code |
| No route registered | `client/src/App.jsx` | `/forgot-password` was never added to `<Routes>` |
| No page component existed | `client/src/pages/` | `ForgotPassword.jsx` did not exist |

React Router silently renders nothing (blank page) when a path has no matching `<Route>`. This is the exact cause.

---

## Backend Changes

### NEW FILES

| File | Description |
|---|---|
| `server/utils/sendEmail.js` | Nodemailer utility that sends branded HTML emails via Gmail SMTP |

#### `server/utils/sendEmail.js` — Code Explanation

```js
import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,   // Gmail address from .env
      pass: process.env.EMAIL_PASS,   // Gmail App Password from .env
    },
  });

  await transporter.sendMail({
    from: `"Buy&Sell TKMCE" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,   // Full HTML email template passed in by the caller
  });
};

export default sendEmail;
```

- Uses `nodemailer` (newly installed via `npm install nodemailer`).
- Credentials are read from environment variables — never hardcoded.
- The `html` argument carries a full styled email template (dark card, teal OTP box, gradient header) that is built inside `authController.js`.

---

### MODIFIED FILES

#### `server/.env`

```env
# Added these two lines:
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

- `EMAIL_USER` → your Gmail address (e.g. `buysell.tkmce@gmail.com`)
- `EMAIL_PASS` → a **Gmail App Password** (16-char code from Google Account → Security → 2-Step Verification → App Passwords). **Not** your normal Gmail password.
- These values must also be set in your production server's environment dashboard (Render/Railway etc.). Never commit them to GitHub.

---

#### `server/models/User.js`

```js
// Added two new fields to userSchema:
resetPasswordOTP: {
  type: String,
  select: false   // never returned in normal queries — security measure
},
resetPasswordExpire: {
  type: Date,
  select: false   // same — hidden from all standard API responses
}
```

- `resetPasswordOTP` stores the **bcrypt-hashed** OTP (not the plain text OTP).
- `resetPasswordExpire` stores the exact timestamp when the OTP expires (set to `now + 10 minutes`).
- Both fields use `select: false` so they are never accidentally exposed via any API response.
- After a successful password reset both fields are set to `undefined`, removing them from the document.

**Fixed Pre-Save Middleware Bug:**
```js
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // Fix: Replaced next() callback check with clean promise-based return statement to prevent double-execution and fix TypeError: next is not a function when saving OTPs
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```
- Previously, the pre-save hook declared a `next` callback parameter inside an `async` function. In Mongoose, this triggers callback resolution bugs. The code also lacked a `return` keyword, causing it to proceed and attempt to hash an undefined password field during OTP saves, leading to database `500` server crashes. Changing it to a standard promise-based async middleware resolved this completely.

---

#### `server/controllers/authController.js`

**New imports added:**

```js
import crypto from 'crypto';       // Node.js built-in — for cryptographically secure random numbers
import bcrypt from 'bcryptjs';     // Already a dependency — now used for OTP hashing too
import sendEmail from '../utils/sendEmail.js';
```

**New function 1 — `forgotPassword`:**

```js
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email })
    .select('+resetPasswordOTP +resetPasswordExpire');

  if (!user) {
    // Always return the same message whether the email exists or not.
    // This prevents attackers from discovering which emails are registered (user enumeration attack).
    return res.json({ message: 'If that email exists, an OTP has been sent.' });
  }

  // crypto.randomInt is cryptographically secure (unlike Math.random which is not).
  const otp = crypto.randomInt(100000, 999999).toString();

  // Hash the OTP before storing — if the DB is ever breached, raw OTPs are not exposed.
  const salt = await bcrypt.genSalt(10);
  user.resetPasswordOTP = await bcrypt.hash(otp, salt);
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await user.save({ validateBeforeSave: false });

  // Send the plain OTP (before hashing) to the user's email
  await sendEmail({ to: user.email, subject: '...', html: `...${otp}...` });

  res.json({ message: 'OTP sent to your email address.' });
};
```

**New function 2 — `resetPassword`:**

```js
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email })
    .select('+resetPasswordOTP +resetPasswordExpire +password');

  // bcrypt.compare checks the plain OTP the user typed against the stored hash
  const otpMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
  if (!otpMatch) return res.status(400).json({ message: 'Invalid OTP' });

  // Check expiry — the OTP is useless after 10 minutes
  if (user.resetPasswordExpire < new Date()) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  // The User model's pre-save hook automatically re-hashes the new password via bcrypt
  user.password = newPassword;
  user.resetPasswordOTP = undefined;      // Delete OTP from DB after use
  user.resetPasswordExpire = undefined;   // Delete expiry from DB after use
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
};
```

---

#### `server/routes/authRoutes.js`

```js
// Added import:
import { ..., forgotPassword, resetPassword } from '../controllers/authController.js';

// Added two new public routes (no auth token required):
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
```

- Both routes are **public** — no `protect` middleware — because the user is not logged in when resetting their password.

---

## Frontend Changes

### NEW FILES

| File | Description |
|---|---|
| `client/src/pages/ForgotPassword.jsx` | Full 3-step password reset page with animated transitions, custom OTP input boxes, and resend cooldown |

#### `client/src/pages/ForgotPassword.jsx` — Code Explanation

The page has three internal steps controlled by a `step` state (`0`, `1`, `2`). `AnimatePresence` from Framer Motion animates the transition between steps (slide in from right, slide out to left).

**Step 0 — Email input:**
```jsx
// Calls POST /api/auth/forgot-password with the email
// On success: moves to step 1, starts 60s resend cooldown
const handleSendOtp = async (e) => {
  await api.post('/auth/forgot-password', { email });
  setStep(1);
  startCooldown(); // 60 second timer before "Resend OTP" becomes active
};
```

**Step 1 — OTP input (custom digit boxes):**
```jsx
// OtpInput component: renders 6 individual <input> boxes
// Each box only accepts a single digit via onKeyDown
// Backspace moves focus to previous box; digit entry moves focus to next box
// The full OTP string is managed as a single state: e.g. "4", "47", "473821"
const OtpInput = ({ value, onChange }) => { ... };
```

**Step 2 — New password:**
```jsx
// Calls POST /api/auth/reset-password with { email, otp, newPassword }
// On success: toast + navigate('/login')
// On OTP error from server: automatically sends user back to step 1 to re-enter OTP
const handleResetPassword = async (e) => {
  await api.post('/auth/reset-password', { email, otp, newPassword });
  navigate('/login');
};
```

**Step indicator bar:**
```jsx
// Visual progress dots at the top: filled green (✓) for completed, gradient for current, grey for upcoming
const StepDot = ({ index, current }) => ( ... );
```

---

### MODIFIED FILES

#### `client/src/App.jsx`

```jsx
// Added lazy import:
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Added public route (outside the ProtectedRoute wrapper):
<Route path="/forgot-password" element={<ForgotPassword />} />
```

- The route is placed **outside** `<ProtectedRoute>` because a logged-out user must be able to access it.
- Uses `lazy()` consistent with all other pages for code-splitting and performance.

---

## New API Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/forgot-password` | Public | Accepts `{ email }`. Generates a hashed OTP, saves it to the user's DB document, and emails the plain OTP. Always returns a generic success message. |
| `POST` | `/api/auth/reset-password` | Public | Accepts `{ email, otp, newPassword }`. Verifies OTP via bcrypt, checks expiry, updates password, clears OTP fields. |

---

## Security Notes

| Concern | How it is handled |
|---|---|
| OTP stored in DB | Hashed with bcrypt (10 rounds) — same protection as passwords |
| OTP generation | `crypto.randomInt()` — cryptographically secure, not `Math.random()` |
| OTP expiry | 10-minute TTL enforced server-side |
| User enumeration | Server always returns the same message regardless of whether the email exists |
| OTP reuse | OTP fields are deleted from DB immediately after a successful reset |
| Brute force | 60-second frontend resend cooldown (backend rate-limiting can be added with `express-rate-limit`) |

---

## How to Test

1. Go to `/login` → click **"Forgot password?"**
2. Verify the page loads (not blank) with a 3-step card UI
3. Enter a registered email → click **"Send OTP"**
4. Check the inbox of that email → you should receive a styled email with a 6-digit OTP
5. Type the OTP into the 6 digit boxes → click **"Verify OTP"**
6. Enter a new password (min 6 chars) + confirm it → click **"Reset Password"**
7. Verify you are redirected to `/login`
8. Log in with the new password → verify it works
9. Try entering a wrong OTP → verify **"Invalid OTP"** error appears
10. Wait 10+ minutes after sending OTP → try resetting → verify **"OTP has expired"** error

### Environment setup required before testing

Open `server/.env` and replace the placeholders:
```env
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password
```
> Get App Password: Google Account → Security → 2-Step Verification → App Passwords → Mail → Generate
