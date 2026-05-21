import express from 'express';
import {
  getProfile,
  updateProfile,
  getMyListings,
  toggleWishlist,
  getWishlist
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.get('/my-listings', getMyListings);

router.route('/wishlist')
  .get(getWishlist);

router.post('/wishlist/:id', toggleWishlist);

export default router;
