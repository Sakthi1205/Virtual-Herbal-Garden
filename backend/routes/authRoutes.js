import express from 'express';
import passport from 'passport';
import { registerUser, authUser } from '../controllers/authController.js';

const router = express.Router();

// Local Authentication
router.post('/register', registerUser);
router.post('/login', authUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.CLIENT_URL,
    session: true
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL + '/main');
  }
);

// POST /api/auth/logout - destroy session and clear cookie
router.post('/logout', (req, res, next) => {
  // Passport 0.6 requires a callback
  req.logout(function(err) {
    if (err) { return next(err); }
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid', { path: '/' });
        return res.json({ success: true, message: 'Logged out' });
      });
    } else {
      res.clearCookie('connect.sid', { path: '/' });
      return res.json({ success: true, message: 'Logged out' });
    }
  });
});

export default router;
