import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, HelpCircle } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

interface AccuracyItem {
  topic: string;
  score: number;
}

export function ProgressPage() {
  // Query progress statistics
  const { data: progressData, isLoading } = useQuery({
    queryKey: ["progress-metrics"],
    queryFn: async () => {
      const res = await api.get("/progress");
      return res.data;
    }
  });

  const accuracy = progressData?.accuracyBreakdown || [];

  return (
    <>
      <PageHeader eyebrow="Progress" title="Spot strengths and weak topics" />
      
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-slate-500">Retrieving progress reports...</p>
        </div>
      ) : accuracy.length === 0 ? (
        // Empty state if no quizzes attempted
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-soft">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <HelpCircle size={20} />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink">No progress logged</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Generate and attempt practice quizzes in the **Quizzes** section. Once scored, your topic-wise accuracy analytics will appear here!
          </p>
        </div>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Quiz accuracy</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Your average score percentage by document topic category.</p>
          
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#16a085" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </>
  );
}
