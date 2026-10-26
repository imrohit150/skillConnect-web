"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

type TagInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  required?: boolean;
};

export function TagInput({ id, label, placeholder, value, onChange, max = 30, required }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim().slice(0, 50);
    if (tag && value.length < max && !value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border bg-white/80 p-2 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-[family-name:var(--font-mono-code)] text-xs text-accent-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          className="min-w-32 flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add.</p>
    </div>
  );
}
