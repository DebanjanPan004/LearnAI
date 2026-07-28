import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { CalendarDays, Loader2, AlertCircle, Sparkles, Check } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

const initialPlan = `
### Daily Timetable

Submit the form on the left to generate your custom AI exam preparation timetable!

Gemini will split your subjects, allocate rest days, and optimize study patterns.
`;

export function PlannerPage() {
  const [exam, setExam] = useState("");
  const [days, setDays] = useState(30);
  const [subjectsString, setSubjectsString] = useState("");
  const [scheduleMarkdown, setScheduleMarkdown] = useState(initialPlan);
  const [formError, setFormError] = useState<string | null>(null);

  // Study plan generation mutation
  const plannerMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      const subjects = subjectsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (subjects.length === 0) {
        throw new Error("Please specify at least one subject.");
      }

      const res = await api.post("/ai/studyplan", {
        exam,
        days,
        subjects
      });
      
      // Res contains the result object. The returned string from askGemini is in res.data.text
      return res.data.text as string;
    },
    onSuccess: (data) => {
      setScheduleMarkdown(data);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message ?? err.message ?? "Failed to generate study plan.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !days || !subjectsString) return;
    plannerMutation.mutate();
  };

  return (
    <>
      <PageHeader eyebrow="Study planner" title="Build a daily exam timetable" />
      
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Form input panel */}
        <div style={{ background: "rgba(22,51,39,0.45)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "8px", padding: "24px", backdropFilter: "blur(4px)", height: "fit-content" }}>
          <h2 style={{ marginBottom: "16px", fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={18} style={{ color: "#c9a227" }} /> Plan Your Exam Prep
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)", marginBottom: "8px" }}>Target Exam Name</label>
              <input
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                style={{ width: "100%", background: "rgba(31,69,54,0.35)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "4px", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", outline: "none" }}
                placeholder="Gate CS, Semester Finals, Tech Interview"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)", marginBottom: "8px" }}>Days Available</label>
              <input
                type="number" value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{ width: "100%", background: "rgba(31,69,54,0.35)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "4px", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", outline: "none" }}
                min={1} required
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)", marginBottom: "8px" }}>Subjects (comma-separated)</label>
              <textarea
                value={subjectsString}
                onChange={(e) => setSubjectsString(e.target.value)}
                style={{ width: "100%", height: "100px", background: "rgba(31,69,54,0.35)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "4px", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f2e8d5", outline: "none", resize: "vertical" }}
                placeholder="DBMS, Operating Systems, Data Structures, Computer Networks"
                required
              />
            </div>

            <button
              type="submit"
              disabled={plannerMutation.isPending}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #6b1f2a, #4a151d)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "4px", padding: "12px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f2e8d5", cursor: plannerMutation.isPending ? "not-allowed" : "pointer", opacity: plannerMutation.isPending ? 0.7 : 1 }}
            >
              {plannerMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><CalendarDays size={15} /> Generate Timetable</>}
            </button>
          </form>

          {formError && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(107,31,42,0.12)", border: "1px solid rgba(107,31,42,0.35)", borderRadius: "4px", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(107,31,42,0.9)" }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{formError}</span>
            </div>
          )}
        </div>

        {/* Timetable schedule panel */}
        <div style={{ background: "rgba(10,23,18,0.5)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "8px", padding: "24px", backdropFilter: "blur(4px)", minHeight: "500px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ marginBottom: "4px", fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "#c9a227" }} /> Your Study Timetable
          </h2>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)", margin: "10px 0 16px" }} />

          <div style={{ flex: 1, overflowY: "auto", maxHeight: "600px", paddingRight: "4px" }}>
            {plannerMutation.isPending ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin" style={{ color: "#c9a227" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(231,199,102,0.6)" }}>Gemini is crafting your timetable…</p>
              </div>
            ) : (
              <article className="prose prose-sm max-w-none leading-relaxed" style={{ color: "rgba(242,232,213,0.85)" }}>
                <ReactMarkdown>{scheduleMarkdown}</ReactMarkdown>
              </article>
            )}
          </div>

          {!plannerMutation.isPending && plannerMutation.isSuccess && (
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", background: "rgba(31,69,54,0.4)", border: "1px solid rgba(31,69,54,0.6)", borderRadius: "4px", padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(163,217,177,0.9)" }}>
              <Check size={15} style={{ color: "#a3d9b1" }} />
              Plan generated! Copy these items to your calendar.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
