import type { AssessmentConfig } from "@/config/assessments";

/* ------------------------------------------------------------------ */
/*  Fallback-insikter — genereras lokalt utan AI                       */
/*  Används när ANTHROPIC_API_KEY saknas eller API-anropet misslyckas  */
/* ------------------------------------------------------------------ */

interface DimensionScore {
  average: number;
  questionCount: number;
  answeredCount: number;
}

/**
 * Generera strukturerade insikter baserat på poäng utan AI.
 * Returnerar markdown-formaterad text.
 */
export function generateFallbackInsights(
  config: AssessmentConfig,
  scores: Record<string, DimensionScore>,
  overall: number,
  level: number,
): string {
  const maturityLevel = config.maturityLevels.find((ml) => ml.level === level);
  const nextLevel = config.maturityLevels.find((ml) => ml.level === level + 1);

  // Sortera dimensioner efter poäng
  const ranked = config.dimensions
    .map((dim) => ({
      id: dim,
      label: config.dimensionLabels[dim] ?? dim,
      description: config.dimensionDescriptions[dim] ?? "",
      score: scores[dim]?.average ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  // Hitta alla styrkor (≥ overall) och svagheter (< overall)
  const strengths = ranked.filter((d) => d.score >= overall && d.score >= 2.5);
  const weaknesses = ranked.filter((d) => d.score < overall || d.score < 2.5);

  const sections: string[] = [];

  // --- Sammanfattning ---
  sections.push(`## Sammanfattning

Organisationens ${config.name.toLowerCase()} visar en övergripande mognadsnivå på **${overall.toFixed(1)} av 5.0**, vilket motsvarar nivå **${level} — ${maturityLevel?.name ?? "Okänd"}**.

${maturityLevel?.description ?? ""}

${strongest.score - weakest.score > 1.5
    ? `Det finns en tydlig skillnad mellan starkaste dimensionen (${strongest.label}: ${strongest.score.toFixed(1)}) och svagaste (${weakest.label}: ${weakest.score.toFixed(1)}), vilket indikerar ojämn mognad.`
    : `Mognadsnivån är relativt jämn över dimensionerna, med ${strongest.label} (${strongest.score.toFixed(1)}) som starkast och ${weakest.label} (${weakest.score.toFixed(1)}) som svagast.`
  }`);

  // --- Styrkor ---
  if (strengths.length > 0) {
    const strengthLines = strengths
      .slice(0, 3)
      .map((d) => `- **${d.label}** (${d.score.toFixed(1)}/5.0) — ${d.description}`)
      .join("\n");

    sections.push(`## Styrkor

Följande dimensioner utmärker sig positivt:

${strengthLines}

${strengths[0].score >= 4.0
    ? "Den höga poängen tyder på väletablerade processer och strategier inom dessa områden."
    : "Dessa områden utgör en bra grund att bygga vidare på."
  }`);
  }

  // --- Förbättringsområden ---
  if (weaknesses.length > 0) {
    const weaknessLines = weaknesses
      .slice(0, 3)
      .map((d) => `- **${d.label}** (${d.score.toFixed(1)}/5.0) — ${d.description}`)
      .join("\n");

    sections.push(`## Förbättringsområden

Följande dimensioner har störst utvecklingspotential:

${weaknessLines}

${weakest.score < 2.0
    ? "Poängen indikerar att grundläggande strukturer saknas inom dessa områden och bör prioriteras."
    : "Med riktade insatser kan dessa områden stärkas avsevärt."
  }`);
  }

  // --- Rekommenderade åtgärder ---
  sections.push(`## Rekommenderade åtgärder

${getRecommendations(level, weakest.label, strongest.label)}`);

  // --- Nästa mognadsnivå ---
  if (nextLevel) {
    sections.push(`## Vägen till nästa nivå

För att nå nivå **${nextLevel.level} — ${nextLevel.name}** behöver organisationen:

${getNextLevelSteps(level, weakest.label)}

*${nextLevel.description}*`);
  } else {
    sections.push(`## Att bibehålla toppnivån

Organisationen befinner sig på den högsta mognadsnivån. För att bibehålla denna position:

1. Fortsätt systematisk utvärdering och uppföljning
2. Dela kunskap och best practices med andra organisationer
3. Håll er uppdaterade kring nya trender och regelverk
4. Investera i kontinuerlig kompetensutveckling`);
  }

  // Footer
  sections.push(
    `---
*Denna analys är automatiskt genererad baserat på enkätsvaren. För en djupare AI-driven analys, kontrollera att en AI-nyckel (ANTHROPIC_API_KEY) är konfigurerad.*`,
  );

  return sections.join("\n\n");
}

/* ------------------------------------------------------------------ */
/*  Nivåspecifika rekommendationer                                      */
/* ------------------------------------------------------------------ */

function getRecommendations(
  level: number,
  weakestDim: string,
  strongestDim: string,
): string {
  if (level <= 2) {
    return `Baserat på mognadsnivån rekommenderas dessa prioriteringar:

1. **Etablera en grundläggande strategi** — Formulera en tydlig vision och mål som förankras i ledningen. Utan en gemensam riktning riskerar insatser att bli fragmenterade.
2. **Stärk ${weakestDim}** — Detta är det svagaste området och bör prioriteras. Börja med en nulägesanalys och identifiera konkreta första steg.
3. **Bygg kompetens** — Investera i utbildning och medvetandehöjande aktiviteter för att skapa engagemang och förståelse i organisationen.
4. **Dra nytta av ${strongestDim}** — Använd erfarenheterna från detta starkaste område som inspiration och modell för övriga dimensioner.`;
  }

  if (level === 3) {
    return `Organisationen har en solid grund. Nästa steg handlar om att standardisera och integrera:

1. **Standardisera processer** — Gå från pilotprojekt och enskilda initiativ till organisationsövergripande standarder och rutiner.
2. **Fokusera på ${weakestDim}** — Detta område släpar efter och behöver ett strukturerat förbättringsarbete med tydliga mål och ansvar.
3. **Mät och följ upp** — Inför nyckeltal och regelbunden uppföljning för att säkerställa att framsteg görs och att insatser ger effekt.
4. **Integrera i styrningen** — Se till att mognadsutvecklingen är en del av den ordinarie verksamhetsstyrningen, inte ett sidoprojekt.`;
  }

  // level 4-5
  return `Organisationen är långt framme. Fokusera på optimering och innovation:

1. **Optimera och automatisera** — Identifiera områden där ytterligare effektivisering är möjlig, särskilt inom ${weakestDim} som har mest potential.
2. **Driv innovation** — Utforska nya möjligheter och teknologier som kan ta organisationen till nästa nivå. Bygg på styrkorna inom ${strongestDim}.
3. **Dela kunskap** — Sprid best practices internt och externt. Mentorskap och kunskapsdelning stärker hela organisationen.
4. **Framtidssäkra** — Håll er uppdaterade kring nya regelverk, trender och teknologier som kan påverka er verksamhet.`;
}

/* ------------------------------------------------------------------ */
/*  Steg för att nå nästa nivå                                          */
/* ------------------------------------------------------------------ */

function getNextLevelSteps(currentLevel: number, weakestDim: string): string {
  if (currentLevel === 1) {
    return `1. Formulera en övergripande strategi med tydliga mål
2. Utse ansvariga och skapa en grundläggande organisation
3. Identifiera och starta 2-3 pilotprojekt
4. Påbörja kompetensuppbyggnad, särskilt inom **${weakestDim}**`;
  }

  if (currentLevel === 2) {
    return `1. Skapa formella processer och rutiner baserat på erfarenheter från pilotprojekt
2. Förankra strategin i ledningsgruppen och koppla till verksamhetsmålen
3. Investera i systematisk kompetensuppbyggnad
4. Stärk det svagaste området — **${weakestDim}** — med dedikerade resurser`;
  }

  if (currentLevel === 3) {
    return `1. Integrera fullt i kärnverksamheten — gå från separata projekt till inbäddad kapacitet
2. Inför systematisk mätning och uppföljning med nyckeltal
3. Etablera governance-strukturer och tydligt ägarskap
4. Höj nivån inom **${weakestDim}** för en jämnare mognadsprofil`;
  }

  // level 4
  return `1. Driv strategisk innovation och utforska nya tillämpningsområden
2. Etablera organisationen som ledande — dela kunskap och best practices
3. Optimera kontinuerligt med datadrivna insikter
4. Säkerställ att **${weakestDim}** når samma höga nivå som övriga dimensioner`;
}
