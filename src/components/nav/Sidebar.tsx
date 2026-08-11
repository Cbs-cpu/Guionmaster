"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/uiStore";

export const NAV_ITEMS = [
  { href: "/", index: "00", label: "Panel" },
  { href: "/reels/nuevo", index: "01", label: "Nuevo Reel" },
  { href: "/youtube/nuevo", index: "02", label: "Nuevo Vídeo" },
  { href: "/biblioteca", index: "03", label: "Biblioteca" },
  { href: "/conocimiento", index: "04", label: "Conocimiento" },
];

export function Sidebar() {
  const pathname = usePathname();
  const chromeHidden = useUiStore((s) => s.chromeHidden);

  if (chromeHidden) return null;

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-rule bg-paper-raised">
      <div className="px-6 pt-8 pb-6 border-b border-rule">
        <Link href="/" className="flex items-center gap-2.5 group">
          <SystemMark />
          <span className="font-display text-[1.05rem] leading-tight tracking-tight">
            System
            <br />
            Content Studio
          </span>
        </Link>
        <p className="label-caps mt-4 text-[10px] text-ink-faint">
          Una empresa es un sistema
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "label-caps text-[10px] w-5 shrink-0",
                  active ? "text-paper/60" : "text-ink-faint"
                )}
              >
                {item.index}
              </span>
              <span className={active ? "font-medium" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-rule">
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Odoo · Apps para entrenadores
          <br />
          Workspace privado y local.
        </p>
      </div>
    </aside>
  );
}

export function SystemMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="4" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-ink" />
      <rect x="22" y="1" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-blueprint" />
      <rect x="11.5" y="19" width="9" height="9" rx="1" fill="currentColor" className="text-accent" />
      <path d="M10 8.5H16C18.5 8.5 20 6.5 22 6" stroke="currentColor" strokeWidth="1.4" className="text-ink-soft" />
      <path d="M16 13V17.5" stroke="currentColor" strokeWidth="1.4" className="text-ink-soft" />
      <path d="M16 23.5H24C26 23.5 27 21.5 27 19.5V14" stroke="currentColor" strokeWidth="1.4" className="text-ink-soft" />
    </svg>
  );
}
