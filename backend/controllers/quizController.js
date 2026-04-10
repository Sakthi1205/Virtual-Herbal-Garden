import Quiz from "../models/Quiz.js";

/* =====================================================
   GET ALL QUIZZES (WITH QUESTIONS COUNT)
   GET /api/quizzes
===================================================== */
export const getQuizzes = async (req, res) => {
  try {
    // ✅ FIXED: Include questions.length for count, but not full array to save bandwidth
    const quizzes = await Quiz.find({}, { 
      plantName: 1, 
      questions: 1 
    }).lean(); // lean() for better performance
    
    // Add question count for display
    const quizzesWithCount = quizzes.map(quiz => ({
      _id: quiz._id,
      plantName: quiz.plantName,
      questionsCount: quiz.questions ? quiz.questions.length : 0,
      hasQuestions: quiz.questions && quiz.questions.length > 0
    }));

    res.status(200).json(quizzesWithCount);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   GET QUIZ BY PLANT NAME (FULL QUIZ WITH QUESTIONS)
   GET /api/quizzes/:plantName
===================================================== */
export const getQuizByPlantName = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      plantName: req.params.plantName
    }).lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get quiz by plant name error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   GET QUIZ BY ID (FULL QUIZ WITH QUESTIONS)
   GET /api/quizzes/id/:id
===================================================== */
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ message: "Invalid ID or Server Error" });
  }
};

/* =====================================================
   CREATE NEW QUIZ
   POST /api/quizzes
===================================================== */
export const createQuiz = async (req, res) => {
  try {
    const { plantName, questions } = req.body;

    // Validate input
    if (!plantName || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Plant name and questions required" });
    }

    // Prevent duplicate quiz for same plant
    const existingQuiz = await Quiz.findOne({ plantName });
    if (existingQuiz) {
      return res.status(409).json({
        message: "Quiz for this plant already exists"
      });
    }

    const quiz = await Quiz.create({
      plantName,
      questions
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================================
   UPDATE QUIZ
   PUT /api/quizzes/:id
===================================================== */
export const updateQuiz = async (req, res) => {
  try {
    const { plantName, questions } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { plantName, questions },
      { new: true, runValidators: true }
    ).lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================================
   DELETE QUIZ
   DELETE /api/quizzes/:id
===================================================== */
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: "Invalid ID or Server Error" });
  }
};
