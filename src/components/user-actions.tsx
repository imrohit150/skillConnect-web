"use client";

import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { usePassUser, useSendRequest } from "@/hooks/use-connections";
import type { PublicUser } from "@/types";

type UserActionsProps = {
  user: PublicUser;
  onDone?: () => void;
};

export function UserActions({ user, onDone }: UserActionsProps) {
  const send = useSendRequest();
  const pass = usePassUser();
  const busy = send.isPending || pass.isPending;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          send.mutate(user._id, {
            onSuccess: () => {
              toast.success(`Request sent to ${user.name}`);
              onDone?.();
            },
            onError: (e) => toast.error(e.message),
          })
        }
        className="bg-brand flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Connect
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          pass.mutate(user._id, {
            onSuccess: () => onDone?.(),
            onError: (e) => toast.error(e.message),
          })
        }
        className="flex h-11 cursor-pointer items-center justify-center rounded-xl border bg-white/80 px-5 text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pass.isPending ? <Loader2 className="size-4 animate-spin" /> : "Pass"}
      </button>
    </div>
  );
}
