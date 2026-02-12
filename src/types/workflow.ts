// ============================================================
// Workflow & phase types
// ============================================================

export interface PhaseConfig {
  id: string;
  label: string;
  description: string;
  subPhases: SubPhase[];
  gates: GateRule[];
}

export interface SubPhase {
  id: string;
  label: string;
  description: string;
}

export interface GateRule {
  id: string;
  label: string;
  rule: string; // e.g. "needs.count>=5", evaluated by gate engine
  severity: "blocker" | "warning";
  helpText?: string;
}

export interface GateResult {
  ruleId: string;
  label: string;
  passed: boolean;
  severity: "blocker" | "warning";
  actual?: string | number;
  expected?: string | number;
  helpText?: string;
}

export interface PhaseStatus {
  phaseId: string;
  label: string;
  gateResults: GateResult[];
  allBlockersPassed: boolean;
  allWarningsPassed: boolean;
  completionPercent: number;
}

export interface ProfileConfig {
  id: string;
  label: string;
  description: string;
  /** Extra phases injected into the base phase chain */
  extraPhases?: PhaseConfig[];
  /** Where to insert extra phases (before which base phase) */
  insertBefore?: Record<string, string>;
  /** Clusters per entity type */
  clusters: Record<string, string[]>;
  /** Extra gate rules per phase */
  extraGates?: Record<string, GateRule[]>;
  /** Required risk categories */
  requiredRiskCategories?: string[];
  /** Workshop templates available */
  workshopTemplates?: string[];
  /** Requirement block templates available */
  requirementBlocks?: string[];
}

export interface WorkflowConfig {
  phases: PhaseConfig[];
  clusters: Record<string, string[]>;
  gatesByPhase: Record<string, GateRule[]>;
}
