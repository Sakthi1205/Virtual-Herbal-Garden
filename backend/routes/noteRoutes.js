import express from 'express';
import { 
  getNotes, 
  getNote, 
  getNotesByCategory,
  getRecentNote,
  createNote, 
  updateNote, 
  deleteNote, 
  shareNote,
  summarizePlantAndSave,
} from '../controllers/noteController.js';

const router = express.Router();

// Get routes
router.get('/', getNotes);                           // Get all notes with filters
router.get('/recent', getRecentNote);                // Get most recent note
router.get('/category/:userId', getNotesByCategory); // Get notes by category
router.get('/:id', getNote);                         // Get single note

// Post routes
router.post('/', createNote);                        // Create new note
router.post('/summary', summarizePlantAndSave);      // Create a short plant summary note

// Put routes
router.put('/:id', updateNote);                      // Update note
router.put('/:id/share', shareNote);                 // Share note

// Delete routes
router.delete('/:id', deleteNote);                   // Delete note

export default router;
