import express from 'express';
import { getPlants, getPlantByName, getPlantById, createPlant, searchPlants } from '../controllers/plantController.js';
const router = express.Router();

// Get all plants
router.get('/', getPlants);

// Search plants by plantName
router.get('/search', searchPlants);

// Get plant by ID
router.get('/id/:id', getPlantById);

// Get plant by plantName
router.get('/:name', getPlantByName);

// Create new plant
router.post('/', createPlant);

export default router;
