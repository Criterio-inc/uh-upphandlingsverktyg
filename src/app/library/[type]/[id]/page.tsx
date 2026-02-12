import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SparkboardSuggestion } from "@/components/library/sparkboard-suggestion";

export const dynamic = "force-dynamic";

const TYPE_INFO: Record<string, { label: string; singular: string; icon: string }> = {
  requirement_block: { label: "Kravbibliotek", singular: "kravblock", icon: "📐" },
  risk_template: { label: "Riskbibliotek", singular: "riskmall", icon: "⚠️" },
  workshop_template: { label: "Workshopmallar", singular: "workshopmall", icon: "🏛️" },
  criteria_block: { label: "Kriterieblock", singular: "kriterieblock", icon: "🎯" },
  contract_clause: { label: "Kontraktsklausuler", singular: "kontraktsklausul", icon: "📜" },
  phase_checklist: { label: "Faschecklistor", singular: "faschecklista", icon: "✅" },
};

/* eslint-disable @typescript-eslint/no-explicit-any */

function parseJson(raw: string | null): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ── Requirement block renderer ──────────────────────────────

function RequirementBlockContent({ requirements }: { requirements: any[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {requirements.length} krav i detta block
      </p>
      {requirements.map((req: any, i: number) => (
        <Card key={i} className="border-border/60">
          <CardContent className="py-3 px-4">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="font-semibold text-sm">{req.title}</span>
              <Badge
                className={
                  req.level === "SKA"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
                }
              >
                {req.level}
              </Badge>
              {req.reqType && (
                <Badge variant="outline" className="text-xs">
                  {req.reqType}
                </Badge>
              )}
              {req.cluster && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {req.cluster}
                </Badge>
              )}
            </div>
            <p className="text-sm mt-2 leading-relaxed">{req.text}</p>
            {req.rationale && (
              <p className="text-xs text-muted-foreground mt-1.5 italic">
                {req.rationale}
              </p>
            )}
            {req.verification && (
              <div className="mt-2 flex flex-wrap gap-1">
                {req.verification.bidEvidence && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Anbud: {req.verification.bidEvidence}
                  </Badge>
                )}
                {req.verification.implementationProof && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Impl: {req.verification.implementationProof}
                  </Badge>
                )}
                {req.verification.opsFollowUp && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Drift: {req.verification.opsFollowUp}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Risk template renderer ──────────────────────────────────

const RESPONSE_STRATEGY_MAP: Record<string, { label: string; color: string }> = {
  avoid: { label: "Undvik", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  mitigate: { label: "Minska", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  transfer: { label: "Överför", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  accept: { label: "Acceptera", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

function RiskTemplateContent({ risk }: { risk: any }) {
  const assessmentQuestions: string[] = risk.assessmentQuestions ?? [];
  const indicators: string[] = risk.indicators ?? [];
  const strategy = RESPONSE_STRATEGY_MAP[risk.responseStrategy];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">1 risk i denna mall</p>

      <Card>
        <CardContent className="space-y-3">
          {risk.description && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beskrivning</h3>
              <p className="text-sm mt-1">{risk.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {risk.likelihood != null && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sannolikhet</h3>
                <p className="text-sm mt-1 font-medium">{risk.likelihood} / 5</p>
              </div>
            )}
            {risk.impact != null && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Konsekvens</h3>
                <p className="text-sm mt-1 font-medium">{risk.impact} / 5</p>
              </div>
            )}
          </div>
          {strategy && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hanteringsstrategi</h3>
              <Badge className={`mt-1 text-xs ${strategy.color}`}>{strategy.label}</Badge>
            </div>
          )}
          {risk.mitigation && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Åtgärd</h3>
              <p className="text-sm mt-1">{risk.mitigation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment questions */}
      {assessmentQuestions.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Bedömningsfrågor — ställ dessa för att avgöra om risken gäller er
            </h3>
            <ol className="space-y-1.5">
              {assessmentQuestions.map((q: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5 min-w-[1.5rem]">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Early warning indicators */}
      {indicators.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Tidiga varningssignaler
            </h3>
            <ul className="space-y-1">
              {indicators.map((ind: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">⚡</span>
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Escalation criteria */}
      {risk.escalationCriteria && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5">🔺</span>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Eskaleringskriterier</p>
              <p className="text-sm mt-1 leading-relaxed">{risk.escalationCriteria}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Workshop template renderer ──────────────────────────────

function WorkshopTemplateContent({ workshop }: { workshop: any }) {
  const agendaItems: string[] = workshop.agenda ?? [];
  const agendaDetailed: any[] = workshop.agendaDetailed ?? [];
  const outputs: string[] = workshop.expectedOutputs ?? [];
  const participants: string[] = workshop.suggestedParticipants ?? [];
  const followUp: string[] = workshop.followUp ?? [];
  const sparkboardSuggestion: any[] = workshop.sparkboardSuggestion ?? [];
  const hasDetailedAgenda = agendaDetailed.length > 0;

  return (
    <div className="space-y-4">
      {workshop.duration && (
        <p className="text-sm text-muted-foreground">
          Tidsuppskattning: {workshop.duration}
        </p>
      )}

      {/* Preparation */}
      {workshop.preparation && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <div className="flex items-start gap-2.5">
            <span className="shrink-0">📝</span>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Förberedelser</p>
              <p className="text-sm mt-1 leading-relaxed">{workshop.preparation}</p>
            </div>
          </div>
        </div>
      )}

      {participants.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Föreslagna deltagare
            </h3>
            <div className="flex flex-wrap gap-1">
              {participants.map((p: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed agenda (if available) */}
      {hasDetailedAgenda ? (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Detaljerad agenda ({agendaDetailed.length} moment)
          </h3>
          {agendaDetailed.map((item: any, i: number) => (
            <Card key={i} className="border-border/60">
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary text-xs font-mono">
                    {item.timeMinutes} min
                  </Badge>
                  <span className="font-semibold text-sm">{item.title}</span>
                  {item.method && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {item.method}
                    </Badge>
                  )}
                </div>
                {item.purpose && (
                  <p className="text-sm text-muted-foreground italic">{item.purpose}</p>
                )}
                {item.facilitationQuestions && item.facilitationQuestions.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Faciliteringsfrågor:</p>
                    <ol className="space-y-0.5 ml-1">
                      {item.facilitationQuestions.map((q: string, qi: number) => (
                        <li key={qi} className="text-sm flex items-start gap-1.5">
                          <span className="text-muted-foreground font-mono text-xs mt-0.5">{qi + 1}.</span>
                          <span className="text-foreground/80">{q}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {item.tips && (
                  <div className="rounded-xl bg-secondary/60 p-2.5 mt-1">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="shrink-0">💡</span>
                      <span>{item.tips}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agendaItems.length > 0 ? (
        /* Fallback: simple agenda list */
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Agenda ({agendaItems.length} punkter)
            </h3>
            <ol className="space-y-1.5">
              {agendaItems.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5 min-w-[1.5rem]">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      {/* Sparkboard suggestions */}
      {sparkboardSuggestion.length > 0 && (
        <SparkboardSuggestion boards={sparkboardSuggestion} />
      )}

      {outputs.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Förväntade resultat
            </h3>
            <ul className="space-y-1">
              {outputs.map((o: string, i: number) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Follow-up actions */}
      {followUp.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Efterarbete
            </h3>
            <ol className="space-y-1">
              {followUp.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5 min-w-[1.5rem]">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Criteria block renderer ─────────────────────────────────

function CriteriaBlockContent({ criteria }: { criteria: any[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {criteria.length} kriterier i detta block
      </p>
      {criteria.map((c: any, i: number) => (
        <Card key={i}>
          <CardContent className="py-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-sm">{c.title}</span>
              <div className="flex gap-1.5 shrink-0">
                {c.weight != null && (
                  <Badge className="text-xs">Vikt: {c.weight}%</Badge>
                )}
                {c.scale && (
                  <Badge variant="outline" className="text-xs">{c.scale}</Badge>
                )}
              </div>
            </div>
            {c.scoringGuidance && (
              <p className="text-xs text-muted-foreground mt-1.5">{c.scoringGuidance}</p>
            )}
            {c.anchors && (
              <div className="mt-2 space-y-0.5">
                {Object.entries(c.anchors).map(([score, label]) => (
                  <div key={score} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-muted-foreground min-w-[1.5rem] text-right">{score}:</span>
                    <span className="text-muted-foreground">{label as string}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Contract clause renderer ────────────────────────────────

function ContractClauseContent({ clause }: { clause: any }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">1 klausul</p>
      <Card>
        <CardContent className="space-y-3">
          {clause.level && (
            <Badge
              className={
                clause.level === "SKA"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
              }
            >
              {clause.level}
            </Badge>
          )}
          {clause.text && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Klausultext</h3>
              <p className="text-sm mt-1 leading-relaxed">{clause.text}</p>
            </div>
          )}
          {clause.rationale && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motivering</h3>
              <p className="text-sm mt-1 text-muted-foreground">{clause.rationale}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Phase checklist renderer ────────────────────────────────

function PhaseChecklistContent({ checklist }: { checklist: any }) {
  const items: any[] = checklist.items ?? [];
  const requiredCount = items.filter((it: any) => it.required).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {items.length} kontrollpunkter ({requiredCount} obligatoriska)
      </p>
      {checklist.phase && (
        <Badge className="text-xs">{checklist.phase}</Badge>
      )}
      <div className="space-y-2 mt-2">
        {items.map((item: any, i: number) => (
          <Card key={i} className="border-border/60">
            <CardContent className="py-2.5 px-4">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">
                  {item.required ? "[ ]" : "(  )"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.required && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]">
                        Obligatorisk
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main page component ─────────────────────────────────────

export default async function LibraryItemDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const info = TYPE_INFO[type];
  if (!info) notFound();

  const item: any = await prisma.libraryItem.findUnique({ where: { id } });
  if (!item || item.type !== type) notFound();

  const content = parseJson(item.content);
  const tags: string[] = parseJson(item.tags) ?? [];

  return (
    <div>
      <Header
        title={item.title}
        breadcrumbs={[
          { label: "Bibliotek", href: "/library" },
          { label: info.label, href: `/library/${type}` },
          { label: item.title },
        ]}
      />
      <div className="p-6 max-w-4xl">
        {/* Metadata */}
        <div className="mb-6">
          {item.description && (
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {item.profile && (
              <Badge className="text-xs">{item.profile}</Badge>
            )}
            {item.cluster && (
              <Badge variant="outline" className="text-xs">{item.cluster}</Badge>
            )}
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Type-specific content */}
        {type === "requirement_block" && content.requirements && (
          <RequirementBlockContent requirements={content.requirements} />
        )}
        {type === "risk_template" && content.risk && (
          <RiskTemplateContent risk={content.risk} />
        )}
        {type === "workshop_template" && content.workshop && (
          <WorkshopTemplateContent workshop={content.workshop} />
        )}
        {type === "criteria_block" && content.criteria && (
          <CriteriaBlockContent criteria={content.criteria} />
        )}
        {type === "contract_clause" && content.clause && (
          <ContractClauseContent clause={content.clause} />
        )}
        {type === "phase_checklist" && content.checklist && (
          <PhaseChecklistContent checklist={content.checklist} />
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            href={`/library/${type}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
          >
            &larr; Tillbaka till {info.label.toLowerCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}
