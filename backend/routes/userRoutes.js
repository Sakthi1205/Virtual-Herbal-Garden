import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  changeUserPassword,
  deleteUserAccount,
  uploadProfilePicture,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Profile routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Settings routes
router.route('/settings').put(protect, updateUserSettings);

// Account management routes
router.route('/password').put(protect, changeUserPassword);
router.route('/profile').delete(protect, deleteUserAccount);

// Profile picture upload route
router.route('/profile/picture').post(protect, upload.single('profilePicture'), uploadProfilePicture);

export default router;
