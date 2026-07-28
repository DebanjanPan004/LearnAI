# LearnAI

AI-Powered Smart Learning Platform

**Upload. Learn. Practice. Master.**

LearnAI is a full-stack learning assistant where students upload PDFs, DOCX files, notes, slides, TXT, or Markdown files and receive summaries, concept explanations, flashcards, quizzes, RAG-based answers, progress tracking, bookmarks, and personalized study plans.

## Tech Stack

- **Client:** React 19, TypeScript, Tailwind CSS, React Router, Redux Toolkit, TanStack Query, Axios, React Hook Form, Framer Motion, Recharts, React Markdown, Lucide React
- **Server:** Node.js, Express, JWT, bcrypt, Multer, Nodemailer, Express Validator, Morgan, CORS, Helmet
- **Database:** MongoDB Atlas
- **AI:** Gemini API, LangChain, ChromaDB, Google or Hugging Face embeddings
- **Document Processing:** pdf-parse, mammoth, Tesseract.js for scanned PDFs

## Project Structure

```text
LearnAI/
  client/   React frontend
  server/   Express API, database models, auth, upload, progress
  ai/       RAG, prompts, summaries, quizzes, flashcards, study plans
  shared/   Shared TypeScript contracts
  docs/     Product and API documentation
```

## Quick Start

1. Install dependencies in each app:

```bash
cd client && npm install
cd ../server && npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Fill in MongoDB, JWT, Gemini, ChromaDB, and email settings.

4. Run both apps:

```bash
cd server && npm run dev
cd client && npm run dev
```

## Core Features

- Authentication with register, login, reset password, and email verification
- Dashboard with streaks, documents, flashcards, quizzes, AI chats, progress, and score
- Document upload and parsing for PDF, DOCX, TXT, and Markdown
- AI summaries with important topics, formulae, and interview questions
- AI tutor with retrieval from uploaded study material
- Flashcard and quiz generation
- Chat interface with RAG-first behavior
- Study planner for exam preparation
- Progress charts, bookmarks, search, profile achievements, and badges

