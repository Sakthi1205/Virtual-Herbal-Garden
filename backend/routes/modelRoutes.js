import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  uploadModel,
  getModelByPlantName,
  getModelById,
  deleteModel,
  listModels
} from '../controllers/modelController.js';

const router = express.Router();

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only .glb files
  if (file.mimetype === 'model/gltf-binary' || path.extname(file.originalname).toLowerCase() === '.glb') {
    cb(null, true);
  } else {
    cb(new Error('Only .glb files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Routes

// Upload a 3D model for a plant
router.post('/upload/:plantName', upload.single('model'), uploadModel);

// Get a 3D model by plant name
router.get('/:plantName', getModelByPlantName);

// Get a 3D model by ID
router.get('/id/:id', getModelById);

// Delete a 3D model
router.delete('/:plantName', deleteModel);

// List all 3D models
router.get('/', listModels);

export default router;