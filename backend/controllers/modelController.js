import mongoose from 'mongoose';
import Plant from '../models/Plant.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload a 3D model file for a plant
 * @route POST /api/models/upload/:plantName
 */
export const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { plantName } = req.params;
    const normalizedPlantName = plantName.replace(/\s+/g, '').toLowerCase();
    
    // Find the plant
    const plant = await Plant.findOne({ normalizedPlantName });
    if (!plant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plant not found' 
      });
    }

    // Upload file to GridFS
    const metadata = {
      plantId: plant._id,
      plantName: plant.plantName,
      contentType: req.file.mimetype,
      uploadDate: new Date()
    };

    const fileInfo = await uploadModelToGridFS(
      req.file.path, 
      `${normalizedPlantName}.glb`, 
      metadata
    );

    // Update plant with file reference
    plant.model3DFileId = fileInfo._id;
    await plant.save();

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: '3D model uploaded successfully',
      data: {
        fileId: fileInfo._id,
        filename: fileInfo.filename,
        plantName: plant.plantName
      }
    });
  } catch (err) {
    console.error('Error uploading 3D model:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * Get a 3D model file by plant name
 * @route GET /api/models/:plantName
 */
export const getModelByPlantName = async (req, res) => {
  try {
    const { plantName } = req.params;
    const normalizedPlantName = plantName.replace(/\s+/g, '').toLowerCase();
    
    // Find the plant
    const plant = await Plant.findOne({ normalizedPlantName });
    if (!plant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plant not found' 
      });
    }

    if (!plant.model3DFileId) {
      return res.status(404).json({ 
        success: false, 
        message: '3D model not found for this plant' 
      });
    }

    // Get file from GridFS
    const downloadStream = await getModelFromGridFSById(plant.model3DFileId);
    
    // Set headers
    res.set('Content-Type', 'model/gltf-binary');
    res.set('Content-Disposition', `attachment; filename="${normalizedPlantName}.glb"`);
    
    // Pipe the file to the response
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error getting 3D model:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * Get a 3D model file by ID
 * @route GET /api/models/id/:id
 */
export const getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file from GridFS
    const downloadStream = await getModelFromGridFSById(id);
    
    // Set headers
    res.set('Content-Type', 'model/gltf-binary');
    res.set('Content-Disposition', 'attachment; filename="model.glb"');
    
    // Pipe the file to the response
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error getting 3D model:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * Delete a 3D model file
 * @route DELETE /api/models/:plantName
 */
export const deleteModel = async (req, res) => {
  try {
    const { plantName } = req.params;
    const normalizedPlantName = plantName.replace(/\s+/g, '').toLowerCase();
    
    // Find the plant
    const plant = await Plant.findOne({ normalizedPlantName });
    if (!plant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plant not found' 
      });
    }

    if (!plant.model3DFileId) {
      return res.status(404).json({ 
        success: false, 
        message: '3D model not found for this plant' 
      });
    }

    // Delete file from GridFS
    await deleteModelFromGridFS(plant.model3DFileId);

    // Update plant
    plant.model3DFileId = undefined;
    await plant.save();

    res.status(200).json({
      success: true,
      message: '3D model deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting 3D model:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * List all 3D models
 * @route GET /api/models
 */
export const listModels = async (req, res) => {
  try {
    const files = await listModelsInGridFS();
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (err) {
    console.error('Error listing 3D models:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// GridFS migration function removed - using static file serving for 3D models