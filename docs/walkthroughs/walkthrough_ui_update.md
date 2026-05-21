# UI Update — Main Theme Color Revision (#2881ff)

## Overview
This document explains the code changes made to switch the platform's primary brand color from Purple (`#6C63FF`) to a vibrant Sky Blue (`#2881ff`).

Because the Buy&Sell TKMCE application utilizes Tailwind CSS alongside CSS variables and custom classes, the entire theme update was accomplished gracefully by updating a single configuration file.

---

## File 1: [MODIFIED] tailwind.config.js

📁 `client/tailwind.config.js` — The centralized design system file.

### 🔹 1. Updating the Primary Palette

```diff
       colors: {
         primary: {
-          50: '#eef2ff',
-          100: '#e0e7ff',
-          200: '#c7d2fe',
-          300: '#a5b4fc',
-          400: '#818cf8',
-          500: '#6C63FF',
-          600: '#5a52d9',
-          700: '#4338ca',
-          800: '#3730a3',
-          900: '#312e81',
-          950: '#1e1b4b',
+          50: '#eff6ff',
+          100: '#dbeafe',
+          200: '#bfdbfe',
+          300: '#93c5fd',
+          400: '#60a5fa',
+          500: '#2881ff',
+          600: '#2563eb',
+          700: '#1d4ed8',
+          800: '#1e40af',
+          900: '#1e3a8a',
+          950: '#172554',
         },
```
**Explanation**:
- We completely replaced the custom `primary` object.
- The `500` weight is Tailwind's default primary color (used by `.bg-primary-500`, `.text-primary-500`, etc.). We set this to the requested `#2881ff`.
- The surrounding weights (50-400 and 600-950) were recalculated to generate a perfect monochrome gradient. Lighter shades (`50-400`) are used for hover states on dark backgrounds or subtle highlights, while darker shades (`600-950`) are used for active states on buttons.
- Because `index.css` maps directly to these Tailwind utility classes (e.g., `.btn-primary` uses `@apply bg-primary-500 hover:bg-primary-600`), replacing the color palette *here* automatically trickles down and changes the color of every primary button, text highlight, active tab, and border across the entire React application instantly.

### 🔹 2. Updating Hardcoded Effects

```diff
       backgroundImage: {
         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
-        'hero-gradient': 'linear-gradient(135deg, #6C63FF 0%, #00D9A6 100%)',
+        'hero-gradient': 'linear-gradient(135deg, #2881ff 0%, #00D9A6 100%)',
       },
```
**Explanation**:
- The `hero-gradient` class defines the beautiful background gradient shown on the Homepage.
- We swapped the starting hex code of the gradient from the old purple (`#6C63FF`) to the new blue (`#2881ff`). It still transitions perfectly into the teal Accent color (`#00D9A6`).

```diff
       boxShadow: {
-        'glass': '0 8px 32px 0 rgba(108, 99, 255, 0.15)',
-        'glass-lg': '0 16px 48px 0 rgba(108, 99, 255, 0.2)',
-        'glow': '0 0 20px rgba(108, 99, 255, 0.3)',
+        'glass': '0 8px 32px 0 rgba(40, 129, 255, 0.15)',
+        'glass-lg': '0 16px 48px 0 rgba(40, 129, 255, 0.2)',
+        'glow': '0 0 20px rgba(40, 129, 255, 0.3)',
         'glow-accent': '0 0 20px rgba(0, 217, 166, 0.3)',
       },
```
**Explanation**:
- The custom `boxShadow` effects (`glass` and `glow`) rely on hardcoded `rgba()` values to dictate both color and opacity.
- The previous purple (`#6C63FF`) translated to an RGB value of `108, 99, 255`.
- The new blue (`#2881ff`) translates to an RGB value of `40, 129, 255`. 
- We replaced the RGB values in the shadow configurations. Now, whenever a user hovers over a `ListingCard` or a primary button, the glowing drop-shadow perfectly matches the new `#2881ff` brand color instead of glowing purple.
