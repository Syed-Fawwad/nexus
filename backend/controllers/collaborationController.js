import CollaborationRequest from '../models/CollaborationRequest.js';
import User from '../models/User.js';

/**
 * @desc    Get collaboration requests for current user
 * @route   GET /api/collaborations
 * @access  Private
 */
export const getCollaborationRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    // Entrepreneurs see requests sent to them
    if (userRole === 'entrepreneur') {
      query.entrepreneur = userId;
    }
    // Investors see requests they sent
    else if (userRole === 'investor') {
      query.investor = userId;
    }

    const requests = await CollaborationRequest.find(query)
      .populate('investor', 'name email avatarUrl bio isOnline')
      .populate('entrepreneur', 'name email avatarUrl bio startupName isOnline')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('[Collaboration] Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch collaboration requests' });
  }
};

/**
 * @desc    Create a collaboration request
 * @route   POST /api/collaborations
 * @access  Private (Investor only)
 */
export const createCollaborationRequest = async (req, res) => {
  try {
    const { entrepreneurId, message } = req.body;
    const investorId = req.user._id;

    // Validate input
    if (!entrepreneurId || !message) {
      return res.status(400).json({ message: 'Entrepreneur ID and message are required' });
    }

    // Verify entrepreneur exists and has correct role
    const entrepreneur = await User.findById(entrepreneurId);
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }
    if (entrepreneur.role !== 'entrepreneur') {
      return res.status(400).json({ message: 'User is not an entrepreneur' });
    }

    // Check for duplicate pending request
    const existingRequest = await CollaborationRequest.findOne({
      investor: investorId,
      entrepreneur: entrepreneurId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this entrepreneur' });
    }

    // Create the request
    const collaborationRequest = await CollaborationRequest.create({
      investor: investorId,
      entrepreneur: entrepreneurId,
      message,
      status: 'pending',
    });

    // Populate before returning
    await collaborationRequest.populate('investor', 'name email avatarUrl bio');
    await collaborationRequest.populate('entrepreneur', 'name email avatarUrl bio startupName');

    res.status(201).json(collaborationRequest);
  } catch (error) {
    console.error('[Collaboration] Error creating request:', error);
    res.status(500).json({ message: 'Failed to create collaboration request' });
  }
};

/**
 * @desc    Update collaboration request status
 * @route   PUT /api/collaborations/:id
 * @access  Private (Entrepreneur only - can only update their own requests)
 */
export const updateCollaborationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either accepted or rejected' });
    }

    // Find the request
    const request = await CollaborationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Verify the user is the entrepreneur who received the request
    if (request.entrepreneur.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Can only update pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending requests' });
    }

    // Update status
    request.status = status;
    await request.save();

    // Populate before returning
    await request.populate('investor', 'name email avatarUrl bio');
    await request.populate('entrepreneur', 'name email avatarUrl bio startupName');

    res.json(request);
  } catch (error) {
    console.error('[Collaboration] Error updating request:', error);
    res.status(500).json({ message: 'Failed to update collaboration request' });
  }
};

/**
 * @desc    Delete/cancel collaboration request
 * @route   DELETE /api/collaborations/:id
 * @access  Private (Only the investor who created it)
 */
export const deleteCollaborationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await CollaborationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Only the investor who created it can delete
    if (request.investor.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await CollaborationRequest.findByIdAndDelete(id);

    res.json({ message: 'Collaboration request deleted successfully' });
  } catch (error) {
    console.error('[Collaboration] Error deleting request:', error);
    res.status(500).json({ message: 'Failed to delete collaboration request' });
  }
};

/**
 * @desc    Get collaboration request by ID
 * @route   GET /api/collaborations/:id
 * @access  Private
 */
export const getCollaborationRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await CollaborationRequest.findById(id)
      .populate('investor', 'name email avatarUrl bio')
      .populate('entrepreneur', 'name email avatarUrl bio startupName');

    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Verify user is either the investor or entrepreneur
    if (
      request.investor._id.toString() !== userId.toString() &&
      request.entrepreneur._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    console.error('[Collaboration] Error fetching request:', error);
    res.status(500).json({ message: 'Failed to fetch collaboration request' });
  }
};
