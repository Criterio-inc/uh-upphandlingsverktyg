"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if tooltip goes off-screen and adjust
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > viewportWidth) {
      tooltip.style.left = "auto";
      tooltip.style.right = "0";
    }
    if (rect.left < 0) {
      tooltip.style.left = "0";
      tooltip.style.right = "auto";
    }
    if (rect.top < 0 && side === "top") {
      tooltip.style.top = "100%";
      tooltip.style.bottom = "auto";
      tooltip.style.marginTop = "4px";
    }
    if (rect.bottom > viewportHeight && side === "bottom") {
      tooltip.style.bottom = "100%";
      tooltip.style.top = "auto";
      tooltip.style.marginBottom = "4px";
    }
  }, [visible, side]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children ?? <InfoIcon />}
      {visible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "absolute z-50 w-64 rounded-md border border-border bg-foreground px-3 py-2 text-xs text-background shadow-lg",
            "pointer-events-none animate-in fade-in-0 zoom-in-95",
            positionClasses[side]
          )}
        >
          {content}
        </div>
      )}
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}
