import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  title,
  eyebrow,
  action,
}: {
  className?: string;
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("paper-panel rounded-sm", className)}>
      {(title || eyebrow || action) && (
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-rule">
          <div>
            {eyebrow && <p className="label-caps text-[10px] text-ink-faint mb-1">{eyebrow}</p>}
            {title && <h2 className="font-display text-lg leading-snug">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
