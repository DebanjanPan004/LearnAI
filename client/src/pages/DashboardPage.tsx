import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

export function DashboardPage() {
  // Query dashboard statistics
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await api.get("/progress");
      return res.data;
    }
  });

  // Simulate logging 2 minutes of study time on dashboard visit
  const logStudyTimeMutation = useMutation({
    mutationFn: async () => {
      await api.post("/progress", { studyMinutes: 2 });
    }
  });

  useEffect(() => {
    logStudyTimeMutation.mutate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-medium text-slate-500">Loading your command center...</p>
      </div>
    );
  }

  const progress = dashboardData?.progress;
  const counts = dashboardData?.counts;

  const metrics = [
    { label: "Study streak", value: `${progress?.streak ?? 1} days`, detail: "Keep the momentum going!" },
    { label: "Documents", value: `${counts?.documents ?? 0}`, detail: "Active study files" },
    { label: "Flashcards", value: `${counts?.flashcards ?? 0}`, detail: "Practice recall cards" },
    { label: "Average score", value: `${progress?.averageScore ?? 0}%`, detail: "Across all quizzes" }
  ];

  const weeklyProgress = dashboardData?.weeklyProgress || [];

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Your learning command center" />
      
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Weekly progress</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Distribution of total study time in minutes logged this week.</p>
          
          <div className="mt-6 h-76">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="minutes" stroke="#2563eb" fill="#bfdbfe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Today's Focus Items</h2>
          <div className="mt-4 space-y-4">
            {["Review flashcards from uploaded files", "Generate a practice quiz to test recall", "Ask AI tutor to clarify difficult concepts"].map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50 transition cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
