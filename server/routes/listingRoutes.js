import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  markAsSold
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';
import { checkPendingFees } from '../middleware/enforcement.js';

const router = express.Router();

router.route('/')
  .get(getListings)
  .post(protect, checkPendingFees, createListing);

router.route('/:id')
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

router.route('/:id/sold')
  .put(protect, markAsSold);

export default router;
