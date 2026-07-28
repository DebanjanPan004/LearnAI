import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";

const cardStyle = {
  background: "rgba(31,69,54,0.35)",
  border: "1px solid rgba(201,162,39,0.2)",
  borderRadius: "8px",
  padding: "20px",
  backdropFilter: "blur(4px)",
};

export function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await api.get("/progress");
      return res.data;
    }
  });

  const logStudyTimeMutation = useMutation({
    mutationFn: async () => { await api.post("/progress", { studyMinutes: 2 }); }
  });

  useEffect(() => { logStudyTimeMutation.mutate(); }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#c9a227" }} />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.15em", color: "rgba(231,199,102,0.7)", textTransform: "uppercase" }}>
          Opening your shelf…
        </p>
      </div>
    );
  }

  const progress = dashboardData?.progress;
  const counts = dashboardData?.counts;

  const metrics = [
    { label: "Study streak",    value: `${progress?.streak ?? 1} days`, detail: "Keep the momentum going!" },
    { label: "Documents",       value: `${counts?.documents ?? 0}`,      detail: "Active study files" },
    { label: "Flashcards",      value: `${counts?.flashcards ?? 0}`,     detail: "Practice recall cards" },
    { label: "Average score",   value: `${progress?.averageScore ?? 0}%`, detail: "Across all quizzes" },
  ];

  const weeklyProgress = dashboardData?.weeklyProgress || [];

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Your learning command centre" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">

        {/* Chart */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", margin: 0 }}>
            Weekly Progress
          </h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: "rgba(231,199,102,0.5)", textTransform: "uppercase", marginTop: "4px" }}>
            Study minutes logged this week
          </p>
          <div className="mt-5" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="vellumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a227" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#c9a227" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.12)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "rgba(231,199,102,0.55)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  axisLine={{ stroke: "rgba(201,162,39,0.2)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(231,199,102,0.55)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#163327",
                    border: "1px solid rgba(201,162,39,0.35)",
                    borderRadius: "4px",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "12px",
                    color: "#e7c766",
                  }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#c9a227" strokeWidth={2} fill="url(#vellumGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus checklist */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", margin: 0 }}>
            Today's Focus
          </h2>
          <div className="mt-4 space-y-3">
            {[
              "Review flashcards from uploaded files",
              "Generate a practice quiz to test recall",
              "Ask AI tutor to clarify difficult concepts",
            ].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 rounded cursor-pointer transition"
                style={{
                  padding: "10px 12px",
                  border: "1px solid rgba(201,162,39,0.15)",
                  background: "rgba(0,0,0,0.15)",
                  color: "#f2e8d5",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(107,31,42,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.15)")}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "#6b1f2a" }}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
