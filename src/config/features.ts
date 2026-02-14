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
  | "upphandling.training"
  // Verktyg sub-features
  | "verktyg.benefit-calculator"
  | "verktyg.risk-matrix"
  | "verktyg.evaluation-model"
  | "verktyg.timeline-planner"
  | "verktyg.stakeholder-map"
  | "verktyg.kunskapsbank";

/** Features that are always active and cannot be toggled off */
export const ALWAYS_ON = ["cases", "library", "help"] as const;

/** Human-readable labels for each toggleable feature */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  upphandling: "Upphandling",
  verktyg: "Verktyg",
  mognadmatning: "Digital Mognadsmätning",
  "ai-mognadmatning": "AI-Mognadsmätning",
  "upphandling.training": "Utbildning",
  "verktyg.benefit-calculator": "Nyttokalkyl",
  "verktyg.risk-matrix": "Riskmatris",
  "verktyg.evaluation-model": "Utvärderingsmodell",
  "verktyg.timeline-planner": "Tidslinjeplanerare",
  "verktyg.stakeholder-map": "Intressentanalys",
  "verktyg.kunskapsbank": "Kunskapsbank",
};

/** Icon names matching the sidebar icon for each feature */
export const FEATURE_ICONS: Record<FeatureKey, string> = {
  upphandling: "clipboard-list",
  verktyg: "wrench",
  mognadmatning: "bar-chart-3",
  "ai-mognadmatning": "brain",
  "upphandling.training": "graduation-cap",
  "verktyg.benefit-calculator": "calculator",
  "verktyg.risk-matrix": "shield-alert",
  "verktyg.evaluation-model": "scale",
  "verktyg.timeline-planner": "clock",
  "verktyg.stakeholder-map": "users",
  "verktyg.kunskapsbank": "book-open",
};

/** Ordered list of all feature keys for consistent UI rendering */
export const ALL_FEATURE_KEYS: FeatureKey[] = [
  // App master toggles
  "upphandling",
  "verktyg",
  "mognadmatning",
  "ai-mognadmatning",
  // Upphandling
  "upphandling.training",
  // Verktyg
  "verktyg.benefit-calculator",
  "verktyg.risk-matrix",
  "verktyg.evaluation-model",
  "verktyg.timeline-planner",
  "verktyg.stakeholder-map",
  "verktyg.kunskapsbank",
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
/*  Server-side helpers (read/write feature-config.json)               */
/* ------------------------------------------------------------------ */

/** Map a route path to its feature key (if any). Returns undefined for always-on routes. */
export function routeToFeatureKey(pathname: string): FeatureKey | undefined {
  // Verktyg
  if (pathname.startsWith("/tools/benefit-calculator")) return "verktyg.benefit-calculator";
  if (pathname.startsWith("/tools/risk-matrix")) return "verktyg.risk-matrix";
  if (pathname.startsWith("/tools/evaluation-model")) return "verktyg.evaluation-model";
  if (pathname.startsWith("/tools/timeline-planner")) return "verktyg.timeline-planner";
  if (pathname.startsWith("/tools/stakeholder-map")) return "verktyg.stakeholder-map";
  if (pathname.startsWith("/tools/kunskapsbank")) return "verktyg.kunskapsbank";
  // Upphandling
  if (pathname.startsWith("/training")) return "upphandling.training";
  if (pathname.startsWith("/cases")) return "upphandling";
  if (pathname.startsWith("/library")) return "upphandling";
  // Mognadsmätning
  if (pathname.startsWith("/mognadmatning")) return "mognadmatning";
  // AI-Mognadsmätning
  if (pathname.startsWith("/ai-mognadmatning")) return "ai-mognadmatning";
  return undefined;
}
