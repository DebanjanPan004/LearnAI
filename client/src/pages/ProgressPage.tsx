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
  const { data: progressData, isLoading } = useQuery({
    queryKey: ["progress-metrics"],
    queryFn: async () => (await api.get("/progress")).data,
  });

  const accuracy = progressData?.accuracyBreakdown || [];

  return (
    <>
      <PageHeader eyebrow="Progress" title="Spot strengths and weak topics" />

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "#c9a227" }} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(231,199,102,0.6)" }}>
            Retrieving progress…
          </p>
        </div>
      ) : accuracy.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          border: "1px dashed rgba(201,162,39,0.25)", borderRadius: "8px",
          background: "rgba(31,69,54,0.2)", padding: "60px 24px", textAlign: "center",
        }}>
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.25)",
          }}>
            <HelpCircle size={22} style={{ color: "rgba(201,162,39,0.6)" }} />
          </span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#e7c766", margin: "16px 0 8px" }}>
            No progress logged yet
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(242,232,213,0.55)", maxWidth: "380px", lineHeight: 1.7 }}>
            Generate and attempt practice quizzes in the Quizzes section. Once scored, your topic‑wise accuracy analytics will appear here!
          </p>
        </div>
      ) : (
        <section style={{
          background: "rgba(22,51,39,0.4)", border: "1px solid rgba(201,162,39,0.2)",
          borderRadius: "8px", padding: "24px", backdropFilter: "blur(4px)",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "20px", margin: "0 0 4px" }}>
            Quiz Accuracy
          </h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(231,199,102,0.5)", margin: "0 0 24px" }}>
            Average score % by document topic
          </p>

          <div style={{ height: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracy}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a227" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6b1f2a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                <XAxis
                  dataKey="topic"
                  tick={{ fill: "rgba(231,199,102,0.55)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  axisLine={{ stroke: "rgba(201,162,39,0.2)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
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
                  cursor={{ fill: "rgba(201,162,39,0.05)" }}
                />
                <Bar dataKey="score" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </>
  );
}
