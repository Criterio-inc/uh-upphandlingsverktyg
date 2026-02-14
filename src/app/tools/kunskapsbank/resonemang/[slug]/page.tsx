"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  getResonemangBySlug,
  getDomainBySlug,
  resonemang as allResonemang,
} from "@/config/kunskapsbank/content";
import { SECTION_LABELS, TEXT_SECTION_KEYS } from "@/config/kunskapsbank/types";
import { FeatureGate } from "@/components/feature-gate";

const DOMAIN_ICONS: Record<string, string> = {
  "styrning-beslutsformaga": "target",
  "medveten-ofullstandighet": "unlock",
  "kvalitet-bortom-funktion": "sparkles",
  "risk-ansvar-konsekvens": "scale",
  "marknad-dialog-forstaelse": "handshake",
};

export default function ResonemangDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const item = getResonemangBySlug(slug);
  if (!item) notFound();

  const domain = getDomainBySlug(item.domainSlug);
  const relatedItems = item.relatedSlugs
    .map((s) => allResonemang.find((r) => r.slug === s))
    .filter(Boolean);

  return (
    <FeatureGate featureKey="verktyg.kunskapsbank">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/60 bg-card/60">
          <div className="px-8 py-8 max-w-3xl">
            <Link
              href="/tools/kunskapsbank"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <Icon name="arrow-left" size={14} /> Kunskapsbank
            </Link>

            {domain && (
              <Link
                href={`/tools/kunskapsbank/domaner/${domain.slug}`}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-3"
              >
                <Icon name={DOMAIN_ICONS[domain.slug] || "folder"} size={12} />
                {domain.title}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {item.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {item.summary}
            </p>
          </div>
        </div>

        <div className="px-8 py-8 max-w-3xl space-y-4">
          {/* Text sections (1–6) */}
          {TEXT_SECTION_KEYS.map((key) => {
            const meta = SECTION_LABELS[key];
            const text = item.content[key];
            return (
              <div
                key={key}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {meta.number}
                  </span>
                  <h2 className="text-base font-semibold text-foreground">
                    {meta.title}
                  </h2>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {text}
                </p>
              </div>
            );
          })}

          {/* Formuleringsstöd (7) */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                7
              </span>
              <h2 className="text-base font-semibold text-foreground">
                Formuleringsstöd
              </h2>
            </div>
            <div className="space-y-3">
              {item.content.formuleringsstod.map((quote, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-primary/30 pl-4 py-2 text-sm text-foreground/80 italic leading-relaxed"
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>

          {/* Medveten avgränsning (8) */}
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                8
              </span>
              <h2 className="text-base font-semibold text-foreground">
                Medveten avgränsning
              </h2>
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {item.content.medveten_avgransning}
            </p>
          </div>

          {/* Related resonemang */}
          {relatedItems.length > 0 && (
            <section className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Relaterade resonemang
              </h2>
              <div className="space-y-3">
                {relatedItems.map(
                  (r) =>
                    r && (
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
                    )
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
