import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Get user profile (full details)
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'listings',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count active and sold listings
    const totalListings = await Listing.countDocuments({ seller: req.user._id });
    const activeListing = await Listing.countDocuments({ seller: req.user._id, isActive: true, isSold: false });
    const soldListings = await Listing.countDocuments({ seller: req.user._id, isSold: true });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        passoutYear: user.passoutYear,
        section: user.section,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      stats: {
        totalListings,
        activeListing,
        soldListings,
        wishlistCount: user.wishlist?.length || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, passoutYear, section, avatar, currentPassword, newPassword } = req.body;

    const user = (currentPassword && newPassword)
      ? await User.findById(req.user._id).select('+password')
      : await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle Password Change
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (passoutYear !== undefined) user.passoutYear = passoutYear;
    if (section !== undefined) user.section = section;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        department: updatedUser.department,
        passoutYear: updatedUser.passoutYear,
        section: updatedUser.section,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current user's listings
// @route   GET /api/users/my-listings
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { seller: req.user._id };

    if (status === 'active') {
      query.isActive = true;
      query.isSold = false;
    } else if (status === 'sold') {
      query.isSold = true;
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .populate('seller', 'name avatar department');

    res.json({ listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle wishlist (add/remove)
// @route   POST /api/users/wishlist/:id
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const index = user.wishlist.indexOf(listingId);

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from wishlist', wishlisted: false, wishlist: user.wishlist });
    } else {
      // Add to wishlist
      user.wishlist.push(listingId);
      await user.save();
      res.json({ message: 'Added to wishlist', wishlisted: true, wishlist: user.wishlist });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get wishlist items
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: {
        path: 'seller',
        select: 'name avatar department'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out null listings (deleted ones)
    const wishlist = user.wishlist.filter(item => item !== null);

    res.json({ listings: wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
