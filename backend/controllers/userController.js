import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // The user's ID should be available from a protect middleware
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name || user.username, // support legacy docs
      email: user.email,
      settings: user.settings,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    // Map incoming fields to 'name'
    if (typeof req.body.name !== 'undefined') user.name = req.body.name;
    if (typeof req.body.username !== 'undefined') user.name = req.body.username; // backward compatibility
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name || updatedUser.username,
      email: updatedUser.email,
      settings: updatedUser.settings,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user settings (appearance)
// @route   PUT /api/users/settings
// @access  Private
const updateUserSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    if (!user.settings) user.settings = {};
    if (typeof req.body.theme !== 'undefined') user.settings.theme = req.body.theme;
    if (typeof req.body.fontSize !== 'undefined') user.settings.fontSize = req.body.fontSize;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name || updatedUser.username,
      email: updatedUser.email,
      settings: updatedUser.settings,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both old and new passwords');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (user && (await user.matchPassword(oldPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid old password');
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    await user.deleteOne(); // Mongoose 6+ uses deleteOne()
    res.json({ message: 'User account deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Upload user profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.profilePicture = req.file.filename;
    const updatedUser = await user.save();
    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  changeUserPassword,
  deleteUserAccount,
  uploadProfilePicture,
};
