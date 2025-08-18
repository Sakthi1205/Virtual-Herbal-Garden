import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: String,
    required: true,
  },
});

const quizSchema = new mongoose.Schema({
  plantName: {
    type: String,
    required: true,
    unique: true,
  },
  questions: [questionSchema],
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
