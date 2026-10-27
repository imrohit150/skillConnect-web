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
        "glass relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border bg-card px-4 py-6 text-center sm:rounded-3xl sm:px-6 sm:py-14",
        className,
      )}
    >
      <div className="bg-brand absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-15 blur-3xl" />
      <span className="relative mb-3 flex size-14 shrink-0 items-center justify-center rounded-full bg-accent sm:mb-6 sm:size-20">
        <span className="bg-brand flex size-10 items-center justify-center rounded-full text-white shadow-lg shadow-cyan-500/30 sm:size-14">
          <Icon className="size-5 sm:size-7" />
        </span>
      </span>
      <h2 className="relative text-base font-bold sm:text-xl">{title}</h2>
      {description && (
        <p className="relative mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="relative mt-4 sm:mt-6">{action}</div>}
    </div>
  );
}
