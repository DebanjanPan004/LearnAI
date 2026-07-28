# LearnAI 🧠✨

LearnAI is an advanced, full-stack AI-Powered Smart Learning Platform designed to help students learn, practice, and master concepts from their own study materials. By combining modern text processing with local semantic keyword indexing and the Gemini API, LearnAI serves as a personalized AI tutor that operates directly on your uploaded notes, slides, and textbooks.

---

## 🚀 Key Features

* **🔑 Secure Authentication & User Control:** 
  * Full registration and login flows protected by JWT & bcrypt.
  * 6-digit email verification OTP code validation.
  * Secure password recovery and token reset mechanisms.
* **📄 Document Upload & Automatic Ingestion:**
  * Support for bulk uploading PDF, DOCX, TXT, and Markdown files.
  * Automated background text extraction and paragraph segmentation.
* **💬 AI Tutor Chat (RAG):**
  * Interact with an intelligent study assistant whitelisted to your documents.
  * Utilizes a high-accuracy, rate-limit-compliant local keyword indexing search to retrieve context.
  * Displays source references in the chat interface for citation checks.
* **🎴 Flashcards & Practice Quizzes:**
  * Auto-generates recall flashcards from specific documents with interactive flipping card interfaces.
  * Creates mixed-type quizzes (MCQ, True/False, fill-in-the-blanks) and records score metrics.
* **📅 Study Timetable Planner:**
  * Design custom exam-prep calendars by specifying days and subjects.
* **📊 Analytics Dashboard:**
  * Live tracking of study streaks, total files, flashcards created, and average quiz accuracy.
  * Visual progress charts powered by Recharts plotting weekly times and topic accuracies.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React (Vite) + TypeScript
* **State Management:** Redux Toolkit (Auth sessions)
* **Queries & Mutations:** TanStack Query (React Query)
* **Styling:** Tailwind CSS + Lucide Icons
* **Charts:** Recharts
* **Markdown Rendering:** React Markdown

### Backend (Server)
* **Runtime:** Node.js + Express + TypeScript
* **Database:** MongoDB Atlas + Mongoose
* **AI Engine:** Google Generative AI (`gemini-flash-latest` & `gemini-embedding-001`)
* **Document Parsing:** pdf-parse, mammoth
* **Email Dispatcher:** Nodemailer (with Console fallback in development)

---

## 📂 Project Structure

```text
LearnAI/
  ├── client/        # Vite React Frontend application
  │    ├── src/
  │    │    ├── components/    # Reusable UI elements (metric cards, headers)
  │    │    ├── layouts/       # Protected sidebar wrapper
  │    │    ├── pages/         # Chat, dashboard, docs, quizzes, planner, progress
  │    │    └── redux/         # Store config & auth slices
  ├── server/        # Express API Server application
  │    ├── src/
  │    │    ├── config/        # Mongoose Database connections
  │    │    ├── controllers/   # Request-response logic handlers
  │    │    ├── models/        # MongoDB schemas (User, Chunk, Document, Quiz, Progress)
  │    │    ├── routes/        # Router bindings
  │    │    └── services/      # Gemini integration, local RAG indexers, email utilities
  └── shared/        # Shared TypeScript contracts & interfaces
```

---

## ⚙️ Quick Start

### 1. Prerequisites
Ensure you have node.js (v18+) and npm installed locally.

### 2. Install Dependencies
Run the install command inside both directories:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
Configure your environment keys. Create `.env` files in both directories based on the example templates:

**In `server/.env`:**
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

**In `client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Project
Launch the local development servers simultaneously:

**Start Backend Server:**
```bash
cd server
npm run dev
```

**Start Frontend Application:**
```bash
cd client
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser to start studying!
