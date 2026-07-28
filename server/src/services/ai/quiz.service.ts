import { askGeminiJson } from "./gemini.service.js";

export interface GeneratedQuestion {
  prompt: string;
  type: "mcq" | "fill_blank" | "true_false" | "short_answer";
  options: string[];
  answer: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
}

export async function generateQuizSet(text: string, count = 5): Promise<GeneratedQuiz> {
  const prompt = `
    You are an expert tutor. Create a quiz of exactly ${count} questions based on the notes provided.
    Vary the question types, incorporating multiple choice (mcq), true/false (true_false), fill-in-the-blanks (fill_blank), and short conceptual answers (short_answer).
    Return a single JSON object. The object MUST strictly match this schema:
    {
      "title": "A descriptive, short title summarizing this quiz's topic",
      "questions": [
        {
          "prompt": "The question wording or prompt text",
          "type": "mcq" | "fill_blank" | "true_false" | "short_answer",
          "options": ["Option A", "Option B", "Option C", "Option D"], // Only populate for 'mcq' type. Otherwise, provide an empty array [].
          "answer": "The correct answer value as a string (For MCQ, this MUST be the exact matching option string. For True/False, this MUST be 'true' or 'false')"
        }
      ]
    }

    Notes text:
    ${text}
  `;
  return askGeminiJson<GeneratedQuiz>(prompt);
}

