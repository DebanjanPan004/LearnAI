import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Brain, Loader2, Sparkles, AlertCircle, HelpCircle, Trophy, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

interface DocumentItem {
  _id: string;
  title: string;
}

interface QuestionItem {
  prompt: string;
  type: "mcq" | "true_false" | "fill_blank" | "short_answer";
  options: string[];
  answer: string;
}

interface QuizItem {
  _id: string;
  title: string;
  questions: QuestionItem[];
  score?: number;
  createdAt: string;
}

export function QuizPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const docParam = searchParams.get("documentId");

  const [selectedDocId, setSelectedDocId] = useState("");
  const [count, setCount] = useState(5);
  const [genError, setGenError] = useState<string | null>(null);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Set default selected document ID from query parameter if present
  useEffect(() => {
    if (docParam) {
      setSelectedDocId(docParam);
    }
  }, [docParam]);

  // Fetch documents for the select dropdown
  const { data: documents = [] } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get("/documents");
      return res.data.documents;
    }
  });

  // Fetch historical quizzes
  const { data: quizzes = [], isLoading, isError } = useQuery<QuizItem[]>({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const res = await api.get("/ai/quizzes");
      return res.data.quizzes;
    }
  });

  // Quiz generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenError(null);
      if (!selectedDocId) throw new Error("Please select a document.");
      const res = await api.post("/ai/quiz", {
        documentId: selectedDocId,
        count
      });
      return res.data.quiz as QuizItem;
    },
    onSuccess: (newQuiz) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      startQuiz(newQuiz);
    },
    onError: (err: any) => {
      setGenError(err.response?.data?.message ?? err.message ?? "Failed to generate quiz.");
    }
  });

  // Submit score mutation
  const scoreMutation = useMutation({
    mutationFn: async ({ id, score }: { id: string; score: number }) => {
      const res = await api.post(`/ai/quizzes/${id}/score`, { score });
      return res.data.quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    }
  });

  const startQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setFinalScore(null);
  };

  const handleAnswerSelect = (index: number, answerValue: string) => {
    if (quizFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [index]: answerValue
    }));
  };

  const calculateQuizScore = () => {
    if (!activeQuiz) return;
    let correct = 0;
    
    activeQuiz.questions.forEach((q, idx) => {
      const uAns = (userAnswers[idx] || "").trim().toLowerCase();
      const cAns = q.answer.trim().toLowerCase();
      
      if (q.type === "mcq" || q.type === "true_false") {
        if (uAns === cAns) correct++;
      } else if (q.type === "fill_blank") {
        // Simple fuzzy match for text blanks
        if (uAns === cAns || cAns.includes(uAns) && uAns.length > 1) correct++;
      } else {
        // Short answers: automatically counted as correct if they typed anything (feedback given textually)
        if (uAns.length > 5) correct++;
      }
    });

    const percentage = Math.round((correct / activeQuiz.questions.length) * 100);
    setFinalScore(percentage);
    setQuizFinished(true);

    // Save to server
    scoreMutation.mutate({ id: activeQuiz._id, score: percentage });
  };

  const handleFinish = () => {
    setActiveQuiz(null);
    setQuizFinished(false);
    setUserAnswers({});
  };

  return (
    <>
      <PageHeader eyebrow="Quizzes" title="Practice and evaluate your knowledge" />

      {/* QUIZ PLAYER INTERFACE (if quiz is active) */}
      {activeQuiz ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-ink">{activeQuiz.title}</h2>
              <p className="text-xs text-slate-500">
                {quizFinished ? "Results Summary" : `Question ${currentQuestionIndex + 1} of ${activeQuiz.questions.length}`}
              </p>
            </div>
            
            {quizFinished && (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <Trophy size={16} /> Score: {finalScore}%
              </span>
            )}
          </div>

          {!quizFinished ? (
            // Quiz Attempting Mode
            <div className="space-y-6">
              {/* Question prompt */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Question</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  {activeQuiz.questions[currentQuestionIndex].prompt}
                </h3>
              </div>

              {/* Input selectors depending on question type */}
              <div className="space-y-3">
                {activeQuiz.questions[currentQuestionIndex].type === "mcq" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeQuiz.questions[currentQuestionIndex].options.map((opt) => {
                      const isSelected = userAnswers[currentQuestionIndex] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswerSelect(currentQuestionIndex, opt)}
                          className={`focus-ring w-full rounded-lg border p-4.5 text-left text-sm font-medium transition ${
                            isSelected
                              ? "border-brand bg-blue-50 text-brand shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeQuiz.questions[currentQuestionIndex].type === "true_false" && (
                  <div className="flex gap-4">
                    {["True", "False"].map((opt) => {
                      const isSelected = userAnswers[currentQuestionIndex]?.toLowerCase() === opt.toLowerCase();
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswerSelect(currentQuestionIndex, opt.toLowerCase())}
                          className={`focus-ring flex-1 rounded-lg border py-4 text-center text-sm font-bold transition ${
                            isSelected
                              ? "border-brand bg-blue-50 text-brand"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(activeQuiz.questions[currentQuestionIndex].type === "fill_blank" || 
                  activeQuiz.questions[currentQuestionIndex].type === "short_answer") && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type Your Answer</label>
                    <textarea
                      value={userAnswers[currentQuestionIndex] || ""}
                      onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                      rows={4}
                      className="focus-ring mt-2 w-full rounded-lg border border-slate-200 p-3.5 text-sm"
                      placeholder={
                        activeQuiz.questions[currentQuestionIndex].type === "fill_blank"
                          ? "Type the missing word..."
                          : "Provide your conceptual explanation here..."
                      }
                    />
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="focus-ring rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="focus-ring rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={calculateQuizScore}
                    className="focus-ring rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Quiz Review Mode (Finished)
            <div className="space-y-6">
              <div className="space-y-5">
                {activeQuiz.questions.map((q, idx) => {
                  const uAns = userAnswers[idx] || "";
                  const cAns = q.answer;
                  const isCorrect = uAns.trim().toLowerCase() === cAns.trim().toLowerCase() || q.type === "short_answer" && uAns.length > 5;

                  return (
                    <div key={idx} className="rounded-lg border border-slate-100 p-4.5 bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.prompt}</h4>
                        {q.type !== "short_answer" ? (
                          isCorrect ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                              <CheckCircle2 size={16} /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-coral text-xs font-bold">
                              <XCircle size={16} /> Incorrect
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs font-bold uppercase">Self Review</span>
                        )}
                      </div>

                      <div className="mt-3.5 space-y-1 text-xs">
                        <p className="text-slate-600">
                          <strong>Your Answer:</strong> <span className={isCorrect ? "text-emerald-700" : "text-coral font-medium"}>{uAns || "(No answer provided)"}</span>
                        </p>
                        <p className="text-slate-700">
                          <strong>Correct Answer:</strong> <span className="font-semibold text-slate-800">{cAns}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="focus-ring rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        // LIST & FORM INTERFACE
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Generation panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft h-fit">
            <h2 className="mb-4 text-base font-bold text-ink flex items-center gap-2">
              <Sparkles size={18} className="text-coral" /> Generate Practice Quiz
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Study Document</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  required
                >
                  <option value="">-- Choose a document --</option>
                  {documents.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Count</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedDocId || generateMutation.isPending}
                className="focus-ring w-full flex items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-75"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Practice Quiz"
                )}
              </button>
            </form>

            {genError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
                <span>{genError}</span>
              </div>
            )}
          </section>

          {/* Historical quizzes list */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-base font-bold text-ink flex items-center gap-2">
              <HelpCircle size={18} className="text-brand" /> Your Quiz Practice History
            </h2>

            {isLoading ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-brand" />
                <p className="text-xs text-slate-500 font-medium">Retrieving quizzes...</p>
              </div>
            ) : isError ? (
              <p className="text-sm text-red-500 text-center py-6">Could not load quiz history. Please try again.</p>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Brain size={20} />
                </span>
                <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
                  You haven't generated any quizzes yet. Pick a document on the left to start testing your knowledge!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    onClick={() => startQuiz(quiz)}
                    className="group flex items-center justify-between p-4.5 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="truncate font-semibold text-slate-800 text-sm group-hover:text-brand transition-colors">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-3.5 mt-1.5 text-xxs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <HelpCircle size={12} /> {quiz.questions.length} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {quiz.score !== undefined ? (
                        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold text-center ${
                          quiz.score >= 80 
                            ? "bg-emerald-50 text-emerald-700" 
                            : quiz.score >= 50 
                              ? "bg-blue-50 text-brand" 
                              : "bg-coral/10 text-coral"
                        }`}>
                          Score: {quiz.score}%
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-slate-200 text-slate-600 px-2.5 py-1 text-xs font-bold">
                          Not Taken
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
