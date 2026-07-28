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
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-75"
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
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-soft">
        <Search size={18} className="text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none placeholder:text-slate-400"
          placeholder="Search PDFs, flashcards, chats, and notes"
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-slate-500">Loading your library...</p>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-red-600">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">Failed to retrieve documents. Please check server status.</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Inbox size={24} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">No documents found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {searchTerm ? "No documents match your search query." : "Upload a PDF, DOCX, TXT, or Markdown note to get started explaining concepts, generating flashcards, and taking practice quizzes."}
          </p>
          {!searchTerm && (
            <button
              onClick={handleUploadClick}
              className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FileUp size={16} />
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
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand">
                    <FileText size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-800" title={doc.title}>
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 uppercase font-semibold">
                      {doc.type} File • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(doc._id)}
                    disabled={deleteMutation.isPending}
                    className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-coral transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sparkles size={14} className="text-coral" /> Ready for AI tutor
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSummarize(doc)}
                    className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Summarize
                  </button>
                  <button
                    onClick={() => navigate(`/quiz?documentId=${doc._id}`)}
                    className="focus-ring rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-6 backdrop-blur-sm" onClick={() => setSummaryDoc(null)}>
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl transition-all animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-800 text-lg">AI Document Summary</h3>
                <p className="truncate text-xs text-slate-400 font-semibold">{summaryDoc.title}</p>
              </div>
              <button
                onClick={() => setSummaryDoc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {summaryLoading ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <p className="text-sm font-medium text-slate-500">Gemini is reading and summarizing your notes...</p>
                </div>
              ) : (
                <article className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                  <ReactMarkdown>{summaryText}</ReactMarkdown>
                </article>
              )}
            </div>

            {!summaryLoading && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 rounded-b-xl">
                <button
                  onClick={handleCopySummary}
                  disabled={!summaryText}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-mint" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy to Clipboard
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setSummaryDoc(null)}
                  className="focus-ring rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
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
