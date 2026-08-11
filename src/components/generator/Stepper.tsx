import { cn } from "@/lib/utils";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "label-caps text-[10px] h-5 w-5 rounded-full flex items-center justify-center border",
                i < current
                  ? "bg-ink text-paper border-ink"
                  : i === current
                  ? "bg-accent text-accent-ink border-accent"
                  : "border-rule-strong text-ink-faint"
              )}
            >
              {i + 1}
            </span>
            <span className={cn("text-sm", i === current ? "text-ink font-medium" : "text-ink-faint")}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && <span className="w-6 h-px bg-rule-strong" />}
        </div>
      ))}
    </div>
  );
}
