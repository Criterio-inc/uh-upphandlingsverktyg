// ============================================================
// Library types
// ============================================================

export type LibraryItemType =
  | "requirement_block"
  | "risk_template"
  | "workshop_template"
  | "criteria_block"
  | "contract_clause"
  | "phase_checklist";

export interface LibraryItemContent {
  /** For requirement_block: array of requirement templates */
  requirements?: RequirementTemplate[];
  /** For risk_template: risk template data */
  risk?: RiskTemplate;
  /** For workshop_template: workshop template data */
  workshop?: WorkshopTemplate;
  /** For criteria_block: array of criterion templates */
  criteria?: CriterionTemplate[];
  /** For contract_clause: contract clause data */
  clause?: ContractClauseTemplate;
  /** For phase_checklist: checklist items */
  checklist?: PhaseChecklistTemplate;
}

export interface RequirementTemplate {
  title: string;
  reqType: string;
  level: string;
  text: string;
  rationale: string;
  cluster: string;
  verification?: {
    bidEvidence?: string;
    implementationProof?: string;
    opsFollowUp?: string;
  };
}

export interface RiskTemplate {
  title: string;
  category: string;
  description: string;
  likelihood: number;
  impact: number;
  mitigation: string;
}

export interface WorkshopTemplate {
  title: string;
  description: string;
  suggestedParticipants: string[];
  agenda: string[];
  expectedOutputs: string[];
  duration: string;
}

export interface CriterionTemplate {
  title: string;
  weight: number;
  scale: string;
  scoringGuidance: string;
  anchors?: Record<string, string>;
  linkedRequirementClusters?: string[];
}

export interface ContractClauseTemplate {
  title: string;
  text: string;
  rationale: string;
  cluster: string;
  level: string;
}

export interface PhaseChecklistTemplate {
  phase: string;
  items: {
    title: string;
    description: string;
    required: boolean;
  }[];
}
