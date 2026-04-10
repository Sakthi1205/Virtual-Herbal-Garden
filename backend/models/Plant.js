import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  plantName: {
    type: String,
    required: true,
    trim: true
  },

  normalizedPlantName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // 🌿 BASIC INFO
  scientificName: String,
  description: String,

  // 🌿 TAXONOMY
  taxonomy: {
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String,
    species: String
  },

  // 🌿 MORPHOLOGY
  morphology: {
    height: String,
    leaves: String,
    flowers: String,
    fruits: String,
    roots: String
  },

  // 🌿 DISTRIBUTION
  geographicDistribution: String,

  // 🌿 CHEMISTRY
  phytochemistry: [String],

  // 🌿 MEDICINAL
  medicinalProperties: [{
    property: String,
    description: String
  }],

  // 🌿 AYURVEDA
  ayurvedicProfile: {
    rasa: [String],
    guna: [String],
    virya: String,
    vipaka: String,
    doshaAction: String,
    ayurvedicActions: [String]
  },

  // 🌿 TRADITIONAL + RESEARCH
  traditionalUses: [String],
  pharmacologicalStudies: [String],
  genomicResearch: [String],
  culturalSignificance: [String],

  // 🌿 REFERENCES
  references: [String],

  // 🌿 SAFETY
  precautions: [String],

  // 🌿 GROWTH
  growingConditions: {
    climate: String,
    soilType: String,
    sunlight: String,
    waterNeeds: String
  },

  careInstructions: {
    watering: String,
    fertilizing: String,
    pruning: String,
    pestControl: String
  },

  // 🌿 GENERAL INFO
  origin: String,
  harvestTime: String,

  safetyNotes: {
    toxicity: String,
    warnings: [String],
    contraindications: [String]
  },

  // 🌿 3D MODEL
  model3D: {
    type: String, // .glb file path / URL
    required: true
  },

  // 🔥 NEW ADDITIONS (IMPORTANT)

  // 👉 FULL Wikipedia RAW (no data loss)
  rawContent: {
    type: String
  },

  // 👉 AI structured backup (flexible future-proof)
  aiStructured: {
    type: mongoose.Schema.Types.Mixed
  },

  // 👉 Source tracking (optional but useful)
  dataSource: {
    type: String,
    enum: ['manual', 'wiki-ai'],
    default: 'manual'
  },

  // 👉 Image support (from Wikipedia)
  images: [String],

  lastUpdated: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});


// 🔥 INDEXES (Performance boost)
plantSchema.index({ plantName: 'text', scientificName: 'text' });


// 🔥 PRE-SAVE HOOK (UNCHANGED LOGIC)
plantSchema.pre('validate', function(next) {
  if (this.plantName) {
    this.normalizedPlantName = this.plantName.replace(/\s+/g, '').toLowerCase();
  }
  next();
});


const Plant = mongoose.model('Plant', plantSchema);
export default Plant;