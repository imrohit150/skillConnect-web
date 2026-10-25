import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-brand flex size-10 items-center justify-center rounded-xl font-[family-name:sans-serif] text-lg font-bold text-white shadow-lg shadow-cyan-500/30">
        S
      </span>
      <span className="font-[family-name:sans-serif] text-xl font-semibold tracking-tight">
        skill<span className="text-gradient">connect</span>
      </span>
    </Link>
  );
}
