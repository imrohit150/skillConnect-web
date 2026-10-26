"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = React.ComponentProps<"input"> & {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function AuthField({
  label,
  icon: Icon,
  error,
  hint,
  required,
  id,
  type,
  className,
  ...props
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          className={cn(
            "h-12 rounded-xl bg-white/80 pr-4 pl-10 shadow-sm focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
            isPassword && "pr-16",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-3.5 flex -translate-y-1/2 cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary"
          >
            {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
