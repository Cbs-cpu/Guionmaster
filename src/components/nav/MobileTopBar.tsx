"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SystemMark } from "./Sidebar";

export function MobileTopBar() {
  const pathname = usePathname();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-paper-raised border-b border-rule">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-rule">
        <Link href="/" className="flex items-center gap-2.5">
          <SystemMark className="h-6 w-6" />
          <span className="font-display text-sm tracking-tight">System Content Studio</span>
        </Link>
      </div>
      <nav className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 label-caps text-[10px] px-3 py-1.5 rounded-full border transition-colors",
                active
                  ? "bg-ink text-paper border-ink"
                  : "border-rule text-ink-soft"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
