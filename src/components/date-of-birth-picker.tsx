"use client";

import { useState, type Ref } from "react";
import { format, parseISO, startOfDay, subYears } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateOfBirthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  triggerRef: Ref<HTMLButtonElement>;
  error?: string;
  compact?: boolean;
};

export function DateOfBirthPicker({ value, onChange, onBlur, triggerRef, error, compact = false }: DateOfBirthPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const latestBirthday = subYears(startOfDay(new Date()), 18);
  const earliestBirthday = new Date(1900, 0, 1);

  return (
    <div className={cn("space-y-1.5", compact && "max-sm:space-y-0.5")}>
      <Label htmlFor="dateOfBirth" className={cn("text-[13px] font-semibold", compact && "max-sm:text-xs max-sm:leading-4")}>Date of birth</Label>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) onBlur();
        }}
      >
        <PopoverTrigger
          render={
            <Button
              ref={triggerRef}
              id="dateOfBirth"
              type="button"
              variant="outline"
              aria-invalid={!!error}
              aria-describedby="dateOfBirth-help"
              className={cn(
                "h-12 w-full cursor-pointer justify-start gap-2.5 rounded-xl border-input bg-white/80 px-3.5 text-left font-normal shadow-sm hover:bg-white focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
                !value && "text-muted-foreground",
                open && "border-primary ring-4 ring-primary/15",
                compact && "max-sm:h-11",
              )}
            />
          }
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="flex-1">{selected ? format(selected, "dd MMMM yyyy") : "Select your birthday"}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          collisionAvoidance={{ side: "none", align: "shift", fallbackAxisSide: "none" }}
          className="scroll-thin max-h-[var(--available-height)] w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-primary/15 bg-white p-0 shadow-xl shadow-cyan-950/15 ring-0"
        >
          <div className="flex items-center justify-between gap-3 border-b bg-accent/60 px-4 py-3.5">
            <div>
              <PopoverTitle className="font-semibold">Choose your birthday</PopoverTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Jump to your birth month and year.</p>
            </div>
            <span className="rounded-full border border-primary/15 bg-white px-2.5 py-1 text-xs font-bold text-primary">18+</span>
          </div>
          <Calendar
            mode="single"
            required
            selected={selected}
            defaultMonth={selected ?? latestBirthday}
            captionLayout="dropdown"
            reverseYears
            startMonth={earliestBirthday}
            endMonth={latestBirthday}
            disabled={{ before: earliestBirthday, after: latestBirthday }}
            onSelect={(date) => {
              // Keep the API's date-only format without converting through UTC.
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
              onBlur();
            }}
            autoFocus
            className="w-full p-3 [--cell-size:2.25rem] [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed"
            classNames={{
              dropdown_root: "relative rounded-lg border bg-white px-2 py-1 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
              dropdown: "absolute inset-0 cursor-pointer bg-white opacity-0",
              caption_label: "flex items-center gap-1 text-sm font-semibold [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
              disabled: "text-muted-foreground opacity-30",
            }}
          />
          <p className="border-t bg-background/40 px-4 py-3 text-xs text-muted-foreground">You must be at least 18 years old to join.</p>
        </PopoverContent>
      </Popover>
      <p id="dateOfBirth-help" className={cn("text-xs", compact && "max-sm:text-[11px] max-sm:leading-4", error ? "text-destructive" : "text-muted-foreground")}>
        {error || "You must be at least 18 years old."}
      </p>
    </div>
  );
}
