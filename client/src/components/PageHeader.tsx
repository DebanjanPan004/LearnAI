import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  eyebrow: string;
  action?: ReactNode;
}

export function PageHeader({ title, eyebrow, action }: PageHeaderProps) {
  return (
    <header
      className="mb-6 flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between"
      style={{ borderBottom: "1px solid rgba(201,162,39,0.25)" }}
    >
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-mono)", color: "#c9a227", letterSpacing: "0.22em" }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-3xl leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "#f2e8d5", fontWeight: 500 }}
        >
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
