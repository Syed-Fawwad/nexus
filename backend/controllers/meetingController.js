import Meeting from '../models/Meeting.js';

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
  const { guestId, title, description, startTime, endTime, meetingLink } = req.body;

  if (!guestId || !title || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Meeting Conflict Detection
  // Check if host has overlapping meetings
  const hostConflict = await Meeting.findOne({
    $or: [{ host: req.user._id }, { guest: req.user._id }],
    status: { $in: ['pending', 'accepted'] },
    $or: [
      // New meeting starts during existing meeting
      {
        startTime: { $lte: new Date(startTime) },
        endTime: { $gt: new Date(startTime) },
      },
      // New meeting ends during existing meeting
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gte: new Date(endTime) },
      },
      // New meeting completely contains existing meeting
      {
        startTime: { $gte: new Date(startTime) },
        endTime: { $lte: new Date(endTime) },
      },
    ],
  });

  if (hostConflict) {
    res.status(409);
    throw new Error('You already have a meeting scheduled during this time');
  }

  // Check if guest has overlapping meetings
  const guestConflict = await Meeting.findOne({
    $or: [{ host: guestId }, { guest: guestId }],
    status: { $in: ['pending', 'accepted'] },
    $or: [
      {
        startTime: { $lte: new Date(startTime) },
        endTime: { $gt: new Date(startTime) },
      },
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gte: new Date(endTime) },
      },
      {
        startTime: { $gte: new Date(startTime) },
        endTime: { $lte: new Date(endTime) },
      },
    ],
  });

  if (guestConflict) {
    res.status(409);
    throw new Error('The guest already has a meeting scheduled during this time');
  }

  const meeting = await Meeting.create({
    host: req.user._id,
    guest: guestId,
    title,
    description,
    startTime,
    endTime,
    meetingLink,
  });

  if (meeting) {
    res.status(201).json(meeting);
  } else {
    res.status(400);
    throw new Error('Invalid meeting data');
  }
};

// @desc    Get all meetings for the logged-in user
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
  // Find meetings where the user is either the host or the guest
  const meetings = await Meeting.find({
    $or: [{ host: req.user._id }, { guest: req.user._id }],
  })
    .populate('host', 'name email role avatarUrl')
    .populate('guest', 'name email role avatarUrl')
    .sort({ startTime: 1 });

  res.json(meetings);
};

// @desc    Get a single meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
const getMeetingById = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('host', 'name email role avatarUrl')
    .populate('guest', 'name email role avatarUrl');

  if (meeting) {
    // Check if the logged-in user is part of the meeting
    if (
      meeting.host._id.toString() !== req.user._id.toString() &&
      meeting.guest._id.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to view this meeting');
    }
    res.json(meeting);
  } else {
    res.status(404);
    throw new Error('Meeting not found');
  }
};

// @desc    Update a meeting (status, details)
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (meeting) {
    // Check authorization
    if (
      meeting.host.toString() !== req.user._id.toString() &&
      meeting.guest.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this meeting');
    }

    // If updating time, check for conflicts
    if (req.body.startTime || req.body.endTime) {
      const newStartTime = req.body.startTime ? new Date(req.body.startTime) : meeting.startTime;
      const newEndTime = req.body.endTime ? new Date(req.body.endTime) : meeting.endTime;

      // Check for conflicts with other meetings (exclude current meeting)
      const conflict = await Meeting.findOne({
        _id: { $ne: meeting._id }, // Exclude current meeting
        $or: [{ host: req.user._id }, { guest: req.user._id }],
        status: { $in: ['pending', 'accepted'] },
        $or: [
          {
            startTime: { $lte: newStartTime },
            endTime: { $gt: newStartTime },
          },
          {
            startTime: { $lt: newEndTime },
            endTime: { $gte: newEndTime },
          },
          {
            startTime: { $gte: newStartTime },
            endTime: { $lte: newEndTime },
          },
        ],
      });

      if (conflict) {
        res.status(409);
        throw new Error('Meeting time conflicts with another scheduled meeting');
      }
    }

    meeting.title = req.body.title || meeting.title;
    meeting.description = req.body.description || meeting.description;
    meeting.startTime = req.body.startTime || meeting.startTime;
    meeting.endTime = req.body.endTime || meeting.endTime;
    meeting.status = req.body.status || meeting.status;
    meeting.meetingLink = req.body.meetingLink || meeting.meetingLink;

    const updatedMeeting = await meeting.save();
    res.json(updatedMeeting);
  } else {
    res.status(404);
    throw new Error('Meeting not found');
  }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (meeting) {
    // Check authorization
    if (
      meeting.host.toString() !== req.user._id.toString() &&
      meeting.guest.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to delete this meeting');
    }

    await meeting.deleteOne();
    res.json({ message: 'Meeting removed' });
  } else {
    res.status(404);
    throw new Error('Meeting not found');
  }
};

export {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};
