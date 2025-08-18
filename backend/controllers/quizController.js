import Quiz from '../models/Quiz.js';

// @desc    Get all quizzes (plant names only)
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).select('plantName');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get quiz by plant name
// @route   GET /api/quizzes/:plantName
// @access  Public
const getQuizByPlantName = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ plantName: req.params.plantName });
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getQuizzes, getQuizByPlantName };

export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};
