"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            activeTab === tab.id
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon && <span className="text-xs">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}

export function TabPanel({ children, active, className }: TabPanelProps) {
  if (!active) return null;
  return <div className={cn("py-4", className)}>{children}</div>;
}
