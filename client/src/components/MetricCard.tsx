import type { Metric } from "../types";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article
      className="relative rounded-md p-5 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)",
        boxShadow: "0 20px 50px -15px rgba(0,0,0,.5), 0 0 0 1px rgba(201,162,39,.3)",
        color: "#241a10",
      }}
    >
      {/* inner border ornament */}
      <span
        className="pointer-events-none absolute inset-2.5 rounded"
        style={{ border: "1px solid rgba(201,162,39,0.25)" }}
      />
      <p
        className="text-xs uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-mono)", color: "#6b5a3a", letterSpacing: "0.18em" }}
      >
        {metric.label}
      </p>
      <p
        className="text-3xl font-semibold leading-none"
        style={{ fontFamily: "var(--font-display)", color: "#6b1f2a" }}
      >
        {metric.value}
      </p>
      <p
        className="mt-2 text-sm"
        style={{ fontFamily: "var(--font-body)", color: "#6b5a3a" }}
      >
        {metric.detail}
      </p>
    </article>
  );
}
