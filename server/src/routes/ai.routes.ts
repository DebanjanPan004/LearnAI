import { Router } from "express";
import { 
  generateFlashcards, 
  generateQuiz, 
  generateStudyPlan, 
  summarize, 
  tutorChat,
  listFlashcards,
  listQuizzes,
  getQuizById,
  submitQuizScore
} from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);
aiRouter.post("/summary", summarize);
aiRouter.post("/chat", tutorChat);
aiRouter.post("/flashcards", generateFlashcards);
aiRouter.get("/flashcards", listFlashcards);
aiRouter.post("/quiz", generateQuiz);
aiRouter.get("/quizzes", listQuizzes);
aiRouter.get("/quizzes/:id", getQuizById);
aiRouter.post("/quizzes/:id/score", submitQuizScore);
aiRouter.post("/studyplan", generateStudyPlan);

