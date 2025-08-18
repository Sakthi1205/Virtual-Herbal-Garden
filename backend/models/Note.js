import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  plant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plant'
  },
  plantName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['personal', 'research', 'observation', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Explicitly specify the collection name as 'notes' in the Herbal_Garden database
const Note = mongoose.model('Note', noteSchema, 'notes');
export default Note;
