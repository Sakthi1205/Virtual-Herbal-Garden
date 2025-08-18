import Note from '../models/Note.js';
import Plant from '../models/Plant.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Helper: ensure we have a valid user ObjectId. If not, use/create a Guest user.
const getGuestUserId = async () => {
  let guest = await User.findOne({ email: 'guest@herbal.local' });
  if (!guest) {
    // Use googleId to bypass password/username requirements
    guest = await User.create({ name: 'Guest', email: 'guest@herbal.local', googleId: 'guest' });
  }
  return guest._id;
};

const ensureUserId = async (maybeUserId) => {
  if (maybeUserId && mongoose.Types.ObjectId.isValid(maybeUserId)) return maybeUserId;
  return await getGuestUserId();
};

// Create a short summary note for a plant and save it for the user
export const summarizePlantAndSave = async (req, res) => {
  try {
    const { user, plantName, category = 'general' } = req.body;
    if (!plantName) {
      return res.status(400).json({ message: 'Missing required field: plantName' });
    }

    const userId = await ensureUserId(user);

    // Find plant by flexible name
    const normalized = plantName.replace(/\s+/g, '').toLowerCase();
    let plant = await Plant.findOne({ normalizedPlantName: normalized });
    if (!plant) {
      plant = await Plant.findOne({ plantName: { $regex: new RegExp(`^${plantName}$`, 'i') } });
    }

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found for summary' });
    }

    // Build a concise summary from available fields
    const parts = [];
    if (plant.scientificName) parts.push(`${plant.plantName} (${plant.scientificName})`);
    else parts.push(`${plant.plantName}`);
    if (plant.description) parts.push(plant.description);
    if (plant.medicinalProperties?.length) {
      const props = plant.medicinalProperties.slice(0, 3).map(p => p.property || p).filter(Boolean);
      if (props.length) parts.push(`Key medicinal properties: ${props.join(', ')}.`);
    }
    if (plant.traditionalUses?.length) {
      const uses = plant.traditionalUses.slice(0, 3);
      parts.push(`Traditional uses: ${uses.join('; ')}.`);
    }
    if (plant.careInstructions) {
      const ci = plant.careInstructions;
      const careBits = [];
      if (ci.watering) careBits.push(`Watering: ${ci.watering}`);
      if (ci.sunlight || plant.growingConditions?.sunlight) careBits.push(`Sunlight: ${ci.sunlight || plant.growingConditions?.sunlight}`);
      if (ci.soilType || plant.growingConditions?.soilType) careBits.push(`Soil: ${ci.soilType || plant.growingConditions?.soilType}`);
      if (careBits.length) parts.push(careBits.join(' | '));
    }

    const summary = parts.join('\n');

    const note = new Note({
      user: userId,
      plant: plant._id,
      plantName: plant.plantName,
      title: `Summary: ${plant.plantName}`,
      content: summary.substring(0, 2000),
      category,
      tags: ['summary']
    });

    const saved = await note.save();
    const populated = await Note.findById(saved._id)
      .populate('user', 'name email')
      .populate('plant', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating summary note', error: error.message });
  }
};

// Get all notes for a user with filtering and categorization
export const getNotes = async (req, res) => {
  try {
    let { userId, plantName, category, limit = 50 } = req.query;
    const filter = {};
    if (userId) {
      userId = await ensureUserId(userId);
      filter.user = userId;
    }
    if (plantName) filter.plantName = plantName;
    if (category) filter.category = category;

    const notes = await Note.find(filter)
      .populate('user', 'name email')
      .populate('plant', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// Get notes by category for a user
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notesByCategory = await Note.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { 
        $group: {
          _id: '$category',
          notes: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json(notesByCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categorized notes', error: error.message });
  }
};

// Get most recent note for a user
export const getRecentNote = async (req, res) => {
  try {
    let { userId, plantName } = req.query;
    
    const ensured = await ensureUserId(userId);
    let filter = { user: ensured };
    if (plantName) filter.plantName = plantName;
    
    const recentNote = await Note.findOne(filter)
      .populate('user', 'name email')
      .populate('plant', 'name')
      .sort({ createdAt: -1 });
    
    res.json(recentNote);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent note', error: error.message });
  }
};

// Get single note by ID
export const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plant', 'name')
      .populate('sharedWith', 'name email');
    
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching note', error: error.message });
  }
};

// Create new note
export const createNote = async (req, res) => {
  try {
    const { user, plant, plantName, title, content, category, tags } = req.body;

    if (!plantName || !title || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields: plantName, title, content' 
      });
    }

    const userId = await ensureUserId(user);
    
    const note = new Note({
      user: userId,
      plant,
      plantName,
      title,
      content,
      category: category || 'general',
      tags: tags || []
    });
    
    const savedNote = await note.save();
    const populatedNote = await Note.findById(savedNote._id)
      .populate('user', 'name email')
      .populate('plant', 'name');
    
    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    // Update fields
    if (title) note.title = title;
    if (content) note.content = content;
    if (category) note.category = category;
    if (tags) note.tags = tags;
    
    const updatedNote = await note.save();
    const populatedNote = await Note.findById(updatedNote._id)
      .populate('user', 'name email')
      .populate('plant', 'name');
    
    res.json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    await Note.findByIdAndDelete(id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

// Share note with other users
export const shareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, isShared } = req.body;
    
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    note.isShared = isShared;
    if (userIds && Array.isArray(userIds)) {
      note.sharedWith = userIds;
    }
    
    const updatedNote = await note.save();
    const populatedNote = await Note.findById(updatedNote._id)
      .populate('user', 'name email')
      .populate('plant', 'name')
      .populate('sharedWith', 'name email');
    
    res.json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing note', error: error.message });
  }
};
