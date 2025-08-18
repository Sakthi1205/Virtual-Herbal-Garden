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
  scientificName: String,
  description: String,
  taxonomy: {
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String,
    species: String
  },
  morphology: {
    height: String,
    leaves: String,
    flowers: String,
    fruits: String,
    roots: String
  },
  geographicDistribution: String,
  phytochemistry: [String],
  medicinalProperties: [{
    property: String,
    description: String
  }],
  ayurvedicProfile: {
    rasa: [String],
    guna: [String],
    virya: String,
    vipaka: String,
    doshaAction: String,
    ayurvedicActions: [String]
  },
  traditionalUses: [String],
  pharmacologicalStudies: [String],
  genomicResearch: [String],
  culturalSignificance: [String],
  references: [String],
  precautions: [String],
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
  origin: String,
  harvestTime: String,
  safetyNotes: {
    toxicity: String,
    warnings: [String],
    contraindications: [String]
  },
  model3D: {
    type: Buffer, // Store .glb file as binary data (legacy approach)
    required: false
  },
  model3DFileId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to GridFS file
    required: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});


// Pre-save hook to set normalizedPlantName for uniqueness (case-insensitive, no spaces)
plantSchema.pre('validate', function(next) {
  if (this.plantName) {
    this.normalizedPlantName = this.plantName.replace(/\s+/g, '').toLowerCase();
  }
  next();
});

const Plant = mongoose.model('Plant', plantSchema);
export default Plant;
