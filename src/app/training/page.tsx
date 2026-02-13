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
  level: "Grundl\u00e4ggande" | "Medel" | "Avancerad";
  tags: string[];
}

const COURSES: CourseInfo[] = [
  {
    id: "upphandling-lou",
    title: "Upphandling & LOU",
    icon: "scale",
    description:
      "Grunderna i Lagen om offentlig upphandling \u2014 tr\u00f6skelv\u00e4rden, f\u00f6rfaranden, annonsering, utv\u00e4rdering och tilldelning.",
    modules: 8,
    estimatedMinutes: 45,
    level: "Grundl\u00e4ggande",
    tags: ["LOU", "Offentlig upphandling", "Juridik"],
  },
  {
    id: "kravhantering",
    title: "Kravhantering",
    icon: "ruler",
    description:
      "Fr\u00e5n behov till kravspecifikation \u2014 behovsanalys, funktionella vs icke-funktionella krav, kravsp\u00e5rbarhet och verifiering.",
    modules: 6,
    estimatedMinutes: 35,
    level: "Medel",
    tags: ["Krav", "Specifikation", "Sp\u00e5rbarhet"],
  },
  {
    id: "formagabedomning",
    title: "F\u00f6rm\u00e5gebed\u00f6mning",
    icon: "gauge",
    description:
      "Utv\u00e4rdera f\u00f6rm\u00e5gor inom m\u00e4nniska, teknik och process \u2014 mognadsmodeller, gap-analys, handlingsplaner.",
    modules: 5,
    estimatedMinutes: 30,
    level: "Medel",
    tags: ["F\u00f6rm\u00e5ga", "M\u00e4nniska", "Teknik", "Process"],
  },
  {
    id: "systemforvaltning",
    title: "Systemf\u00f6rvaltning",
    icon: "server-cog",
    description:
      "Strukturerad IT-f\u00f6rvaltning \u2014 f\u00f6rvaltningsobjekt, roller, budgetering, livscykelhantering och pm3-inspirerat arbetss\u00e4tt.",
    modules: 6,
    estimatedMinutes: 40,
    level: "Medel",
    tags: ["F\u00f6rvaltning", "IT", "Livscykel"],
  },
  {
    id: "forandringsledning-adkar",
    title: "F\u00f6r\u00e4ndringsledning ADKAR",
    icon: "repeat",
    description:
      "Prosci ADKAR-modellen steg f\u00f6r steg \u2014 Awareness, Desire, Knowledge, Ability, Reinforcement \u2014 med praktiska verktyg.",
    modules: 7,
    estimatedMinutes: 50,
    level: "Grundl\u00e4ggande",
    tags: ["ADKAR", "F\u00f6r\u00e4ndring", "Prosci"],
  },
];

function getLevelColor(level: CourseInfo["level"]) {
  switch (level) {
    case "Grundl\u00e4ggande":
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
                St\u00e4rk din kompetens inom upphandling och verksamhetsutveckling
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
