# LearnAI API

Base URL: `/api`

## Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/forgot-password` | Request reset link |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/verify-email` | Verify email token |

## Documents

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/documents/upload` | Upload PDF, DOCX, TXT, or Markdown |
| GET | `/documents` | List user documents |
| DELETE | `/documents/:id` | Delete document |

## AI

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/ai/summary` | Generate summary |
| POST | `/ai/chat` | Ask tutor with RAG context |
| POST | `/ai/flashcards` | Generate flashcards |
| POST | `/ai/quiz` | Generate quiz |
| POST | `/ai/studyplan` | Generate study plan |

## Progress

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/progress` | Read progress |
| POST | `/progress` | Update progress |

