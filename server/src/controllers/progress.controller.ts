import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Progress } from "../models/Progress.js";
import { Document } from "../models/Document.js";
import { Flashcard } from "../models/Flashcard.js";
import { Quiz } from "../models/Quiz.js";

export async function getProgress(req: AuthRequest, res: Response) {
  // 1. Get or create progress
  const progress = await Progress.findOneAndUpdate(
    { userId: req.userId },
    { $setOnInsert: { userId: req.userId, studyTime: 30, streak: 1 } }, // default starter values
    { upsert: true, new: true }
  );

  // 2. Count documents, flashcards, and quizzes
  const documentCount = await Document.countDocuments({ userId: req.userId });
  const flashcardCount = await Flashcard.countDocuments({ userId: req.userId });
  const completedQuizzes = await Quiz.find({ userId: req.userId, score: { $ne: null } });

  // 3. Calculate average quiz score
  let averageScore = 0;
  if (completedQuizzes.length > 0) {
    const total = completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0);
    averageScore = Math.round(total / completedQuizzes.length);
  }

  // Update progress record with new stats
  progress.averageScore = averageScore;
  await progress.save();

  // 4. Group accuracy by Quiz Title (topic)
  const topicAccuracyMap: Record<string, number[]> = {};
  completedQuizzes.forEach((q) => {
    const topic = q.title.replace(/Quiz/gi, "").trim();
    if (!topicAccuracyMap[topic]) topicAccuracyMap[topic] = [];
    topicAccuracyMap[topic].push(q.score || 0);
  });

  const accuracyBreakdown = Object.entries(topicAccuracyMap).map(([topic, scores]) => ({
    topic,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }));

  // 5. Mock a daily study minutes log using progress.studyTime
  const totalMin = progress.studyTime || 30;
  const weeklyProgress = [
    { day: "Mon", minutes: Math.round(totalMin * 0.1) },
    { day: "Tue", minutes: Math.round(totalMin * 0.15) },
    { day: "Wed", minutes: Math.round(totalMin * 0.1) },
    { day: "Thu", minutes: Math.round(totalMin * 0.2) },
    { day: "Fri", minutes: Math.round(totalMin * 0.15) },
    { day: "Sat", minutes: Math.round(totalMin * 0.2) },
    { day: "Sun", minutes: totalMin - Math.round(totalMin * 0.9) }
  ];

  res.json({
    progress: {
      studyTime: progress.studyTime,
      streak: progress.streak,
      averageScore,
      topicsCompleted: completedQuizzes.length
    },
    counts: {
      documents: documentCount,
      flashcards: flashcardCount,
      quizzes: completedQuizzes.length
    },
    accuracyBreakdown,
    weeklyProgress
  });
}

export async function updateProgress(req: AuthRequest, res: Response) {
  const { studyMinutes } = req.body;
  const progress = await Progress.findOneAndUpdate(
    { userId: req.userId },
    { $setOnInsert: { userId: req.userId } },
    { upsert: true, new: true }
  );

  if (studyMinutes) {
    progress.studyTime += Number(studyMinutes);
    if (progress.streak === 0) progress.streak = 1;
    await progress.save();
  }

  res.json({ progress });
}

