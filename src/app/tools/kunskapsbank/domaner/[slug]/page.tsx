"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { getDomainBySlug, getResonemangByDomain } from "@/config/kunskapsbank/content";
import { FeatureGate } from "@/components/feature-gate";

const DOMAIN_ICONS: Record<string, string> = {
  "styrning-beslutsformaga": "target",
  "medveten-ofullstandighet": "unlock",
  "kvalitet-bortom-funktion": "sparkles",
  "risk-ansvar-konsekvens": "scale",
  "marknad-dialog-forstaelse": "handshake",
};

export default function DomainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const domain = getDomainBySlug(slug);
  if (!domain) notFound();

  const relatedResonemang = getResonemangByDomain(domain.slug);
  const iconName = DOMAIN_ICONS[domain.slug] || "folder";

  return (
    <FeatureGate featureKey="verktyg.kunskapsbank">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/60 bg-card/60">
          <div className="px-8 py-8">
            <Link
              href="/tools/kunskapsbank"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <Icon name="arrow-left" size={14} /> Kunskapsbank
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Icon name={iconName} size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {domain.title}
                </h1>
                <p className="text-sm text-muted-foreground">{domain.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-3xl space-y-8">
          {/* Domain content */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm text-foreground/85 leading-relaxed">{domain.content}</p>
          </div>

          {/* Related resonemang */}
          {relatedResonemang.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Resonemang inom denna domän
              </h2>
              <div className="space-y-3">
                {relatedResonemang.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/tools/kunskapsbank/resonemang/${r.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
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
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
