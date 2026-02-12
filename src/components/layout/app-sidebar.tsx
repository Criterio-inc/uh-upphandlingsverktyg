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
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-muted/30">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/cases" className="flex items-center gap-2 font-semibold text-primary">
          <span className="text-xl">⚖️</span>
          <span>LOU-stöd</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
