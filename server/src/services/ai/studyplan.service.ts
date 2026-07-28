import { askGemini } from "./gemini.service.js";

interface StudyPlanInput {
  exam: string;
  days: number;
  subjects: string[];
}

export async function generatePlan(input: StudyPlanInput) {
  const prompt = `Create a daily study timetable for this exam plan: ${JSON.stringify(input)}. Balance revision, practice, weak topics, and rest.`;
  return askGemini(prompt);
}

