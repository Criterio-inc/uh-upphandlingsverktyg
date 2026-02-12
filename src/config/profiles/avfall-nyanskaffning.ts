import type { ProfileConfig } from "@/types/workflow";

export const avfallNyanskaffning: ProfileConfig = {
  id: "avfall_nyanskaffning",
  label: "Avfall – nyanskaffning",
  description:
    "Nyanskaffning av verksamhetssystem för avfallshantering. Fokus på kundinformation, logistik, fakturering och digitala tjänster.",
  clusters: {
    need: [
      "Kund & abonnemang",
      "Taxa & fakturering",
      "Logistik/insamling",
      "ÅVC",
      "Digitala tjänster",
      "Integrationer",
      "Data & rapportering",
      "Data & exit",
    ],
    requirement: [
      "Kund & abonnemang",
      "Taxa & fakturering",
      "Logistik/insamling",
      "ÅVC",
      "Digitala tjänster",
      "Integrationer",
      "Data & rapportering",
      "Data & exit",
    ],
    risk: [
      "Verksamhetsrisker",
      "Tekniska risker",
      "Juridiska risker",
      "Leveransrisker",
      "Säkerhetsrisker",
      "Ekonomiska risker",
      "Data & exit",
    ],
  },
  extraGates: {
    B_forbered: [
      {
        id: "B_avfall_clusters",
        label: "Behov finns i minst 4 kluster",
        rule: "needs.distinctClusters>=4",
        severity: "warning",
        helpText: "Avfallsverksamhet spänner över många områden (kund, taxa, logistik, ÅVC, digitalt, integration, data). Behov i minst 4 kluster säkerställer att kravbilden inte missar hela funktionsområden.",
      },
    ],
  },
  workshopTemplates: [
    "behovsworkshop_generisk",
    "kundresa_sjalvservice",
    "taxelogik_fakturering",
    "rutt_faltarbete",
    "rapportering",
    "exit_migrering",
  ],
  requirementBlocks: [
    "kravblock_data_exit",
    "kravblock_avfall_kundregister",
    "kravblock_avfall_taxa",
    "kravblock_avfall_rutt",
    "kravblock_avfall_gis",
    "kravblock_avfall_dataexport",
  ],
};
