import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FileUp, Search, Sparkles, Trash2, Loader2, FileText, AlertCircle, Inbox, X, Copy, Check } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

interface DocumentItem {
  _id: string;
  title: string;
  type: string;
  createdAt: string;
}

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Summary Modal state
  const [summaryDoc, setSummaryDoc] = useState<DocumentItem | null>(null);
  const [summaryText, setSummaryText] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSummarize = async (doc: DocumentItem) => {
    setSummaryDoc(doc);
    setSummaryLoading(true);
    setSummaryText("");
    setCopied(false);
    try {
      const res = await api.post("/ai/summary", { documentId: doc._id });
      setSummaryText(res.data.text || "No summary returned.");
    } catch (err: any) {
      setSummaryText(err.response?.data?.message ?? "Failed to generate summary. Please check your Gemini API key.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch documents list
  const { data: documents = [], isLoading, isError } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get("/documents");
      return res.data.documents;
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadError(null);
      const res = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message ?? "Failed to upload document. Please verify the file format (PDF, DOCX, TXT, MD) and size (< 25MB).");
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message ?? "Failed to delete document.");
    }
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    uploadMutation.mutate(formData);

    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document? This will also remove all generated study guides and quiz data associated with it.")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter documents by search term
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Upload notes and turn them into study fuel"
        action={
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.txt,.md,.markdown"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #6b1f2a, #4a151d)",
                border: "1px solid rgba(201,162,39,0.4)",
                borderRadius: "4px", padding: "9px 18px",
                fontFamily: "var(--font-mono)", fontSize: "11px",
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#f2e8d5", cursor: uploadMutation.isPending ? "not-allowed" : "pointer",
                opacity: uploadMutation.isPending ? 0.7 : 1,
              }}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp size={18} />
                  Upload
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Error alert */}
      {uploadError && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(107,31,42,0.12)", border: "1px solid rgba(107,31,42,0.35)", borderRadius: "4px", padding: "12px 14px", marginBottom: "20px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b1f2a" }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(22,51,39,0.4)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "6px", padding: "11px 14px", marginBottom: "24px", backdropFilter: "blur(4px)" }}>
        <Search size={17} style={{ color: "rgba(201,162,39,0.55)", flexShrink: 0 }} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5" }}
          placeholder="Search your manuscript library…"
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "#c9a227" }} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)" }}>Opening your library…</p>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3" style={{ color: "rgba(107,31,42,0.8)" }}>
          <AlertCircle size={32} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Failed to retrieve documents. Please check server status.</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(201,162,39,0.25)", borderRadius: "8px", background: "rgba(31,69,54,0.2)", padding: "60px 24px", textAlign: "center" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.25)" }}>
            <Inbox size={22} style={{ color: "rgba(201,162,39,0.6)" }} />
          </span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#e7c766", margin: "16px 0 8px" }}>No manuscripts found</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(242,232,213,0.55)", maxWidth: "380px", lineHeight: 1.7 }}>
            {searchTerm ? "No documents match your search query." : "Upload a PDF, DOCX, TXT, or Markdown file to generate flashcards, quizzes, and AI summaries."}
          </p>
          {!searchTerm && (
            <button
              onClick={handleUploadClick}
              style={{ marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #6b1f2a, #4a151d)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "4px", padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f2e8d5", cursor: "pointer" }}
            >
              <FileUp size={15} />
              Upload first document
            </button>
          )}
        </div>
      ) : (
        // Documents list
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <article
              key={doc._id}
              className="group relative flex flex-col justify-between"
              style={{ background: "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)", borderRadius: "6px", padding: "20px", boxShadow: "0 20px 50px -15px rgba(0,0,0,.5), 0 0 0 1px rgba(201,162,39,.3)", color: "#241a10" }}
            >
              {/* inner ornament */}
              <span style={{ position: "absolute", inset: "8px", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "3px", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", flexShrink: 0, borderRadius: "6px", background: "rgba(107,31,42,0.12)", border: "1px solid rgba(107,31,42,0.25)" }}>
                    <FileText size={19} style={{ color: "#6b1f2a" }} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate" style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "#241a10", margin: 0 }} title={doc.title}>
                      {doc.title}
                    </h2>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b5a3a", marginTop: "4px" }}>
                      {doc.type} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(doc._id)}
                    disabled={deleteMutation.isPending}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(107,31,42,0.5)", padding: "4px" }}
                    title="Delete Document"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(201,162,39,0.2)", paddingTop: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b5a3a" }}>
                  <Sparkles size={12} style={{ color: "#c9a227" }} /> AI Ready
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleSummarize(doc)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "3px", border: "1px solid rgba(107,31,42,0.3)", background: "transparent", color: "#6b1f2a", cursor: "pointer" }}
                  >
                    Summarise
                  </button>
                  <button
                    onClick={() => navigate(`/quiz?documentId=${doc._id}`)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "3px", background: "linear-gradient(135deg, #6b1f2a, #4a151d)", border: "1px solid rgba(201,162,39,0.3)", color: "#f2e8d5", cursor: "pointer" }}
                  >
                    Practice Quiz
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Summary Modal overlay */}
      {summaryDoc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,23,18,0.75)", padding: "24px 16px", backdropFilter: "blur(6px)" }} onClick={() => setSummaryDoc(null)}>
          <div
            style={{ display: "flex", flexDirection: "column", maxHeight: "85vh", width: "100%", maxWidth: "680px", background: "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)", borderRadius: "6px", boxShadow: "0 50px 90px -25px rgba(0,0,0,.8), 0 0 0 1px rgba(201,162,39,.4)", color: "#241a10", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ position: "absolute", inset: "8px", border: "1px solid rgba(201,162,39,0.25)", borderRadius: "3px", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(201,162,39,0.2)" }}>
              <div className="min-w-0">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", margin: 0, color: "#241a10" }}>AI Document Summary</h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b5a3a", margin: "3px 0 0" }} className="truncate">{summaryDoc.title}</p>
              </div>
              <button onClick={() => setSummaryDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(107,31,42,0.5)", padding: "4px" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {summaryLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: "#6b1f2a" }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b5a3a" }}>Gemini is summarising your notes…</p>
                </div>
              ) : (
                <article className="prose prose-sm max-w-none leading-relaxed" style={{ color: "#241a10" }}>
                  <ReactMarkdown>{summaryText}</ReactMarkdown>
                </article>
              )}
            </div>

            {!summaryLoading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(201,162,39,0.2)", padding: "12px 24px", background: "rgba(0,0,0,0.05)", borderRadius: "0 0 6px 6px" }}>
                <button
                  onClick={handleCopySummary}
                  disabled={!summaryText}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 12px", border: "1px solid rgba(107,31,42,0.3)", borderRadius: "3px", background: "transparent", color: "#6b1f2a", cursor: "pointer" }}
                >
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
                <button
                  onClick={() => setSummaryDoc(null)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", background: "linear-gradient(135deg, #6b1f2a, #4a151d)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: "3px", color: "#f2e8d5", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
