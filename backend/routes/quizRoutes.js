import express from "express";
import {
  getQuizzes,
  getQuizByPlantName,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from "../controllers/quizController.js";

const router = express.Router();

/* READ */
router.get("/", getQuizzes);
router.get("/id/:id", getQuizById);
router.get("/:plantName", getQuizByPlantName);

/* CREATE */
router.post("/", createQuiz);

/* UPDATE */
router.put("/:id", updateQuiz);

/* DELETE */
router.delete("/:id", deleteQuiz);

export default router;