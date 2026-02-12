import type { PhaseConfig, ProfileConfig } from "@/types/workflow";

const exitPhase: PhaseConfig = {
  id: "B0_exit_migrering_forstudie",
  label: "B0. Exit & migrering – förstudie",
  description:
    "Kartlägg befintligt system, datamodell och migreringsvägar innan kravdesign.",
  subPhases: [
    {
      id: "B0_1_systeminventering",
      label: "B0.1 Systeminventering",
      description: "Kartlägg befintligt systems funktionalitet, integrationer och data",
    },
    {
      id: "B0_2_dataanalys",
      label: "B0.2 Dataanalys",
      description: "Analysera datamodell, volymer, kvalitet och beroenden",
    },
    {
      id: "B0_3_migreringsplan",
      label: "B0.3 Migreringsplan",
      description: "Strategi för datamigrering, test och rollback",
    },
  ],
  gates: [
    {
      id: "B0_exit_risk",
      label: "Data/exit-risk identifierad",
      rule: "risks.hasCategory(data_exit)",
      severity: "blocker",
      helpText: "Vid systembyte är datamigrering den största risken. Identifiera minst en risk i kategorin 'Data & exit' som adresserar dataförlust, inkompatibla format eller leverantörsinlåsning.",
    },
    {
      id: "B0_exit_evidence",
      label: "Systeminventering dokumenterad",
      rule: "evidence.count>=1",
      severity: "warning",
      helpText: "Innan kravdesign påbörjas behöver det befintliga systemets funktionalitet, integrationer och datamodell vara kartlagda. Dokumentera som evidens.",
    },
  ],
};

export const socialtjanstByte: ProfileConfig = {
  id: "socialtjanst_byte",
  label: "Socialtjänst – byte",
  description:
    "Byte av verksamhetssystem för socialtjänst/vård & omsorg/kommunal HSL. Fokus på rättssäkerhet, behörighet, loggning och migrering/exit.",
  extraPhases: [exitPhase],
  insertBefore: { B0_exit_migrering_forstudie: "B_forbered" },
  clusters: {
    need: [
      "Ärende/process",
      "Dokumentation & spårbarhet",
      "Behörighet & loggning",
      "Planering/insatser/utförande",
      "Integrationer",
      "Migrering/exit",
      "Rapportering",
      "Data & exit",
    ],
    requirement: [
      "Ärende/process",
      "Dokumentation & spårbarhet",
      "Behörighet & loggning",
      "Planering/insatser/utförande",
      "Integrationer",
      "Migrering/exit",
      "Rapportering",
      "Data & exit",
    ],
    risk: [
      "Verksamhetsrisker",
      "Tekniska risker",
      "Juridiska risker",
      "Leveransrisker",
      "Säkerhetsrisker",
      "Ekonomiska risker",
      "Förändringsrisker",
      "Data & exit",
    ],
  },
  extraGates: {
    B_forbered: [
      {
        id: "B_social_data_exit_risk",
        label: "Data/exit-risk kopplad till krav",
        rule: "risks.dataExitLinkedToRequirement",
        severity: "blocker",
        helpText: "Socialtjänstdata (ärenden, journaler, genomförandeplaner) är känslig och ofta komplex. Exit-risker MÅSTE resultera i krav som säkerställer att data kan migreras rättssäkert.",
      },
      {
        id: "B_social_stakeholders",
        label: "Minst 5 intressenter (byte kräver fler)",
        rule: "stakeholders.count>=5",
        severity: "warning",
        helpText: "Systembyten i socialtjänsten berör många: handläggare, enhetschefer, IT, dataskyddsombud, brukare/klienter. Minst 5 intressenter behövs för representativ behovsanalys.",
      },
    ],
  },
  requiredRiskCategories: ["data_exit"],
  workshopTemplates: [
    "behovsworkshop_generisk",
    "rattsakra_floden",
    "behorighet_loggning",
    "exit_migrering",
  ],
  requirementBlocks: [
    "kravblock_data_exit",
    "kravblock_social_behorighet",
    "kravblock_social_loggning",
    "kravblock_social_migrering",
    "kravblock_social_sparbarhet",
    "kravblock_social_dataexport",
  ],
};
