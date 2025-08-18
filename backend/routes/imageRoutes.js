import express from 'express';
import { getImagesByPlantName } from '../controllers/imageController.js';

const router = express.Router();

// GET /api/images/:name - fetch images for a given plant name
router.get('/:name', getImagesByPlantName);

export default router;
