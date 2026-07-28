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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft h-fit">
          <h2 className="mb-4 text-base font-bold text-ink flex items-center gap-2">
            <CalendarDays size={18} className="text-brand" /> Plan Your Exam Prep
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Exam Name</label>
              <input
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="Gate CS, Semester Finals, Tech Interview"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Available</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                min={1}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects to Cover (comma-separated)</label>
              <textarea
                value={subjectsString}
                onChange={(e) => setSubjectsString(e.target.value)}
                className="focus-ring mt-1.5 h-28 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="DBMS, Operating Systems, Data Structures, Computer Networks"
                required
              />
            </div>

            <button
              type="submit"
              disabled={plannerMutation.isPending}
              className="focus-ring w-full flex items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-75"
            >
              {plannerMutation.isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Generating Timetable...
                </>
              ) : (
                <>
                  <CalendarDays size={18} />
                  Generate Timetable
                </>
              )}
            </button>
          </form>

          {formError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </div>

        {/* Timetable schedule panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft min-h-[500px] flex flex-col">
          <h2 className="mb-4 text-base font-bold text-ink flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles size={18} className="text-coral" /> Customized Study Timetable
          </h2>
          
          <div className="flex-1 overflow-y-auto max-h-[600px] pr-1">
            {plannerMutation.isPending ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-sm font-medium text-slate-500">Gemini is designing your exam study timetable...</p>
              </div>
            ) : (
              <article className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                <ReactMarkdown>{scheduleMarkdown}</ReactMarkdown>
              </article>
            )}
          </div>

          {!plannerMutation.isPending && plannerMutation.isSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
              <Check size={16} className="text-emerald-600" />
              Plan successfully generated! Feel free to copy these items to your calendar.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
