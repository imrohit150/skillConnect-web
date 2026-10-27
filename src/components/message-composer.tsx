"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

type MessageComposerProps = {
  canSend: boolean;
  otherUserName: string;
  onSend: (content: string) => Promise<Message>;
};

export function MessageComposer({ canSend, otherUserName, onSend }: MessageComposerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendingRef = useRef(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!canSend || sendingRef.current || !draft.trim()) return;
    sendingRef.current = true;
    setIsSending(true);
    setError(null);
    try {
      await onSend(draft);
      setDraft("");
      inputRef.current?.focus();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Couldn’t send your message. Please try again.");
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Send a message" className="shrink-0 space-y-2 border-t bg-white/65 p-3 sm:p-4">
      {error && <p id={`${inputId}-error`} role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive">{error}</p>}
      <div className="flex items-end gap-2 rounded-2xl border bg-white p-2 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <label htmlFor={inputId} className="sr-only">Message to {otherUserName}</label>
        <textarea
          ref={inputRef}
          id={inputId}
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setError(null); }}
          onKeyDown={onKeyDown}
          readOnly={isSending}
          rows={1}
          maxLength={2000}
          aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ""}`}
          placeholder={`Message ${otherUserName}…`}
          className="scroll-thin max-h-40 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 sm:min-h-16 sm:text-sm"
        />
        <Button
          type="submit"
          disabled={!canSend || isSending || !draft.trim()}
          aria-label={isSending ? "Sending message" : "Send message"}
          className="bg-brand size-11 cursor-pointer rounded-xl text-white shadow-md shadow-cyan-500/20 hover:opacity-90"
        >
          {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      <div id={`${inputId}-help`} className="flex items-center justify-between gap-3 px-1 text-[11px] text-muted-foreground">
        <span>{canSend ? "Enter to send · Shift+Enter for a new line" : "Your draft stays here while chat reconnects."}</span>
        <span className={cn("shrink-0 tabular-nums", draft.length === 2000 && "text-primary")}>{draft.length}/2000</span>
      </div>
    </form>
  );
}
