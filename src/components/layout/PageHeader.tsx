import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 animate-fade-up">
      <div className="max-w-2xl">
        {eyebrow && <p className="label-caps text-[10px] text-accent mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-[2.35rem] leading-[1.08] tracking-tight">{title}</h1>
        {description && <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">{description}</p>}
      </div>
      {action}
    </header>
  );
}
