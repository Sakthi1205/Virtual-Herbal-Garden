import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    // Optional username; keep unique if provided
    unique: true,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    // Only required for non-OAuth users
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false, // Do not return password on queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png',
  },
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
