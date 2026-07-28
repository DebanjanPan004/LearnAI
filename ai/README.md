# LearnAI AI Layer

This folder describes the AI modules used by the API.

## Modules

- `summary`: short and detailed summaries, important topics, formulae, interview questions
- `rag`: retrieval-augmented tutoring over uploaded notes
- `embeddings`: text chunk vector generation
- `chat`: general tutor chat with RAG-first routing
- `quiz`: quiz generation
- `flashcards`: flashcard generation
- `studyplan`: daily exam preparation timetables
- `prompts`: prompt templates shared by the backend services

The Express server currently owns the runnable AI service code under `server/src/services/ai`. This folder is reserved for deeper LangChain chains, prompt templates, evaluation scripts, and deployment notes as the AI layer grows.

