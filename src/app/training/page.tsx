"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

interface CourseInfo {
  id: string;
  title: string;
  icon: string;
  description: string;
  modules: number;
  estimatedMinutes: number;
  level: "Grundläggande" | "Medel" | "Avancerad";
  tags: string[];
}

const COURSES: CourseInfo[] = [
  {
    id: "upphandling-lou",
    title: "Upphandling & LOU",
    icon: "scale",
    description:
      "Grunderna i Lagen om offentlig upphandling — tröskelvärden, förfaranden, annonsering, utvärdering och tilldelning.",
    modules: 8,
    estimatedMinutes: 45,
    level: "Grundläggande",
    tags: ["LOU", "Offentlig upphandling", "Juridik"],
  },
  {
    id: "kravhantering",
    title: "Kravhantering",
    icon: "ruler",
    description:
      "Från behov till kravspecifikation — behovsanalys, funktionella vs icke-funktionella krav, kravspårbarhet och verifiering.",
    modules: 6,
    estimatedMinutes: 35,
    level: "Medel",
    tags: ["Krav", "Specifikation", "Spårbarhet"],
  },
  {
    id: "formagabedomning",
    title: "Förmågebedömning",
    icon: "gauge",
    description:
      "Utvärdera förmågor inom människa, teknik och process — mognadsmodeller, gap-analys, handlingsplaner.",
    modules: 5,
    estimatedMinutes: 30,
    level: "Medel",
    tags: ["Förmåga", "Människa", "Teknik", "Process"],
  },
  {
    id: "systemforvaltning",
    title: "Systemförvaltning",
    icon: "server-cog",
    description:
      "Strukturerad IT-förvaltning — förvaltningsobjekt, roller, budgetering, livscykelhantering och pm3-inspirerat arbetssätt.",
    modules: 6,
    estimatedMinutes: 40,
    level: "Medel",
    tags: ["Förvaltning", "IT", "Livscykel"],
  },
  {
    id: "forandringsledning-adkar",
    title: "Förändringsledning ADKAR",
    icon: "repeat",
    description:
      "Prosci ADKAR-modellen steg för steg — Awareness, Desire, Knowledge, Ability, Reinforcement — med praktiska verktyg.",
    modules: 7,
    estimatedMinutes: 50,
    level: "Grundläggande",
    tags: ["ADKAR", "Förändring", "Prosci"],
  },
];

function getLevelColor(level: CourseInfo["level"]) {
  switch (level) {
    case "Grundläggande":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "Medel":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "Avancerad":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  }
}

export default function TrainingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <nav className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Link
              href="/cases"
              className="hover:text-primary transition-colors duration-150"
            >
              Upphandlingar
            </Link>
            <span className="mx-0.5 text-border">/</span>
            <span className="text-foreground font-medium">Utbildning</span>
          </nav>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Utbildning
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Stärk din kompetens inom upphandling och verksamhetsutveckling
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  name="graduation-cap"
                  size={20}
                  className="text-primary"
                />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="book-open" size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Kurser</p>
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {COURSES.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                  <Icon
                    name="clipboard-list"
                    size={15}
                    className="text-muted-foreground"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Totalt moduler
                  </p>
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {COURSES.reduce((sum, c) => sum + c.modules, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                  <Icon
                    name="clock"
                    size={15}
                    className="text-muted-foreground"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Total tid</p>
                  <p className="font-semibold text-sm text-foreground leading-tight">
                    ca{" "}
                    {COURSES.reduce((sum, c) => sum + c.estimatedMinutes, 0)}{" "}
                    min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course grid */}
      <div className="px-8 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <Link
              key={course.id}
              href={`/training/${course.id}`}
              className="group block"
            >
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 h-full flex flex-col">
                {/* Icon + level */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon
                      name={course.icon}
                      size={20}
                      className="text-primary"
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${getLevelColor(course.level)}`}
                  >
                    {course.level}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                  {course.description}
                </p>

                {/* Meta: modules + time */}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="book-open" size={12} />
                    {course.modules} moduler
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="clock" size={12} />
                    ca {course.estimatedMinutes} min
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
