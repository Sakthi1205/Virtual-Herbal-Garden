import Plant from '../models/Plant.js';

export const createPlant = async (req, res) => {
  try {
    const plant = await Plant.create(req.body);
    res.status(201).json({
      success: true,
      data: plant
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json({
      success: true,
      data: plants
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getPlantByName = async (req, res) => {
  try {
    const { name } = req.params;
    const normalized = name.replace(/\s+/g, '').toLowerCase();
    // Try normalized match
    let plant = await Plant.findOne({
      $expr: {
        $eq: [
          { $replaceAll: { input: { $toLower: "$plantName" }, find: " ", replacement: "" } },
          normalized
        ]
      }
    });
    // Try exact match if not found
    if (!plant) {
      plant = await Plant.findOne({ plantName: name });
    }
    // Try case-insensitive match if not found
    if (!plant) {
      plant = await Plant.findOne({ plantName: { $regex: new RegExp(`^${name}$`, 'i') } });
    }
    // Try partial match if not found
    if (!plant) {
      plant = await Plant.findOne({ plantName: { $regex: new RegExp(name, 'i') } });
    }
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    res.json({ success: true, data: plant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ 
        success: false,
        message: 'Plant not found' 
      });
    }
    res.json({
      success: true,
      data: plant
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const searchPlants = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Name parameter is required' 
      });
    }
    const plants = await Plant.find({
      $or: [
        { plantName: { $regex: new RegExp(name, 'i') } },
        { scientificName: { $regex: new RegExp(name, 'i') } }
      ]
    });
    res.json({
      success: true,
      data: plants
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};
