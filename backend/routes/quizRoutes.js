import express from 'express';
import { getQuizzes, getQuizByPlantName } from '../controllers/quizController.js';

const router = express.Router();

router.route('/').get(getQuizzes);
router.route('/:plantName').get(getQuizByPlantName);

export default router;
