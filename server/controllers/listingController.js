import Listing from '../models/Listing.js';
import User from '../models/User.js';

// @desc    Get all listings (with filtering & pagination)
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const { keyword, category, condition, sort, page, limit } = req.query;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = { 
      isActive: true,
      $and: [
        {
          $or: [
            { isSold: false },
            { isSold: true, soldAt: { $gte: sevenDaysAgo } }
          ]
        }
      ]
    };

    if (keyword) {
      query.$and.push({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      });
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(query)
      .populate('seller', 'name avatar department')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name avatar department phone email');
    
    if (listing) {
      // Increment views
      listing.views += 1;
      await listing.save();
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, isNegotiable, images } = req.body;

    const listing = new Listing({
      title,
      description,
      price,
      category,
      condition,
      location,
      isNegotiable,
      images: images || [],
      seller: req.user._id
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this listing' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the seller or admin
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle listing sold status
// @route   PUT /api/listings/:id/sold
// @access  Private
export const markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Toggle sold status
    listing.isSold = !listing.isSold;
    if (listing.isSold) {
      listing.soldAt = new Date();
    } else {
      listing.soldAt = undefined;
    }
    // Keep listing active so it can persist in the UI for 7 days as Sold
    listing.isActive = true;
    await listing.save();

    res.json({ 
      message: listing.isSold ? 'Listing marked as sold' : 'Listing marked as available',
      isSold: listing.isSold,
      isActive: listing.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get public stats for homepage
// @route   GET /api/listings/public/stats
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    const activeListings = await Listing.countDocuments({ isActive: true, isSold: false });
    const totalStudents = await User.countDocuments();
    
    // Calculate total saved as the sum of prices of all sold listings
    const soldListings = await Listing.find({ isSold: true }, 'price');
    const totalSaved = soldListings.reduce((sum, listing) => sum + listing.price, 0);

    res.json({
      activeListings,
      totalStudents,
      totalSaved
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
