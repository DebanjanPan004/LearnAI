import { askGemini } from "./gemini.service.js";

export async function generateSummary(text: string) {
  const prompt = `Summarize these notes for a student. Return shortSummary, detailedSummary, importantTopics, keyFormulae, and interviewQuestions.\n\n${text}`;
  return askGemini(prompt);
}

