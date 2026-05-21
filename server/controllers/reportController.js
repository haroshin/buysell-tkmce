import Report from '../models/Report.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Submit a report
// @route   POST /api/reports
// @access  Private
export const submitReport = async (req, res) => {
  try {
    const { reportedListingId, reportedUserId, reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a reason for the report' });
    }

    if (!reportedListingId && !reportedUserId) {
      return res.status(400).json({ message: 'Please specify a listing or user to report' });
    }

    // Verify reported entity exists
    if (reportedListingId) {
      const listing = await Listing.findById(reportedListingId);
      if (!listing) return res.status(404).json({ message: 'Listing not found' });
      
      // Prevent reporting your own listing
      if (listing.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report your own listing' });
      }
    }

    if (reportedUserId) {
      const user = await User.findById(reportedUserId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      if (reportedUserId === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report yourself' });
      }
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedListing: reportedListingId || undefined,
      reportedUser: reportedUserId || undefined,
      reason: reason.trim()
    });

    res.status(201).json({ message: 'Report submitted successfully. Thank you.', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reports (admin view)
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 10;
    const status = req.query.status || 'pending';
    
    const query = status === 'all' ? {} : { status };
    
    const count = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email isBanned')
      .populate('reportedListing', 'title isSold isActive')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ reports, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const report = await Report.findById(req.params.id);

    if (report) {
      report.status = status || report.status;
      if (adminNotes !== undefined) {
        report.adminNotes = adminNotes;
      }
      
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
