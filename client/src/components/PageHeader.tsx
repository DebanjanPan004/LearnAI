import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  eyebrow: string;
  action?: ReactNode;
}

export function PageHeader({ title, eyebrow, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-mint">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">{title}</h1>
      </div>
      {action}
    </header>
  );
}
