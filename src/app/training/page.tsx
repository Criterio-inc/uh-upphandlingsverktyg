"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  COURSE_LIST,
  TOTAL_MODULES,
  TOTAL_MINUTES,
} from "@/config/courses/index";
import type { AcademyProgress } from "@/config/courses/types";
import {
  loadAcademyProgress,
  getCourseCompletionPct,
  getTotalCompletedModules,
  getCompletedCourseCount,
} from "@/lib/academy-progress";
import { FeatureGate } from "@/components/feature-gate";

function getLevelColor(level: string) {
  switch (level) {
    case "Grundläggande":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "Medel":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "Avancerad":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function TrainingPage() {
  const [progress, setProgress] = useState<AcademyProgress>({ courses: {} });

  useEffect(() => {
    setProgress(loadAcademyProgress());
  }, []);

  // Bygg moduleIds-map för alla kurser
  const courseModuleMap: Record<string, string[]> = {};
  for (const course of COURSE_LIST) {
    courseModuleMap[course.id] = course.modules.map((m) => m.id);
  }

  const totalCompleted = getTotalCompletedModules(progress, courseModuleMap);
  const completedCourses = getCompletedCourseCount(progress, courseModuleMap);

  return (
    <FeatureGate featureKey="upphandling.training">
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
                Upphandlingsakademin
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
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="book-open" size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Kurser</p>
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {COURSE_LIST.length}
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
                    Moduler klara
                  </p>
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {totalCompleted}/{TOTAL_MODULES}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                  <Icon
                    name="trophy"
                    size={15}
                    className="text-muted-foreground"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Kurser avslutade
                  </p>
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {completedCourses}/{COURSE_LIST.length}
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
                    ca {TOTAL_MINUTES} min
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
          {COURSE_LIST.map((course) => {
            const moduleIds = course.modules.map((m) => m.id);
            const pct = getCourseCompletionPct(progress, course.id, moduleIds);

            return (
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

                  {/* Progress bar */}
                  {pct > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Framsteg</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta: modules + time */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="book-open" size={12} />
                      {course.modules.length} moduler
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
            );
          })}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
