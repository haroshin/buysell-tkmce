import Message from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Transaction from '../models/Transaction.js';

// Phone number masking regex (handles 10-digit numbers with optional spaces/dashes)
const maskPhoneNumbers = (text) => {
  return text.replace(/\b\d[\d\s\-]{8,}\d\b/g, '[PHONE HIDDEN]');
};

// @desc    Send a message (with broker routing for standard users)
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    let { receiverId, listingId, content } = req.body;

    if (!receiverId || !listingId || !content?.trim()) {
      return res.status(400).json({ message: 'Receiver, listing, and content are required' });
    }

    // Prevent sending message to yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // --- BROKER ROUTING LOGIC ---
    // Standard users cannot message sellers directly; route to buyer's class agent
    if (req.user.role === 'user') {
      // Find the buyer's class agent by department + passoutYear + section
      let classAgent = await User.findOne({
        role: 'agent',
        department: req.user.department,
        passoutYear: req.user.passoutYear,
        section: req.user.section
      });

      // Fallback to any admin if no agent found for this class
      if (!classAgent) {
        classAgent = await User.findOne({ role: 'admin' });
      }

      if (!classAgent) {
        return res.status(404).json({ message: 'No agent or admin available to handle your request' });
      }

      // Override receiverId to the class agent
      receiverId = classAgent._id.toString();

      // Create a Transaction record for this brokered request
      const existingTransaction = await Transaction.findOne({
        listing: listingId,
        buyer: req.user._id,
        status: { $in: ['Requested', 'In Progress'] }
      });

      if (!existingTransaction) {
        await Transaction.create({
          listing: listingId,
          buyer: req.user._id,
          seller: listing.seller,
          brokerAgent: classAgent._id,
          platformFee: Math.round(listing.price * 0.1 * 100) / 100,
          status: 'Requested'
        });
      }
    }
    // Agents and admins can message anyone directly (no override)

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Mask phone numbers in the message content
    const sanitizedContent = maskPhoneNumbers(content.trim());

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      listing: listingId,
      content: sanitizedContent
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('listing', 'title images price');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all conversations (grouped by user + listing)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('listing', 'title images price isSold');

    // Group by conversation (unique combination of other user + listing)
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId.toString()
        ? msg.receiver
        : msg.sender;

      // Key is combination of other user ID and listing ID
      const key = `${otherUser._id}-${msg.listing._id}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          _id: key,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar
          },
          listing: {
            _id: msg.listing._id,
            title: msg.listing.title,
            images: msg.listing.images,
            price: msg.listing.price,
            isSold: msg.listing.isSold
          },
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.sender._id
          },
          unreadCount: 0
        });
      }

      // Count unread messages sent by the OTHER user (not by me)
      if (!msg.isRead && msg.receiver._id.toString() === userId.toString()) {
        const conv = conversationMap.get(key);
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get messages with a specific user about a specific listing
// @route   GET /api/messages/:userId/:listingId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    let { userId, listingId } = req.params;
    const currentUserId = req.user._id;

    // --- BROKER ROUTING OVERRIDE ---
    // If standard user, they can only view messages with their class agent/admin
    if (req.user.role === 'user') {
      let classAgent = await User.findOne({
        role: 'agent',
        department: req.user.department,
        passoutYear: req.user.passoutYear,
        section: req.user.section
      });

      if (!classAgent) {
        classAgent = await User.findOne({ role: 'admin' });
      }

      if (classAgent) {
        userId = classAgent._id.toString();
      }
    }

    const messages = await Message.find({
      listing: listingId,
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark messages as read (messages sent TO the current user)
    await Message.updateMany(
      {
        listing: listingId,
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true }
    );

    // Get other user and listing info
    const otherUser = await User.findById(userId).select('name avatar department');
    const listing = await Listing.findById(listingId).select('title images price isSold seller');

    res.json({
      messages,
      otherUser,
      listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get total unread message count
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
