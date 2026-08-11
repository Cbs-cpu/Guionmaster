const STEPS = ["LEAD", "CRM", "VENTA", "ODOO", "FACTURACIÓN", "CLIENTE"];

export function HeroDiagram() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-0 min-w-max py-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <div
              className="animate-fade-up rounded-sm border px-4 py-3 sm:px-5 sm:py-3.5"
              style={{
                animationDelay: `${140 + i * 90}ms`,
                borderColor: i === 3 ? "var(--color-accent)" : "var(--color-rule-strong)",
                background: i === 3 ? "var(--color-accent-soft)" : "var(--color-paper-raised)",
              }}
            >
              <span
                className="label-caps text-[11px] sm:text-xs"
                style={{ color: i === 3 ? "var(--color-accent)" : "var(--color-ink)" }}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <svg
                className="animate-fade-up w-7 sm:w-9 h-4 shrink-0 text-ink-faint"
                style={{ animationDelay: `${180 + i * 90}ms` }}
                viewBox="0 0 36 16"
                fill="none"
              >
                <path d="M0 8H32" stroke="currentColor" strokeWidth="1.4" />
                <path d="M26 3L32 8L26 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
