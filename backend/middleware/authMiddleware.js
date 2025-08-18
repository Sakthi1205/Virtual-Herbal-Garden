import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  // 1) If request is already authenticated via Passport session, allow
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Attach a normalized user object if needed (ensure no password)
    if (!req.user || (req.user && req.user.password)) {
      const user = await User.findById(req.user?._id || req.user?.id).select('-password');
      if (user) req.user = user;
    }
    return next();
  }

  // 2) Otherwise, try JWT Bearer token
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      return next();
    } catch (err) {
      console.error('JWT verify failed:', err.message);
      res.status(401);
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Not authorized, token invalid');
    }
  }

  // 3) No session and no valid JWT
  res.status(401);
  throw new Error('Not authorized');
});

export { protect };
