import Event from '../models/Event.js';

// @desc    Get all verified events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { category, month, year } = req.query;
    const query = { isVerified: true };

    if (category) {
      query.category = category;
    }

    if (month && year) {
      // Filter events by month & year
      // Find events that overlap with the specified month
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      query.$or = [
        {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        },
        {
          endDate: { $gte: startOfMonth, $lte: endOfMonth }
        },
        {
          date: { $lte: startOfMonth },
          endDate: { $gte: endOfMonth }
        }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name avatar role')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, startTime, endTime, location, organizer, category } = req.body;

    // Check if user is agent or admin
    const userRole = req.user.role;
    const isVerified = userRole === 'agent' || userRole === 'admin';

    const event = new Event({
      title,
      description,
      date: new Date(date),
      endDate: new Date(endDate || date),
      startTime,
      endTime,
      location,
      organizer,
      category,
      createdBy: req.user._id,
      isVerified
    });

    const createdEvent = await event.save();
    res.status(201).json({
      success: true,
      message: isVerified ? 'Event created and verified successfully!' : 'Event submitted for review. It will appear on the calendar once verified.',
      event: createdEvent
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership or admin/agent status
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isAuthorized = isOwner || req.user.role === 'admin' || req.user.role === 'agent';

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this event' });
    }

    // Update fields
    const updates = { ...req.body };
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership or admin/agent status
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isAuthorized = isOwner || req.user.role === 'admin' || req.user.role === 'agent';

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all pending (unverified) events
// @route   GET /api/events/pending
// @access  Private (Agent/Admin only)
export const getPendingEvents = async (req, res) => {
  try {
    // Only agents and admins
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const events = await Event.find({ isVerified: false })
      .populate('createdBy', 'name avatar department role')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Error in getPendingEvents:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify a pending event
// @route   PUT /api/events/:id/verify
// @access  Private (Agent/Admin only)
export const verifyEvent = async (req, res) => {
  try {
    // Only agents and admins
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.isVerified = true;
    await event.save();

    res.json({ success: true, message: 'Event successfully verified and active on the calendar!', event });
  } catch (error) {
    console.error('Error in verifyEvent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
