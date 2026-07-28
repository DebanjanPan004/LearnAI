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

  const getDifficultyColor = (diff: string): React.CSSProperties => {
    switch (diff) {
      case "easy":
        return { background: "rgba(31,69,54,0.6)", color: "#a3d9b1", border: "1px solid rgba(31,69,54,0.6)" };
      case "hard":
        return { background: "rgba(107,31,42,0.5)", color: "#f2a0ad", border: "1px solid rgba(107,31,42,0.5)" };
      case "medium":
      default:
        return { background: "rgba(201,162,39,0.2)", color: "#e7c766", border: "1px solid rgba(201,162,39,0.35)" };
    }
  };

  return (
    <>
      <PageHeader eyebrow="Flashcards" title="Practice active recall" />

      {/* Control panel for generation */}
      <section style={{ marginBottom: "28px", background: "rgba(22,51,39,0.45)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "8px", padding: "24px", backdropFilter: "blur(4px)" }}>
        <h2 style={{ marginBottom: "16px", fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} style={{ color: "#c9a227" }} /> Create Flashcards
        </h2>
        <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "14px" }} className="sm:flex-row sm:items-end">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)", marginBottom: "8px" }}>Select Study Document</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              required
              style={{ width: "100%", background: "rgba(31,69,54,0.4)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "4px", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", outline: "none" }}
            >
              <option value="" style={{ background: "#163327" }}>-- Choose a document --</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id} style={{ background: "#163327" }}>{doc.title}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "120px" }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)", marginBottom: "8px" }}>Card Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: "100%", background: "rgba(31,69,54,0.4)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "4px", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", outline: "none" }}
            >
              <option value={5} style={{ background: "#163327" }}>5 Cards</option>
              <option value={10} style={{ background: "#163327" }}>10 Cards</option>
              <option value={15} style={{ background: "#163327" }}>15 Cards</option>
              <option value={20} style={{ background: "#163327" }}>20 Cards</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedDocId || generateMutation.isPending}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #6b1f2a, #4a151d)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "4px", padding: "10px 22px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f2e8d5", cursor: !selectedDocId || generateMutation.isPending ? "not-allowed" : "pointer", opacity: !selectedDocId || generateMutation.isPending ? 0.65 : 1 }}
          >
            {generateMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : "Generate Cards"}
          </button>
        </form>

        {genError && (
          <div style={{ marginTop: "14px", display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(107,31,42,0.12)", border: "1px solid rgba(107,31,42,0.35)", borderRadius: "4px", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b1f2a" }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{genError}</span>
          </div>
        )}
      </section>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "#c9a227" }} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)" }}>Loading flashcards…</p>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3" style={{ color: "rgba(107,31,42,0.8)" }}>
          <AlertCircle size={32} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Failed to retrieve flashcards. Try again.</p>
        </div>
      ) : flashcards.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(201,162,39,0.25)", borderRadius: "8px", background: "rgba(31,69,54,0.2)", padding: "60px 24px", textAlign: "center" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.25)" }}>
            <Layers size={22} style={{ color: "rgba(201,162,39,0.6)" }} />
          </span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#e7c766", margin: "16px 0 8px" }}>No flashcards yet</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(242,232,213,0.55)", maxWidth: "380px", lineHeight: 1.7 }}>
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
                className="group"
                style={{
                  minHeight: "220px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  background: isFlipped
                    ? "linear-gradient(160deg, #1f4536 0%, #163327 100%)"
                    : "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)",
                  borderRadius: "6px",
                  boxShadow: isFlipped
                    ? "0 20px 50px -15px rgba(0,0,0,.5), 0 0 0 1px rgba(201,162,39,.25)"
                    : "0 20px 50px -15px rgba(0,0,0,.5), 0 0 0 1px rgba(201,162,39,.3)",
                  padding: "20px",
                  transition: "background 400ms ease, box-shadow 300ms ease",
                  position: "relative",
                  color: isFlipped ? "#f2e8d5" : "#241a10",
                }}
              >
                <span style={{ position: "absolute", inset: "8px", border: `1px solid ${isFlipped ? "rgba(201,162,39,0.2)" : "rgba(201,162,39,0.25)"}`, borderRadius: "3px", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${isFlipped ? "rgba(201,162,39,0.15)" : "rgba(201,162,39,0.2)"}`, paddingBottom: "10px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px", padding: "2px 8px", ...getDifficultyColor(card.difficulty) }}>
                    {card.difficulty}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: isFlipped ? "rgba(231,199,102,0.5)" : "rgba(107,31,42,0.5)" }}>
                    <RefreshCw size={11} className="group-hover:rotate-180 transition-transform duration-500" />
                    Flip
                  </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", textAlign: "center" }}>
                  {isFlipped ? (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", lineHeight: 1.7 }}>
                      {card.answer}
                    </p>
                  ) : (
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "17px", color: "#241a10", lineHeight: 1.4 }}>
                      {card.question}
                    </h2>
                  )}
                </div>

                <div style={{ textAlign: "center", borderTop: `1px solid ${isFlipped ? "rgba(201,162,39,0.15)" : "rgba(201,162,39,0.2)"}`, paddingTop: "10px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: isFlipped ? "rgba(231,199,102,0.4)" : "rgba(107,31,42,0.4)" }}>
                    {isFlipped ? "Showing Answer" : "Tap to Reveal Answer"}
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
