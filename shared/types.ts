export type Difficulty = "easy" | "medium" | "hard";

export type DocumentType = "pdf" | "docx" | "txt" | "markdown" | "ppt";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "admin";
  createdAt: string;
}

export interface DocumentDTO {
  id: string;
  title: string;
  userId: string;
  type: DocumentType;
  url: string;
  chunks: string[];
  createdAt: string;
}

export interface FlashcardDTO {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  userId: string;
}

export interface QuizQuestionDTO {
  prompt: string;
  type: "mcq" | "fill_blank" | "true_false" | "short_answer";
  options?: string[];
  answer: string;
}

export interface QuizDTO {
  id: string;
  title: string;
  questions: QuizQuestionDTO[];
  score?: number;
  userId: string;
}

export interface ProgressDTO {
  studyTime: number;
  streak: number;
  averageScore: number;
  topicsCompleted: number;
}

