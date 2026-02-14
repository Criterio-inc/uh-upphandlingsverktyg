"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_KEYS } from "@/config/features";

// Lazy-load UserButton so @clerk/nextjs isn't bundled when Clerk is disabled
const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => {
    function Btn() {
      return (
        <mod.UserButton
          afterSignOutUrl="/sign-in"
          appearance={{ elements: { avatarBox: "h-7 w-7" } }}
        />
      );
    }
    return Btn;
  }),
  { ssr: false }
);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkEnabled =
  !!clerkKey &&
  /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(clerkKey);

const ADMIN_EMAIL = "par.levander@criteroconsulting.se";

// Lazy-load admin check so useUser only runs inside ClerkProvider
const AdminNavLink = dynamic(
  () => import("@clerk/nextjs").then((mod) => {
    function AdminLink({ pathname }: { pathname: string }) {
      const { user } = mod.useUser();
      const isAdmin = user?.emailAddresses?.some(
        (e) => e.emailAddress === ADMIN_EMAIL
      );
      if (!isAdmin) return null;
      return (
        <>
          <div className="my-2 border-t border-border/30" />
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon name="crown" size={16} />
            <span>Admin</span>
          </Link>
        </>
      );
    }
    return AdminLink;
  }),
  { ssr: false }
);

/* ------------------------------------------------------------------ */
/*  Navigation config — app-grouped sections with feature keys         */
/* ------------------------------------------------------------------ */

interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** If set, the item is hidden when this feature is disabled */
  featureKey?: string;
}

interface NavSection {
  label?: string;
  /** If set, the entire section is hidden when this app is disabled */
  appKey?: string;
  /** If true, section is collapsible */
  collapsible?: boolean;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  // Platform home
  {
    items: [
      { href: "/", label: "Hem", icon: "home" },
    ],
  },
  // Upphandling
  {
    label: "Upphandling",
    appKey: "upphandling",
    collapsible: true,
    items: [
      { href: "/cases", label: "Upphandlingar", icon: "clipboard-list" },
      { href: "/library", label: "Bibliotek", icon: "library" },
      { href: "/training", label: "Utbildning", icon: "graduation-cap", featureKey: "upphandling.training" },
      { href: "/help", label: "Hjälpcenter", icon: "help-circle", featureKey: "upphandling.help" },
    ],
  },
  // Verktyg
  {
    label: "Verktyg",
    appKey: "verktyg",
    collapsible: true,
    items: [
      { href: "/tools/benefit-calculator", label: "Nyttokalkyl", icon: "calculator", featureKey: "verktyg.benefit-calculator" },
      { href: "/tools/risk-matrix", label: "Riskmatris", icon: "shield-alert", featureKey: "verktyg.risk-matrix" },
      { href: "/tools/evaluation-model", label: "Utvärderingsmodell", icon: "scale", featureKey: "verktyg.evaluation-model" },
      { href: "/tools/timeline-planner", label: "Tidslinjeplanerare", icon: "clock", featureKey: "verktyg.timeline-planner" },
      { href: "/tools/stakeholder-map", label: "Intressentanalys", icon: "users", featureKey: "verktyg.stakeholder-map" },
      { href: "/tools/kunskapsbank", label: "Kunskapsbank", icon: "book-open", featureKey: "verktyg.kunskapsbank" },
    ],
  },
  // Mognadsmätning
  {
    label: "Mognadsmätning",
    appKey: "mognadmatning",
    collapsible: true,
    items: [
      { href: "/mognadmatning", label: "Ny mätning", icon: "plus-circle", featureKey: "mognadmatning.survey" },
      { href: "/mognadmatning/projekt", label: "Projekt", icon: "folder", featureKey: "mognadmatning.results" },
    ],
  },
  // AI-Mognadsmätning
  {
    label: "AI-Mognadsmätning",
    appKey: "ai-mognadmatning",
    collapsible: true,
    items: [
      { href: "/ai-mognadmatning", label: "Ny mätning", icon: "plus-circle", featureKey: "ai-mognadmatning.survey" },
      { href: "/ai-mognadmatning/projekt", label: "Projekt", icon: "folder", featureKey: "ai-mognadmatning.results" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Hook: fetch feature flags                                          */
/* ------------------------------------------------------------------ */

function useFeatures(): Record<string, boolean> | null {
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((data) => setFeatures(data.features ?? {}))
      .catch(() => setFeatures(null));
  }, []);

  return features;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AppSidebar() {
  const pathname = usePathname();
  const features = useFeatures();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Hide sidebar on auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  // Hide sidebar on public survey pages
  if (pathname.match(/^\/(mognadmatning|ai-mognadmatning)\/survey\//)) {
    return null;
  }

  /** Check if an app master toggle is disabled */
  function isAppDisabled(appKey: string): boolean {
    if (!features) return false;
    return features[appKey] === false;
  }

  /** Check if a feature is effectively enabled (with cascade) */
  function isFeatureEnabled(featureKey: string): boolean {
    if (!features) return true;
    if (features[featureKey] === false) return false;
    for (const appKey of APP_KEYS) {
      if (featureKey !== appKey && featureKey.startsWith(appKey + ".")) {
        if (features[appKey] === false) return false;
        break;
      }
    }
    return true;
  }

  /** Filter items based on feature flags */
  function filterItems(items: NavItem[]): NavItem[] {
    if (!features) return items;
    return items.filter((item) => {
      if (!item.featureKey) return true;
      return isFeatureEnabled(item.featureKey);
    });
  }

  /** Check if any item in a section matches the current pathname */
  function isSectionActive(section: NavSection): boolean {
    return section.items.some((item) => {
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border/60 bg-card">
      <div className="flex h-14 items-center border-b border-border/60 px-5">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[13px] font-bold text-white leading-none">C</span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight leading-tight">Critero</span>
            <span className="text-[9px] font-medium text-muted-foreground/60 tracking-wider uppercase leading-tight">Suite</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_SECTIONS.map((section, idx) => {
          // Hide entire section if app is disabled
          if (section.appKey && isAppDisabled(section.appKey)) return null;

          const visibleItems = filterItems(section.items);
          if (visibleItems.length === 0) return null;

          const sectionLabel = section.label ?? "";
          const isCollapsed = section.collapsible && collapsed[sectionLabel];
          const isActive = isSectionActive(section);

          return (
            <div key={idx}>
              {idx > 0 && <div className="my-2 border-t border-border/30" />}
              {section.label && (
                <button
                  type="button"
                  onClick={() => section.collapsible && toggleSection(sectionLabel)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    isActive
                      ? "text-primary/70"
                      : "text-muted-foreground/50",
                    section.collapsible && "cursor-pointer hover:text-muted-foreground/80",
                  )}
                >
                  <span>{section.label}</span>
                  {section.collapsible && (
                    <Icon
                      name={isCollapsed ? "chevron-right" : "chevron-down"}
                      size={10}
                      className="opacity-50"
                    />
                  )}
                </button>
              )}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isItemActive = item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                          isItemActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <Icon name={item.icon} size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Admin link — only visible to admin */}
        {isClerkEnabled && <AdminNavLink pathname={pathname} />}
      </nav>

      {/* User section */}
      <div className="border-t border-border/40 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2.5">
          {isClerkEnabled && <ClerkUserButton />}
          <ThemeToggle />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground/60 tracking-wide">&copy; Critero Consulting AB</p>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground/50">
            <Link href="/terms" className="hover:text-foreground transition-colors">Villkor &amp; data</Link>
            <span>&middot;</span>
            <a href="mailto:kontakt@criteroconsulting.se" className="hover:text-foreground transition-colors">Kontakt</a>
          </div>
        </div>
      </div>
    </aside>
  );
}
