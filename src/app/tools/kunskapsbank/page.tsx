"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { domains, resonemang, getDomainBySlug } from "@/config/kunskapsbank/content";
import { FeatureGate } from "@/components/feature-gate";

/* ------------------------------------------------------------------ */
/*  Domain icon mapping (lucide icon names)                            */
/* ------------------------------------------------------------------ */

const DOMAIN_ICONS: Record<string, string> = {
  "styrning-beslutsformaga": "target",
  "medveten-ofullstandighet": "unlock",
  "kvalitet-bortom-funktion": "sparkles",
  "risk-ansvar-konsekvens": "scale",
  "marknad-dialog-forstaelse": "handshake",
};

export default function KunskapsbankPage() {
  return (
    <FeatureGate featureKey="verktyg.kunskapsbank">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/60 bg-card/60">
          <div className="px-8 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Icon name="book-open" size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Kunskapsbank
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fördjupa dig i centrala frågeställningar kring IT-upphandling i offentlig sektor
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-5xl space-y-10">
          {/* AI Samtal — call to action */}
          <Link
            href="/tools/kunskapsbank/samtal"
            className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:bg-primary/10 hover:border-primary/30 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
              <Icon name="message-circle" size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                Reflekterande samtal
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Utforska dina upphandlingsdilemman i dialog med ett AI-stöd som hjälper dig formulera medvetna ställningstaganden
              </p>
            </div>
            <Icon name="arrow-right" size={18} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          </Link>

          {/* Domains */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Domäner</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Fem kunskapsområden som ramar in de viktigaste frågorna i en IT-upphandling.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <Link
                  key={domain.slug}
                  href={`/tools/kunskapsbank/domaner/${domain.slug}`}
                  className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon
                        name={DOMAIN_ICONS[domain.slug] || "folder"}
                        size={18}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {domain.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Resonemang */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Resonemang</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Fördjupande artiklar som utforskar specifika dilemman och erbjuder formuleringsstöd.
            </p>
            <div className="space-y-3">
              {resonemang.map((r) => {
                const domain = getDomainBySlug(r.domainSlug);
                return (
                  <Link
                    key={r.slug}
                    href={`/tools/kunskapsbank/resonemang/${r.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      {domain && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-primary/70 mb-1.5">
                          <Icon name={DOMAIN_ICONS[domain.slug] || "folder"} size={10} />
                          {domain.title}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {r.summary}
                      </p>
                    </div>
                    <Icon
                      name="arrow-right"
                      size={16}
                      className="text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1 transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </FeatureGate>
  );
}
