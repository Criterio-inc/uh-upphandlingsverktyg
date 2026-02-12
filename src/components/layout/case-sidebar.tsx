"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ENTITY_META } from "@/config/entity-meta";
import type { EntityType } from "@/types/entities";

const CASE_NAV: { segment: string; entityType?: EntityType; label: string; icon: string }[] = [
  { segment: "", label: "Dashboard", icon: "📊" },
  { segment: "needs", entityType: "need", label: ENTITY_META.need.pluralLabel, icon: ENTITY_META.need.icon },
  { segment: "requirements", entityType: "requirement", label: ENTITY_META.requirement.pluralLabel, icon: ENTITY_META.requirement.icon },
  { segment: "risks", entityType: "risk", label: ENTITY_META.risk.pluralLabel, icon: ENTITY_META.risk.icon },
  { segment: "criteria", entityType: "criterion", label: ENTITY_META.criterion.pluralLabel, icon: ENTITY_META.criterion.icon },
  { segment: "stakeholders", entityType: "stakeholder", label: ENTITY_META.stakeholder.pluralLabel, icon: ENTITY_META.stakeholder.icon },
  { segment: "workshops", entityType: "workshop", label: ENTITY_META.workshop.pluralLabel, icon: ENTITY_META.workshop.icon },
  { segment: "evidence", entityType: "evidence", label: ENTITY_META.evidence.pluralLabel, icon: ENTITY_META.evidence.icon },
  { segment: "bids", entityType: "bid", label: "Anbud & status", icon: "📨" },
  { segment: "evaluation", label: "Fas C — Status", icon: "📋" },
  { segment: "decisions", entityType: "decision", label: ENTITY_META.decision.pluralLabel, icon: ENTITY_META.decision.icon },
  { segment: "documents", entityType: "document", label: ENTITY_META.document.pluralLabel, icon: ENTITY_META.document.icon },
  { segment: "traceability", label: "Spårbarhet", icon: "🔗" },
  { segment: "settings", label: "Inställningar", icon: "⚙️" },
];

export function CaseSidebar({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const basePath = `/cases/${caseId}`;

  return (
    <nav className="w-48 border-r border-border bg-muted/20 p-3 space-y-1">
      {CASE_NAV.map((item) => {
        const href = item.segment ? `${basePath}/${item.segment}` : basePath;
        const isActive = item.segment
          ? pathname.startsWith(href)
          : pathname === basePath;
        return (
          <Link
            key={item.segment || "dashboard"}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="text-xs">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
