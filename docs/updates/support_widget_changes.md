# Support Widget — Feature Documentation

**Date:** 2026-05-21  
**Feature:** Global Sticky Support Widget  
**Status:** ✅ Complete — Production build verified (`✓ 518 modules, built in 1.29s`)

---

## Overview

A premium, always-visible floating support button has been added to the bottom-right corner of every page across the entire application. It persists through all page navigations and scroll positions. Clicking it opens a glassmorphic support card with agent contact routing, quick navigation links, and a collapsible FAQ accordion.

---

## Changed Files

| File | Change Type | Description |
|------|-------------|-------------|
| `client/src/components/layout/SupportWidget.jsx` | **NEW** | The full support widget component |
| `client/src/App.jsx` | **MODIFIED** | Imported and rendered `<SupportWidget />` globally |

---

## File 1 — `SupportWidget.jsx` (NEW)

**Path:** `client/src/components/layout/SupportWidget.jsx`

This is the main component file. It is completely self-contained and manages all its own state internally.

### Imports & Dependencies

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiX, HiChevronDown, HiChevronUp,
         HiOutlineQuestionMarkCircle, HiOutlineShieldCheck,
         HiOutlineArrowRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
```

| Import | Purpose |
|--------|---------|
| `useState` | Controls whether the card is open (`isOpen`) and which FAQ is expanded (`activeFaq`) |
| `useEffect` | Registers a document-level click listener to close the widget on outside-click |
| `useRef` | Attaches a `ref` to the widget container to detect outside clicks accurately |
| `useNavigate` | Programmatically navigates users to `/messages` or `/login` on agent CTA click |
| `Link` | Renders the quick-link navigation buttons (Browse Items, Start Selling) |
| `motion`, `AnimatePresence` | Drives all open/close animations — FAB icon swap, card spring entry, FAQ accordion |
| `useAuth` | Reads `isAuthenticated` to decide the correct routing path for the agent chat CTA |

---

### FAQ Data (Static Array)

```jsx
const FAQS = [
  { question: 'How do I buy an item?',     answer: '...' },
  { question: 'How do I sell an item?',    answer: '...' },
  { question: 'What is the 10% fee?',      answer: '...' },
  { question: 'Why is my phone hidden?',   answer: '...' },
];
```

This is a static, hardcoded array at the module level (outside the component) so it is never re-instantiated on re-renders. Each entry has a `question` string and an `answer` string.

---

### State & Refs

```jsx
const { isAuthenticated } = useAuth();    // Read-only auth check
const [isOpen, setIsOpen] = useState(false);      // Is the popup open?
const [activeFaq, setActiveFaq] = useState(null); // Which FAQ index is expanded?
const widgetRef = useRef(null);                   // DOM ref for click-outside detection
const navigate = useNavigate();                   // Programmatic navigation
```

---

### Click-Outside Handler

```jsx
useEffect(() => {
  const handleClickOutside = (event) => {
    if (widgetRef.current && !widgetRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

**How it works:**
- On mount, a `mousedown` listener is registered on the entire `document`.
- On every click, it checks if the clicked element is **inside** `widgetRef.current` using `.contains(event.target)`.
- If the click is **outside** the widget, `setIsOpen(false)` collapses it.
- The cleanup function in the return removes the listener on unmount to prevent memory leaks.

---

### Agent Chat Handler

```jsx
const handleAgentChat = () => {
  setIsOpen(false);
  if (isAuthenticated) {
    navigate('/messages');
  } else {
    navigate('/login', { state: { from: '/messages' } });
  }
};
```

**How it works:**
- First closes the widget immediately so the card doesn't linger on screen during navigation.
- If the user is logged in → navigates directly to `/messages` (the class broker chat thread).
- If the user is a guest → navigates to `/login` and passes `{ state: { from: '/messages' } }` in the location state. This allows the login page to redirect back to `/messages` after successful authentication.

---

### FAQ Toggle Handler

```jsx
const toggleFaq = (index) => {
  setActiveFaq(activeFaq === index ? null : index);
};
```

- If the clicked FAQ is already open (`activeFaq === index`), closes it by setting state to `null`.
- Otherwise, opens the clicked FAQ by setting state to its `index`.
- This ensures **only one FAQ is open at a time** (accordion behaviour).

---

### JSX Structure

#### Root Container
```jsx
<div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
```
- `fixed` — Positions relative to the viewport, not the page.
- `bottom-6 right-6` — Locks to `24px` from the bottom-right edges.
- `z-50` — Sits on top of all page content (footer, modals, etc.).
- `ref={widgetRef}` — Binds the DOM reference for outside-click detection.

---

#### Floating Action Button (FAB)
```jsx
<motion.button
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setIsOpen(!isOpen)}
  className="w-14 h-14 rounded-full bg-primary-500 ..."
  id="support-fab"
  aria-label="Toggle support menu"
>
  <span className="absolute inset-0 rounded-full border border-primary-500 animate-ping opacity-25" />
  ...
</motion.button>
```

- `whileHover / whileTap` — GPU-accelerated micro-scale interactions with zero layout impact.
- `animate-ping` span — A pure-CSS pulsing ring effect that subtly breathes around the button, drawing attention without distraction.
- `aria-label` — Fully accessible for screen readers and keyboard navigation.

#### FAB Icon Swap Animation
```jsx
<AnimatePresence mode="wait">
  {isOpen ? (
    <motion.div key="close"
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      exit={{ rotate: 90, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <HiX />
    </motion.div>
  ) : (
    <motion.div key="support"
      initial={{ rotate: 90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      exit={{ rotate: -90, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <HiOutlineChat />
    </motion.div>
  )}
</AnimatePresence>
```

- `mode="wait"` — Waits for the exiting icon to fully disappear before showing the entering icon. This prevents both icons from being visible simultaneously.
- Opposite rotation directions (`+90°` vs `-90°`) create a satisfying spinning swap effect.

---

#### Popup Card Animation
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.9, y: 20 }}
  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
  className="absolute bottom-18 right-0 w-80 sm:w-96 glass-card ..."
>
```

- `initial` / `exit` — Card starts small and slightly below its resting position, giving a natural "pop up" feel.
- `type: 'spring'` — Physics-based spring animation instead of a linear ease, making the card feel tactile and alive.
- `damping: 25, stiffness: 350` — Tuned to feel snappy without bouncing excessively.
- `glass-card` — Uses the global glassmorphism style (backdrop blur, semi-transparent bg, cobalt border).

---

#### FAQ Accordion Animation
```jsx
<AnimatePresence initial={false}>
  {isFaqOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <p>{faq.answer}</p>
    </motion.div>
  )}
</AnimatePresence>
```

- `height: 0 → auto` — Animates the element from zero height to its natural content height, smoothly revealing the answer text without knowing its exact pixel size in advance.
- `initial={false}` on `AnimatePresence` — Prevents the initial mount state from running the entry animation (avoids all FAQs "flashing open" on first render).
- `overflow-hidden` — Required to clip the content during the height animation so text doesn't overflow before the box reaches full height.

---

## File 2 — `App.jsx` (MODIFIED)

**Path:** `client/src/App.jsx`

Only two lines were changed.

### Line Added — Import

```diff
  import PageTransition from './components/common/PageTransition';
+ import SupportWidget from './components/layout/SupportWidget';
```

### Line Added — Render in Root Layout

```diff
            </main>
            <Footer />
+           <SupportWidget />
```

**Why here?** Placing `<SupportWidget />` at the root layout level (outside `<main>` and directly inside the router `<div>`) ensures:
1. It renders on **every single route** without being re-mounted on navigation.
2. It sits above the footer in the DOM but uses `fixed` positioning, so it is visually independent of the document flow.
3. It shares the same React Router context (`useNavigate`, `useLocation`) since it is inside `<Router>`.

---

## How the Widget Behaves — User Flow

```
User visits any page
        │
        ▼
  FAB visible bottom-right (pulsing ring)
        │
  User clicks FAB
        │
        ▼
  Card springs open
        │
        ├── Click "Contact Class Agent"
        │         │
        │         ├── Logged in? → navigate('/messages')
        │         └── Guest?     → navigate('/login', { state: { from: '/messages' }})
        │
        ├── Click "Browse Items" → navigate('/search'), card closes
        │
        ├── Click "Start Selling" → navigate('/sell'), card closes
        │
        ├── Click any FAQ row → answer expands (accordion, only one at a time)
        │
        └── Click outside widget → card closes automatically
```

---

## Verification

```bash
> npm run build
vite v8.0.10 building client environment for production...
transforming...✓ 518 modules transformed.
✓ built in 1.29s   # Zero errors, zero warnings
```
