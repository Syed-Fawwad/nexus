import User from '../models/User.js';
import EntrepreneurProfile from '../models/EntrepreneurProfile.js';
import InvestorProfile from '../models/InvestorProfile.js';

// @desc    Get all users with optional filters
// @route   GET /api/users?role=investor&industry=tech&location=NYC
// @access  Private
const getAllUsers = async (req, res) => {
  const { role, industry, location } = req.query;

  // Build query - exclude current user
  const query = { _id: { $ne: req.user._id } };

  if (role) {
    query.role = role;
  }

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });

  // Populate role-specific profiles
  const usersWithProfiles = await Promise.all(
    users.map(async (user) => {
      let profileData = {};
      let shouldInclude = true;

      if (user.role === 'entrepreneur') {
        const entProfile = await EntrepreneurProfile.findOne({ user: user._id });
        if (entProfile) {
          // Apply industry filter
          if (industry && entProfile.industry.toLowerCase() !== industry.toLowerCase()) {
            shouldInclude = false;
          }
          // Apply location filter
          if (location && entProfile.location.toLowerCase() !== location.toLowerCase()) {
            shouldInclude = false;
          }

          if (shouldInclude) {
            const profile = entProfile.toObject();
            delete profile._id;
            delete profile.user;
            delete profile.__v;
            profileData = profile;
          }
        }
      } else if (user.role === 'investor') {
        const invProfile = await InvestorProfile.findOne({ user: user._id });
        if (invProfile) {
          const profile = invProfile.toObject();
          delete profile._id;
          delete profile.user;
          delete profile.__v;
          profileData = profile;
        }
      }

      if (!shouldInclude) return null;

      return {
        id: user._id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
        ...profileData,
      };
    })
  );

  // Filter out null entries from filtering
  const filteredUsers = usersWithProfiles.filter((u) => u !== null);

  res.json(filteredUsers);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let profileData = {};

  if (user.role === 'entrepreneur') {
    const entProfile = await EntrepreneurProfile.findOne({ user: user._id });
    if (entProfile) {
      const profile = entProfile.toObject();
      delete profile._id;
      delete profile.user;
      delete profile.__v;
      profileData = profile;
    }
  } else if (user.role === 'investor') {
    const invProfile = await InvestorProfile.findOne({ user: user._id });
    if (invProfile) {
      const profile = invProfile.toObject();
      delete profile._id;
      delete profile.user;
      delete profile.__v;
      profileData = profile;
    }
  }

  res.json({
    id: user._id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isOnline: user.isOnline,
    createdAt: user.createdAt,
    ...profileData,
  });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Update profile-specific data if provided
    if (user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: user._id });
      if (profile) {
        profile.startupName = req.body.startupName || profile.startupName;
        profile.industry = req.body.industry || profile.industry;
        profile.fundingNeeded = req.body.fundingNeeded || profile.fundingNeeded;
        profile.location = req.body.location || profile.location;
        profile.pitchSummary = req.body.pitchSummary || profile.pitchSummary;
        profile.foundedYear = req.body.foundedYear || profile.foundedYear;
        profile.teamSize = req.body.teamSize || profile.teamSize;
        await profile.save();
      }
    } else if (user.role === 'investor') {
      const profile = await InvestorProfile.findOne({ user: user._id });
      if (profile) {
        profile.investmentInterests = req.body.investmentInterests || profile.investmentInterests;
        profile.investmentStage = req.body.investmentStage || profile.investmentStage;
        profile.portfolioCompanies = req.body.portfolioCompanies || profile.portfolioCompanies;
        profile.totalInvestments = req.body.totalInvestments || profile.totalInvestments;
        profile.minimumInvestment = req.body.minimumInvestment || profile.minimumInvestment;
        profile.maximumInvestment = req.body.maximumInvestment || profile.maximumInvestment;
        await profile.save();
      }
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

export { updateUserProfile, getAllUsers, getUserById };
