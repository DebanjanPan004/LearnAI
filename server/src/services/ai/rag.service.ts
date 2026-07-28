import { askGemini } from "./gemini.service.js";
import { Document } from "../../models/Document.js";
import { Chunk } from "../../models/Chunk.js";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "else", "when", "at", "by", 
  "from", "for", "with", "in", "on", "to", "of", "about", "what", "who", "whom", 
  "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "can", "could", "will", "would", "shall", 
  "should", "my", "your", "his", "her", "its", "their", "our", "me", "you", "him", 
  "them", "us", "pdf", "document", "explain", "describe", "show", "tell"
]);

function localKeywordSearch(chunks: any[], query: string): any[] {
  const queryTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  if (queryTerms.length === 0) {
    const fallbackTerms = query.toLowerCase().split(/\W+/).filter(Boolean);
    if (fallbackTerms.length === 0) return [];
    queryTerms.push(...fallbackTerms);
  }

  const scored = chunks.map((c) => {
    let score = 0;
    const textLower = c.text.toLowerCase();

    queryTerms.forEach((term) => {
      const termRegex = new RegExp(term, 'g');
      const matches = textLower.match(termRegex);
      if (matches) {
        // Boost matches for longer query terms
        score += matches.length * term.length;
      }
    });

    return { chunk: c, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // top 3 matching chunks
}

export async function answerWithRag(userId: string, question: string) {
  // 1. Get all user documents
  const documents = await Document.find({ userId });
  if (documents.length === 0) {
    return {
      text: "You haven't uploaded any study materials yet. Please upload notes in the **Documents** section, and I will be able to answer questions directly using your study content!",
      sources: []
    };
  }

  const documentIds = documents.map((d) => d._id);
  const docMap = new Map(documents.map((d) => [d._id.toString(), d.title]));

  // 2. Get all chunks for these documents
  const chunks = await Chunk.find({ documentId: { $in: documentIds } });
  if (chunks.length === 0) {
    const result = await askGemini(question);
    return { text: result.text, sources: [] };
  }

  try {
    // 3. Perform local keyword search
    const scored = localKeywordSearch(chunks, question);

    if (scored.length === 0) {
      // No relevant chunk found, let Gemini answer generally
      const result = await askGemini(question);
      return {
        text: `${result.text}\n\n*(Note: I couldn't find matching information in your uploaded documents, so I answered using general knowledge.)*`,
        sources: []
      };
    }

    // 4. Construct prompt context
    const context = scored.map((item) => item.chunk.text).join("\n\n---\n\n");
    const matchedDocIds = Array.from(new Set(scored.map((item) => item.chunk.documentId.toString())));
    const sources = matchedDocIds.map((id) => docMap.get(id)).filter(Boolean) as string[];

    const prompt = `
      You are an expert, helpful AI tutor for a student.
      Answer the student's question specifically using the uploaded study context provided below.
      
      Study Notes Context:
      ${context}

      Student's Question:
      ${question}

      Instructions:
      - Answer in detail, explain concepts clearly, and format your response with clean Markdown.
      - Prioritize information from the context.
      - If the context does not contain the answer, answer using general knowledge but start your reply by saying: "I couldn't find this in your uploaded notes, but here is the explanation:"
    `;

    const result = await askGemini(prompt);
    return {
      text: result.text,
      sources
    };
  } catch (err) {
    console.error("RAG keyword search failed, falling back to general chat:", err);
    const result = await askGemini(question);
    return {
      text: `${result.text}\n\n*(Note: There was an error reading your document index, so I answered using general knowledge.)*`,
      sources: []
    };
  }
}

