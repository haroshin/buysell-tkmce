# Phase 3 — Core Listings Functionality

## Overview
Phase 3 established the primary marketplace features: creating items for sale, browsing the homepage, and filtering listings by category.

## Backend Changes

### `server/models/Listing.js`
- Created the core Listing schema containing `title`, `description`, `price`, `category`, `condition`, `images`, `location`, `seller` (User reference), `views`, and status flags (`isSold`, `isActive`).
- Implemented category and condition constraints matching the college environment (e.g., "Textbooks & Notes", "Hostel Essentials").

### `server/controllers/listingController.js`
- **`createListing`**: Accepts listing data and ties the new item to the authenticated user's ID (`req.user._id`).
- **`getListings`**: Highly flexible GET endpoint supporting pagination, keyword search, category filtering, and sorting (Price Low/High, Newest/Oldest).
- **`getListingById`**: Returns a single listing and increments its `views` counter.

## Frontend Changes

### `client/src/pages/Home.jsx`
- The landing page of the marketplace.
- Displays a dynamic hero section with search capabilities.
- Renders a "Recent Listings" section fetching the latest active items from the API.
- Implements a horizontal scrolling "Categories" section for quick navigation.

### `client/src/pages/CreateListing.jsx`
- Protected form where users can post items for sale.
- Includes complex state management for handling image URLs, price constraints, and category dropdowns.
- Features a rich, animated UI.

### `client/src/pages/CategoryPage.jsx`
- Displays items filtered by a specific category selected from the homepage.
- Reuses the `ListingCard` component for consistency.

### `client/src/components/features/ListingCard.jsx`
- The primary reusable UI component for displaying a single listing.
- Shows thumbnail, price, title, location, views, and timestamp.
- Handles default image fallbacks and hover scaling animations.
