import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const CATEGORY_LABELS = {
  account: 'Account Issue',
  listing: 'Listing Problem',
  payment: 'Payment & Fees',
  agent: 'Agent Issue',
  other: 'Other',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, description } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({ message: 'Please provide subject, category, and description' });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      subject: subject.trim(),
      category,
      priority: priority || 'medium',
      description: description.trim(),
    });

    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name email');

    // Notify admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `[New Ticket #${ticket._id.toString().slice(-6).toUpperCase()}] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">Buy&Sell TKMCE</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Support Ticket System</p>
            </div>
            <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
              <h2 style="color: #f1f5f9; font-size: 18px; margin: 0 0 16px;">New Support Ticket Raised</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px; width: 120px;">Ticket ID</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 13px; font-weight: 600;">#${ticket._id.toString().slice(-6).toUpperCase()}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Student</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 13px;">${populatedTicket.user.name} (${populatedTicket.user.email})</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Subject</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 13px; font-weight: 600;">${subject}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Category</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 13px;">${CATEGORY_LABELS[category] || category}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Priority</td><td style="padding: 8px 0; color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'}; font-size: 13px; font-weight: 600;">${PRIORITY_LABELS[priority] || 'Medium'}</td></tr>
              </table>
              <div style="margin-top: 16px; padding: 16px; background: #0f172a; border-radius: 8px; border: 1px solid #334155;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Description</p>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0; line-height: 1.6;">${description}</p>
              </div>
            </div>
            <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">Log in to the Admin Dashboard to respond to this ticket.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr.message);
    }

    // Confirmation to user
    try {
      await sendEmail({
        to: populatedTicket.user.email,
        subject: `Your ticket has been received — #${ticket._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">Buy&Sell TKMCE</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Campus Marketplace</p>
            </div>
            <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
              <h2 style="color: #f1f5f9; font-size: 18px; margin: 0 0 8px;">Hi ${populatedTicket.user.name}, we've received your ticket!</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px;">Our team will review your request and get back to you as soon as possible.</p>
              <div style="background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">TICKET ID</p>
                <p style="color: #8b5cf6; font-size: 20px; font-weight: 700; margin: 0;">#${ticket._id.toString().slice(-6).toUpperCase()}</p>
              </div>
              <div style="margin-top: 16px;">
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 4px;"><strong style="color: #f1f5f9;">Subject:</strong> ${subject}</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0;"><strong style="color: #f1f5f9;">Category:</strong> ${CATEGORY_LABELS[category] || category}</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0;"><strong style="color: #f1f5f9;">Priority:</strong> ${PRIORITY_LABELS[priority] || 'Medium'}</p>
              </div>
            </div>
            <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">You can track your ticket status in your Profile page on Buy&Sell TKMCE.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('User confirmation email failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Ticket submitted successfully!', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged-in user's tickets
// @route   GET /api/tickets/mine
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/tickets
// @access  Private/Admin
export const getAllTickets = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 10;
    const status = req.query.status;

    const query = status && status !== 'all' ? { status } : {};

    const count = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('user', 'name email avatar department')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ tickets, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin replies to a ticket and updates status
// @route   PUT /api/tickets/:id/reply
// @access  Private/Admin
export const replyToTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (adminReply !== undefined) {
      ticket.adminReply = adminReply.trim();
      ticket.adminRepliedAt = new Date();
    }

    const updatedTicket = await ticket.save();

    // Notify user of update
    if (adminReply && ticket.user?.email) {
      try {
        await sendEmail({
          to: ticket.user.email,
          subject: `Update on your ticket #${ticket._id.toString().slice(-6).toUpperCase()} — ${STATUS_LABELS[status] || 'Updated'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">Buy&Sell TKMCE</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Support Team</p>
              </div>
              <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
                <h2 style="color: #f1f5f9; font-size: 18px; margin: 0 0 8px;">Hi ${ticket.user.name}, your ticket has been updated!</h2>
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px;">Ticket <strong style="color: #8b5cf6;">#${ticket._id.toString().slice(-6).toUpperCase()}</strong> · <strong>${ticket.subject}</strong></p>
                <div style="margin-bottom: 16px;">
                  <span style="background: ${status === 'resolved' ? '#065f46' : status === 'in_progress' ? '#78350f' : '#1e3a5f'}; color: ${status === 'resolved' ? '#10b981' : status === 'in_progress' ? '#f59e0b' : '#60a5fa'}; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600;">
                    ${STATUS_LABELS[status] || status}
                  </span>
                </div>
                <div style="padding: 16px; background: #0f172a; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Admin Reply</p>
                  <p style="color: #e2e8f0; font-size: 14px; margin: 0; line-height: 1.6;">${adminReply}</p>
                </div>
              </div>
              <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">Check your Profile page to view your full ticket history.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('User reply notification email failed:', emailErr.message);
      }
    }

    res.json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
