import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, MessageSquare, Library, FileText, AlertCircle } from "lucide-react";
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

export function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your AI study assistant. Ask me anything about your uploaded notes, slides, or documents, and I'll fetch context directly from your library to explain the concepts!"
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch actual uploaded documents to list in the sources sidebar
  const { data: documents = [], isLoading: sidebarLoading } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get("/documents");
      return res.data.documents;
    }
  });

  // Tutor chat mutation
  const chatMutation = useMutation({
    mutationFn: async (askText: string) => {
      const res = await api.post("/ai/chat", { question: askText });
      return res.data; // returns { text: string, sources: string[] }
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "model",
          text: data.text,
          sources: data.sources
        }
      ]);
    },
    onError: (err: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `⚠️ **Failed to connect:** ${err.response?.data?.message ?? "I ran into a server error. Please check if the backend is running."}`
        }
      ]);
    }
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || chatMutation.isPending) return;

    // Append user question
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: cleanQuestion
      }
    ]);
    
    setQuestion("");
    chatMutation.mutate(cleanQuestion);
  };

  return (
    <>
      <PageHeader eyebrow="AI Tutor" title="Ask from your uploaded notes" />
      
      <section className="grid min-h-[72vh] gap-5 xl:grid-cols-[0.8fr_2.2fr]">
        
        {/* Left sidebar: Indexed library status */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-soft h-[72vh]">
          <h2 className="font-bold text-ink flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-4">
            <Library size={18} className="text-brand" /> Study Library Context
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {sidebarLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 leading-relaxed">
                <p>No documents uploaded yet.</p>
                <p className="mt-1">Go to **Documents** to upload and enable active retrieval.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-700">
                  <FileText size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate font-semibold" title={doc.title}>{doc.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right terminal: Conversational Stream */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-soft h-[72vh] overflow-hidden">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isAi = msg.role === "model";
              return (
                <div key={msg.id} className={`flex gap-3.5 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  {/* Avatar */}
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                    isAi ? "bg-blue-100 text-brand" : "bg-brand text-white"
                  }`}>
                    {isAi ? <Sparkles size={16} /> : "U"}
                  </span>

                  {/* Message Bubble */}
                  <div className="space-y-2">
                    <div className={`rounded-2xl px-4 py-3.5 text-sm shadow-soft leading-relaxed ${
                      isAi 
                        ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none" 
                        : "bg-brand text-white rounded-tr-none font-medium"
                    }`}>
                      <article className="prose prose-sm max-w-none text-inherit">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </article>
                    </div>

                    {/* Sources reference panel */}
                    {isAi && msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pl-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">RAG Sources:</span>
                        {msg.sources.map((src) => (
                          <span
                            key={src}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-2 py-0.75 text-[10px] font-bold text-slate-600 shadow-soft"
                          >
                            <FileText size={10} className="text-slate-400" />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader Indicator */}
            {chatMutation.isPending && (
              <div className="flex gap-3.5 max-w-[80%] mr-auto items-center animate-pulse">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-brand text-sm shadow-sm">
                  <Sparkles size={16} />
                </span>
                <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-4.5 py-3 text-sm text-slate-500 shadow-soft flex items-center gap-1.5 font-medium">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-brand" />
                  Thinking and searching documents...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input dock */}
          <div className="border-t border-slate-150 p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={chatMutation.isPending}
                className="focus-ring flex-1 min-w-0 rounded-lg border border-slate-200 px-4.5 py-3 text-sm placeholder:text-slate-400"
                placeholder="Ask me a question (e.g. Explain Normalization in DBMS, or summarize process states)"
              />
              <button
                type="submit"
                disabled={!question.trim() || chatMutation.isPending}
                className="focus-ring inline-flex h-11.5 w-11.5 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </section>
    </>
  );
}
