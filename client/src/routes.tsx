import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { FlashcardsPage } from "./pages/FlashcardsPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ProgressPage } from "./pages/ProgressPage";
import { QuizPage } from "./pages/QuizPage";

export const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "flashcards", element: <FlashcardsPage /> },
      { path: "quiz", element: <QuizPage /> },
      { path: "planner", element: <PlannerPage /> },
      { path: "progress", element: <ProgressPage /> }
    ]
  }
]);

