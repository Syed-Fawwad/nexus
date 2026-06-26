import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Message from '../models/Message.js';

/**
 * @desc    Get entrepreneur dashboard statistics
 * @route   GET /api/dashboard/entrepreneur
 * @access  Private (Entrepreneur only)
 */
export const getEntrepreneurStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count meetings where user is host or guest
    const totalMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
    });

    // Count upcoming meetings (accepted, in the future)
    const upcomingMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      status: 'accepted',
      startTime: { $gt: new Date() },
    });

    // Count pending meetings where user is the guest (received invitations)
    const pendingInvitations = await Meeting.countDocuments({
      guest: userId,
      status: 'pending',
    });

    // Count accepted connections (meetings that were accepted)
    const totalConnections = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      status: 'accepted',
    });

    // Count unread messages
    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    // Count total investors
    const totalInvestors = await User.countDocuments({ role: 'investor' });

    // Get recent activity count (messages + meetings in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentMessages = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      totalMeetings,
      upcomingMeetings,
      pendingInvitations,
      totalConnections,
      unreadMessages,
      totalInvestors,
      recentActivity: recentMeetings + recentMessages,
      profileViews: 0, // Not tracked yet - can be implemented later
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching entrepreneur stats:', error);
    res.status(500);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

/**
 * @desc    Get investor dashboard statistics
 * @route   GET /api/dashboard/investor
 * @access  Private (Investor only)
 */
export const getInvestorStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count meetings where user is host or guest
    const totalMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
    });

    // Count upcoming meetings (accepted, in the future)
    const upcomingMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      status: 'accepted',
      startTime: { $gt: new Date() },
    });

    // Count pending meetings where user is the guest (received invitations)
    const pendingInvitations = await Meeting.countDocuments({
      guest: userId,
      status: 'pending',
    });

    // Count total connections (accepted meetings)
    const totalConnections = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      status: 'accepted',
    });

    // Count unread messages
    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    // Count total entrepreneurs
    const totalEntrepreneurs = await User.countDocuments({ role: 'entrepreneur' });

    // Get recent activity count (messages + meetings in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { guest: userId }],
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentMessages = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      totalMeetings,
      upcomingMeetings,
      pendingInvitations,
      totalConnections,
      unreadMessages,
      totalEntrepreneurs,
      recentActivity: recentMeetings + recentMessages,
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching investor stats:', error);
    res.status(500);
    throw new Error('Failed to fetch dashboard statistics');
  }
};
