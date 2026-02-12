"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/cases", label: "Upphandlingar", icon: "📋" },
  { href: "/library", label: "Bibliotek", icon: "📚" },
  { href: "/help", label: "Hjälpcenter", icon: "❓" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border/60 bg-card">
      <div className="flex h-14 items-center border-b border-border/60 px-5">
        <Link href="/cases" className="flex items-center gap-2.5 font-semibold text-foreground">
          <span className="text-xl">⚖️</span>
          <span className="tracking-tight">LOU-stöd</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/40 px-5 py-3">
        <p className="text-[10px] text-muted-foreground/60 tracking-wide">Criterio</p>
      </div>
    </aside>
  );
}
