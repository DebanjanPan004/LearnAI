import { askGeminiJson } from "./gemini.service.js";

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function generateFlashcardSet(text: string, count = 10): Promise<GeneratedFlashcard[]> {
  const prompt = `
    You are an expert tutor. Create exactly ${count} study flashcards based on the notes provided.
    Provide questions that promote active recall, and concise, high-value answers.
    Return a JSON array of objects. Each object in the array MUST match this schema:
    [
      {
        "question": "A clear, testing question",
        "answer": "A concise, detailed answer explaining the concept",
        "difficulty": "easy" | "medium" | "hard"
      }
    ]

    Notes text:
    ${text}
  `;
  return askGeminiJson<GeneratedFlashcard[]>(prompt);
}

