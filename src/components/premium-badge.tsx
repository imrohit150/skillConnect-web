import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span title="Premium member" className={cn("inline-flex shrink-0 items-center", className)}>
      <BadgeCheck aria-hidden="true" className="size-5 fill-sky-500 text-white" />
      <span className="sr-only">Premium member</span>
    </span>
  );
}
