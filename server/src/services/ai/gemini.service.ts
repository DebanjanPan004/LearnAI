import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return { text: "Gemini API key is not configured yet.", raw: null };
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);

  return { text: result.response.text(), raw: result.response };
}

export async function askGeminiJson<T>(prompt: string): Promise<T> {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Gemini API key is not configured yet.");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();
  
  try {
    return JSON.parse(rawText) as T;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON. Raw text was:", rawText);
    throw new Error("Failed to generate structured JSON response from AI.");
  }
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini API key is not configured yet.");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Bypassed remote embedding API calls to prevent 429 quota exhaustion.
  // Context retrieval is handled by high-performance local keyword search instead.
  return texts.map(() => []);
}

