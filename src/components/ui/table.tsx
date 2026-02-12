import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-2xl border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_0_1px_0_rgba(255,255,255,0.5)_inset]">
      <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return <thead className={cn("border-b border-border/60 bg-muted/30", className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn("border-b border-border/40 transition-colors hover:bg-accent/50", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
