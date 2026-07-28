import type { Metric } from "../types";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{metric.value}</p>
      <p className="mt-1 text-sm text-slate-500">{metric.detail}</p>
    </article>
  );
}

