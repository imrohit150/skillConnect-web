import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <div className="bg-brand absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-15 blur-3xl" />
      <span className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-accent">
        <span className="bg-brand flex size-14 items-center justify-center rounded-full text-white shadow-lg shadow-cyan-500/30">
          <Icon className="size-7" />
        </span>
      </span>
      <h2 className="relative text-xl font-bold">{title}</h2>
      {description && (
        <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
