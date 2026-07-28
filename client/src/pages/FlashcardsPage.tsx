import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotebookTabs, Loader2, Sparkles, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

interface DocumentItem {
  _id: string;
  title: string;
}

interface FlashcardItem {
  _id: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export function FlashcardsPage() {
  const queryClient = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState("");
  const [count, setCount] = useState(10);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [genError, setGenError] = useState<string | null>(null);

  // Fetch documents for the select dropdown
  const { data: documents = [] } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get("/documents");
      return res.data.documents;
    }
  });

  // Fetch existing saved flashcards
  const { data: flashcards = [], isLoading, isError } = useQuery<FlashcardItem[]>({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const res = await api.get("/ai/flashcards");
      return res.data.flashcards;
    }
  });

  // Flashcards generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenError(null);
      if (!selectedDocId) throw new Error("Please select a document.");
      const res = await api.post("/ai/flashcards", {
        documentId: selectedDocId,
        count
      });
      return res.data.flashcards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      setFlippedCards({});
    },
    onError: (err: any) => {
      setGenError(err.response?.data?.message ?? err.message ?? "Failed to generate flashcards.");
    }
  });

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;
    generateMutation.mutate();
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "hard":
        return "bg-coral/10 text-coral border-coral/20";
      case "medium":
      default:
        return "bg-blue-50 text-brand border-blue-100";
    }
  };

  return (
    <>
      <PageHeader eyebrow="Flashcards" title="Practice active recall" />

      {/* Control panel for generation */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink flex items-center gap-2">
          <Sparkles size={18} className="text-coral" /> Create Study Flashcards
        </h2>
        <form onSubmit={handleGenerate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
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

          <div className="w-full sm:w-32">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Card Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value={5}>5 Cards</option>
              <option value={10}>10 Cards</option>
              <option value={15}>15 Cards</option>
              <option value={20}>20 Cards</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedDocId || generateMutation.isPending}
            className="focus-ring flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-75"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cards"
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

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-slate-500">Loading flashcards...</p>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-red-600">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">Failed to retrieve flashcards. Try again.</p>
        </div>
      ) : flashcards.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Layers size={24} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">No flashcards found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Select one of your uploaded documents above to generate customized, AI-powered active recall cards.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {flashcards.map((card) => {
            const isFlipped = !!flippedCards[card._id];
            return (
              <div
                key={card._id}
                onClick={() => toggleFlip(card._id)}
                className="group min-h-52 cursor-pointer flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-soft transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <span className={`rounded-md border px-2 py-0.75 text-xxs font-bold uppercase tracking-wider ${getDifficultyColor(card.difficulty)}`}>
                    {card.difficulty}
                  </span>
                  
                  <span className="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-xxs uppercase tracking-wider font-semibold">
                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                    Flip Card
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center py-6 text-center">
                  {isFlipped ? (
                    <p className="text-sm text-slate-700 leading-relaxed font-medium animate-fade-in">
                      {card.answer}
                    </p>
                  ) : (
                    <h2 className="text-base font-bold text-ink leading-snug">
                      {card.question}
                    </h2>
                  )}
                </div>

                <div className="text-center border-t border-slate-50 pt-3">
                  <p className="text-xxs font-semibold text-slate-400 uppercase tracking-widest">
                    {isFlipped ? "Showing Answer" : "Tap Card to Reveal Answer"}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
