import User from '../models/User.js';
import EntrepreneurProfile from '../models/EntrepreneurProfile.js';
import InvestorProfile from '../models/InvestorProfile.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    let profileData = {};
    if (user.role === 'entrepreneur') {
      profileData = await EntrepreneurProfile.findOne({ user: user._id });
    } else if (user.role === 'investor') {
      profileData = await InvestorProfile.findOne({ user: user._id });
    }

    const profile = profileData ? profileData.toObject() : {};
    delete profile._id;
    delete profile.user;
    delete profile.createdAt;
    delete profile.updatedAt;
    delete profile.__v;

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      ...profile,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  });

  if (user) {
    let profileData;
    if (role === 'entrepreneur') {
      profileData = await EntrepreneurProfile.create({
        user: user._id,
        startupName: '',
        industry: '',
        fundingNeeded: '',
        location: '',
        pitchSummary: '',
      });
    } else if (role === 'investor') {
      profileData = await InvestorProfile.create({
        user: user._id,
      });
    }

    const profile = profileData ? profileData.toObject() : {};
    delete profile._id;
    delete profile.user;
    delete profile.createdAt;
    delete profile.updatedAt;
    delete profile.__v;

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      ...profile,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    let profileData = {};
    if (user.role === 'entrepreneur') {
      profileData = await EntrepreneurProfile.findOne({ user: user._id });
    } else if (user.role === 'investor') {
      profileData = await InvestorProfile.findOne({ user: user._id });
    }

    const profile = profileData ? profileData.toObject() : {};
    delete profile._id;
    delete profile.user;
    delete profile.createdAt;
    delete profile.updatedAt;
    delete profile.__v;

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      ...profile
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

export { loginUser, registerUser, getUserProfile };
