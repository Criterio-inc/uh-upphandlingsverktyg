/* ------------------------------------------------------------------ */
/*  App keys — top-level toggles for entire app sections               */
/* ------------------------------------------------------------------ */

export const APP_KEYS = [
  "upphandling",
  "verktyg",
  "mognadmatning",
  "ai-mognadmatning",
] as const;

export type AppKey = (typeof APP_KEYS)[number];

/* ------------------------------------------------------------------ */
/*  Feature keys                                                       */
/* ------------------------------------------------------------------ */

export type FeatureKey =
  // App master toggles
  | "upphandling"
  | "verktyg"
  | "mognadmatning"
  | "ai-mognadmatning"
  // Upphandling sub-features
  | "upphandling.cases"
  | "upphandling.library"
  | "upphandling.training"
  | "upphandling.help"
  // Verktyg sub-features
  | "verktyg.benefit-calculator"
  | "verktyg.risk-matrix"
  | "verktyg.evaluation-model"
  | "verktyg.timeline-planner"
  | "verktyg.stakeholder-map"
  | "verktyg.kunskapsbank"
  | "verktyg.root-cause"
  | "verktyg.benefit-effort"
  | "verktyg.process-flow"
  | "verktyg.adkar"
  | "verktyg.force-field"
  // Mognadsmätning sub-features
  | "mognadmatning.survey"
  | "mognadmatning.results"
  // AI-Mognadsmätning sub-features
  | "ai-mognadmatning.survey"
  | "ai-mognadmatning.results";

/**
 * No features are "always on" anymore.
 * Everything is controlled by organization plan + org-level overrides.
 * @deprecated — kept temporarily for backwards compat; will be removed
 */
export const ALWAYS_ON: readonly string[] = [];

/** Human-readable labels for each toggleable feature */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  upphandling: "Upphandling",
  verktyg: "Verktyg",
  mognadmatning: "Digital Mognadsmätning",
  "ai-mognadmatning": "AI-Mognadsmätning",
  "upphandling.cases": "Upphandlingsärenden",
  "upphandling.library": "Bibliotek",
  "upphandling.training": "Utbildning",
  "upphandling.help": "Hjälpcenter",
  "verktyg.benefit-calculator": "Nyttokalkyl",
  "verktyg.risk-matrix": "Riskmatris",
  "verktyg.evaluation-model": "Utvärderingsmodell",
  "verktyg.timeline-planner": "Tidslinjeplanerare",
  "verktyg.stakeholder-map": "Intressentanalys",
  "verktyg.kunskapsbank": "Kunskapsbank",
  "verktyg.root-cause": "Orsaksanalys",
  "verktyg.benefit-effort": "Nytto-insats",
  "verktyg.process-flow": "Processflöde",
  "verktyg.adkar": "ADKAR Förändring",
  "verktyg.force-field": "Kraftfältsanalys",
  "mognadmatning.survey": "Ny mätning",
  "mognadmatning.results": "Projekt & resultat",
  "ai-mognadmatning.survey": "Ny AI-mätning",
  "ai-mognadmatning.results": "Projekt & resultat",
};

/** Icon names matching the sidebar icon for each feature */
export const FEATURE_ICONS: Record<FeatureKey, string> = {
  upphandling: "clipboard-list",
  verktyg: "wrench",
  mognadmatning: "bar-chart-3",
  "ai-mognadmatning": "brain",
  "upphandling.cases": "clipboard-list",
  "upphandling.library": "library",
  "upphandling.training": "graduation-cap",
  "upphandling.help": "help-circle",
  "verktyg.benefit-calculator": "calculator",
  "verktyg.risk-matrix": "shield-alert",
  "verktyg.evaluation-model": "scale",
  "verktyg.timeline-planner": "clock",
  "verktyg.stakeholder-map": "users",
  "verktyg.kunskapsbank": "book-open",
  "verktyg.root-cause": "search",
  "verktyg.benefit-effort": "target",
  "verktyg.process-flow": "git-branch",
  "verktyg.adkar": "refresh-cw",
  "verktyg.force-field": "git-merge",
  "mognadmatning.survey": "plus-circle",
  "mognadmatning.results": "folder",
  "ai-mognadmatning.survey": "plus-circle",
  "ai-mognadmatning.results": "folder",
};

/** Ordered list of all feature keys for consistent UI rendering */
export const ALL_FEATURE_KEYS: FeatureKey[] = [
  // App master toggles
  "upphandling",
  "verktyg",
  "mognadmatning",
  "ai-mognadmatning",
  // Upphandling
  "upphandling.cases",
  "upphandling.library",
  "upphandling.training",
  "upphandling.help",
  // Verktyg
  "verktyg.benefit-calculator",
  "verktyg.risk-matrix",
  "verktyg.evaluation-model",
  "verktyg.timeline-planner",
  "verktyg.stakeholder-map",
  "verktyg.kunskapsbank",
  "verktyg.root-cause",
  "verktyg.benefit-effort",
  "verktyg.process-flow",
  "verktyg.adkar",
  "verktyg.force-field",
  // Mognadsmätning
  "mognadmatning.survey",
  "mognadmatning.results",
  // AI-Mognadsmätning
  "ai-mognadmatning.survey",
  "ai-mognadmatning.results",
];

/**
 * Get the parent app key for a feature key.
 * Returns undefined for app-level keys.
 */
export function getAppKeyForFeature(key: FeatureKey): AppKey | undefined {
  for (const appKey of APP_KEYS) {
    if (key !== appKey && key.startsWith(appKey + ".")) {
      return appKey;
    }
  }
  return undefined;
}

/**
 * Check if a feature is effectively enabled, considering cascade logic.
 * If the parent app is disabled, all sub-features are disabled.
 */
export function isEffectivelyEnabled(
  features: Record<string, boolean>,
  key: FeatureKey,
): boolean {
  // Check if the feature itself is disabled
  if (features[key] === false) return false;

  // Check parent app cascade
  const appKey = getAppKeyForFeature(key);
  if (appKey && features[appKey] === false) return false;

  return true;
}

/* ------------------------------------------------------------------ */
/*  Route → Feature mapping                                            */
/* ------------------------------------------------------------------ */

/** Map a route path to its feature key. Returns undefined for public routes. */
export function routeToFeatureKey(pathname: string): FeatureKey | undefined {
  // Verktyg
  if (pathname.startsWith("/tools/benefit-calculator")) return "verktyg.benefit-calculator";
  if (pathname.startsWith("/tools/risk-matrix")) return "verktyg.risk-matrix";
  if (pathname.startsWith("/tools/evaluation-model")) return "verktyg.evaluation-model";
  if (pathname.startsWith("/tools/timeline-planner")) return "verktyg.timeline-planner";
  if (pathname.startsWith("/tools/stakeholder-map")) return "verktyg.stakeholder-map";
  if (pathname.startsWith("/tools/kunskapsbank")) return "verktyg.kunskapsbank";
  if (pathname.startsWith("/tools/root-cause")) return "verktyg.root-cause";
  if (pathname.startsWith("/tools/benefit-effort")) return "verktyg.benefit-effort";
  if (pathname.startsWith("/tools/process-flow")) return "verktyg.process-flow";
  if (pathname.startsWith("/tools/adkar")) return "verktyg.adkar";
  if (pathname.startsWith("/tools/force-field")) return "verktyg.force-field";
  // Upphandling
  if (pathname.startsWith("/training")) return "upphandling.training";
  if (pathname.startsWith("/cases")) return "upphandling.cases";
  if (pathname.startsWith("/library")) return "upphandling.library";
  if (pathname.startsWith("/help")) return "upphandling.help";
  // Mognadsmätning
  if (pathname.startsWith("/mognadmatning")) return "mognadmatning";
  // AI-Mognadsmätning
  if (pathname.startsWith("/ai-mognadmatning")) return "ai-mognadmatning";
  return undefined;
}
