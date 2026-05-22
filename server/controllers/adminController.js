import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';
import Ticket from '../models/Ticket.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ isActive: true });
    const soldListings = await Listing.countDocuments({ isSold: true });
    const activeReports = await Report.countDocuments({ status: 'pending' });
    const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    res.json({
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      activeReports,
      openTickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 10;
    
    const count = await User.countDocuments({});
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot ban another admin' });
      }
      
      user.isBanned = !user.isBanned;
      await user.save();
      
      res.json({ 
        message: user.isBanned ? 'User has been banned' : 'User has been unbanned',
        user: { _id: user._id, name: user.name, isBanned: user.isBanned }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all listings (admin view)
// @route   GET /api/admin/listings
// @access  Private/Admin
export const getAllListings = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 10;
    
    const count = await Listing.countDocuments({});
    const listings = await Listing.find({})
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ listings, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete any listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Remove from seller's listings array
      await User.findByIdAndUpdate(listing.seller, {
        $pull: { listings: listing._id }
      });

      // Remove from any wishlists
      await User.updateMany(
        { wishlist: listing._id },
        { $pull: { wishlist: listing._id } }
      );

      await listing.deleteOne();
      res.json({ message: 'Listing removed by admin' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
