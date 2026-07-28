import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Chunk } from "../models/Chunk.js";
import { Flashcard } from "../models/Flashcard.js";
import { Quiz } from "../models/Quiz.js";
import { generateFlashcardSet } from "../services/ai/flashcards.service.js";
import { answerWithRag } from "../services/ai/rag.service.js";
import { generateQuizSet } from "../services/ai/quiz.service.js";
import { generateSummary } from "../services/ai/summary.service.js";
import { generatePlan } from "../services/ai/studyplan.service.js";

async function getTextFromRequest(req: AuthRequest): Promise<string> {
  const { documentId, text, topic } = req.body;
  if (documentId) {
    const chunks = await Chunk.find({ documentId }).sort({ pageNumber: 1 });
    if (chunks.length > 0) {
      return chunks.map((c) => c.text).join("\n\n");
    }
  }
  return text || topic || "";
}

export async function summarize(req: AuthRequest, res: Response) {
  const text = await getTextFromRequest(req);
  if (!text) return res.status(400).json({ message: "No notes text or documentId provided to summarize." });
  res.json(await generateSummary(text));
}

export async function tutorChat(req: AuthRequest, res: Response) {
  res.json(await answerWithRag(req.userId!, req.body.question));
}

export async function generateFlashcards(req: AuthRequest, res: Response) {
  const text = await getTextFromRequest(req);
  if (!text) return res.status(400).json({ message: "No text or documentId provided for flashcards." });
  
  const count = Number(req.body.count || 10);
  const generated = await generateFlashcardSet(text, count);

  const saved = await Flashcard.insertMany(
    generated.map((card) => ({
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || "medium",
      userId: req.userId
    }))
  );

  res.status(201).json({ flashcards: saved });
}

export async function listFlashcards(req: AuthRequest, res: Response) {
  const flashcards = await Flashcard.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ flashcards });
}

export async function generateQuiz(req: AuthRequest, res: Response) {
  const text = await getTextFromRequest(req);
  if (!text) return res.status(400).json({ message: "No text or documentId provided for quiz." });

  const count = Number(req.body.count || 5);
  const generated = await generateQuizSet(text, count);

  const saved = await Quiz.create({
    title: generated.title || "Study Quiz",
    questions: generated.questions,
    userId: req.userId
  });

  res.status(201).json({ quiz: saved });
}

export async function listQuizzes(req: AuthRequest, res: Response) {
  const quizzes = await Quiz.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ quizzes });
}

export async function getQuizById(req: AuthRequest, res: Response) {
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json({ quiz });
}

export async function submitQuizScore(req: AuthRequest, res: Response) {
  const { score } = req.body;
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { score },
    { new: true }
  );
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json({ quiz });
}

export async function generateStudyPlan(req: AuthRequest, res: Response) {
  res.json(await generatePlan(req.body));
}

