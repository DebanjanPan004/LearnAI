import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, Library, FileText } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  sources?: string[];
}

interface DocumentItem {
  _id: string;
  title: string;
  type: string;
}

const sidebarPanel: React.CSSProperties = {
  background: "rgba(22,51,39,0.6)",
  border: "1px solid rgba(201,162,39,0.2)",
  borderRadius: "8px",
  padding: "20px",
  backdropFilter: "blur(4px)",
  height: "72vh",
  display: "flex",
  flexDirection: "column",
};

const chatPanel: React.CSSProperties = {
  background: "rgba(10,23,18,0.55)",
  border: "1px solid rgba(201,162,39,0.2)",
  borderRadius: "8px",
  backdropFilter: "blur(4px)",
  height: "72vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your AI study assistant. Ask me anything about your uploaded notes, slides, or documents, and I'll fetch context directly from your library to explain the concepts!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: documents = [], isLoading: sidebarLoading } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => (await api.get("/documents")).data.documents,
  });

  const chatMutation = useMutation({
    mutationFn: async (askText: string) => (await api.post("/ai/chat", { question: askText })).data,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "model", text: data.text, sources: data.sources }]);
    },
    onError: (err: any) => {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`, role: "model",
        text: `⚠️ **Failed to connect:** ${err.response?.data?.message ?? "Server error. Please check if the backend is running."}`,
      }]);
    },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = question.trim();
    if (!clean || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text: clean }]);
    setQuestion("");
    chatMutation.mutate(clean);
  };

  return (
    <>
      <PageHeader eyebrow="AI Tutor" title="Ask from your uploaded notes" />

      <section className="grid min-h-[72vh] gap-5 xl:grid-cols-[0.8fr_2.2fr]">

        {/* ── Library Sidebar ── */}
        <div style={sidebarPanel}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "18px", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Library size={17} style={{ color: "#c9a227" }} /> Study Library
          </h2>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)", margin: "10px 0 14px" }} />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sidebarLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 size={20} className="animate-spin" style={{ color: "#c9a227" }} />
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(231,199,102,0.4)", lineHeight: 1.6 }}>
                <p>No documents uploaded yet.</p>
                <p style={{ marginTop: "6px" }}>Go to <strong>Documents</strong> to upload and enable active retrieval.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 10px", borderRadius: "4px",
                  border: "1px solid rgba(201,162,39,0.12)",
                  background: "rgba(0,0,0,0.2)",
                  fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(242,232,213,0.7)",
                }}>
                  <FileText size={13} style={{ color: "#c9a227", flexShrink: 0 }} />
                  <span className="truncate" title={doc.title}>{doc.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        <div style={chatPanel}>

          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.role === "model";
              return (
                <div key={msg.id} style={{ display: "flex", gap: "12px", maxWidth: "85%", marginLeft: isAi ? 0 : "auto", flexDirection: isAi ? "row" : "row-reverse" }}>
                  {/* Avatar */}
                  <span style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: isAi ? "rgba(31,69,54,0.8)" : "linear-gradient(135deg, #6b1f2a, #4a151d)",
                    border: `1px solid ${isAi ? "rgba(201,162,39,0.3)" : "rgba(201,162,39,0.4)"}`,
                  }}>
                    {isAi ? <Sparkles size={15} color="#c9a227" /> : <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#e7c766" }}>U</span>}
                  </span>

                  {/* Bubble */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: isAi ? "0 12px 12px 12px" : "12px 0 12px 12px",
                      background: isAi ? "rgba(31,69,54,0.5)" : "rgba(107,31,42,0.6)",
                      border: `1px solid ${isAi ? "rgba(201,162,39,0.18)" : "rgba(231,199,102,0.2)"}`,
                      fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.7,
                      color: isAi ? "#f2e8d5" : "#f2e8d5",
                    }}>
                      <article className="prose prose-sm max-w-none" style={{ color: "inherit" }}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </article>
                    </div>

                    {/* Sources */}
                    {isAi && msg.sources && msg.sources.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(201,162,39,0.5)", marginRight: "4px", alignSelf: "center" }}>
                          Sources:
                        </span>
                        {msg.sources.map((src) => (
                          <span key={src} style={{
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            padding: "2px 8px", borderRadius: "2px",
                            background: "rgba(22,51,39,0.7)", border: "1px solid rgba(201,162,39,0.2)",
                            fontFamily: "var(--font-mono)", fontSize: "9px", color: "#e7c766",
                          }}>
                            <FileText size={9} /> {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {chatMutation.isPending && (
              <div style={{ display: "flex", gap: "12px", maxWidth: "80%", alignItems: "center" }} className="animate-pulse">
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(31,69,54,0.8)", border: "1px solid rgba(201,162,39,0.3)", flexShrink: 0 }}>
                  <Sparkles size={15} color="#c9a227" />
                </span>
                <div style={{ padding: "12px 16px", borderRadius: "0 12px 12px 12px", background: "rgba(31,69,54,0.5)", border: "1px solid rgba(201,162,39,0.18)", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(231,199,102,0.6)" }}>
                  <Loader2 size={15} className="animate-spin" style={{ color: "#c9a227" }} />
                  Searching your library…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input dock */}
          <div style={{ borderTop: "1px solid rgba(201,162,39,0.15)", padding: "14px 16px", background: "rgba(10,23,18,0.5)" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={chatMutation.isPending}
                style={{
                  flex: 1, minWidth: 0,
                  background: "rgba(31,69,54,0.3)",
                  border: "1px solid rgba(201,162,39,0.2)",
                  borderRadius: "4px",
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)", fontSize: "14px",
                  color: "#f2e8d5", outline: "none",
                }}
                placeholder="Ask a question from your documents…"
                onFocus={e => (e.target.style.borderColor = "rgba(201,162,39,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(201,162,39,0.2)")}
              />
              <button
                type="submit"
                disabled={!question.trim() || chatMutation.isPending}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "44px", height: "44px", borderRadius: "4px",
                  background: "linear-gradient(135deg, #6b1f2a, #4a151d)",
                  border: "1px solid rgba(201,162,39,0.3)",
                  cursor: question.trim() && !chatMutation.isPending ? "pointer" : "not-allowed",
                  opacity: !question.trim() || chatMutation.isPending ? 0.5 : 1,
                  flexShrink: 0,
                }}
                aria-label="Send"
              >
                <Send size={17} color="#e7c766" />
              </button>
            </form>
          </div>
        </div>

      </section>
    </>
  );
}
