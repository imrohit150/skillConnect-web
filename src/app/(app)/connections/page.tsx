"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Loader2, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RequestCard } from "@/components/request-card";
import { UserDrawer } from "@/components/user-drawer";
import { useConnections, useRemoveConnection } from "@/hooks/use-connections";
import type { Connection } from "@/types";

export default function ConnectionsPage() {
  const { data, isPending, error } = useConnections();
  const remove = useRemoveConnection();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = data?.find((c) => c.connectionId === selectedId);

  function removeButton(connection: Connection, onDone?: () => void) {
    return (
      <button
        type="button"
        disabled={remove.isPending}
        onClick={() => {
          if (!window.confirm(`Remove ${connection.user.name} from your connections?`)) return;
          remove.mutate(connection.user._id, {
            onSuccess: () => {
              toast.success(`${connection.user.name} removed`);
              onDone?.();
            },
            onError: (e) => toast.error(e.message),
          });
        }}
        className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-white/80 text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
      >
        {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
        Remove
      </button>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="mt-1.5 text-muted-foreground">Developers you are connected with.</p>
      </div>

      <div className="scroll-thin -mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
        {isPending ? (
          <div className="flex justify-center py-24">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error.message}</p>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No connections yet"
            description="Accept a request or send one from Discover, and your connections will show up here."
            action={
              <Link
                href="/feed"
                className="bg-brand inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5"
              >
                <Compass className="size-4" />
                Discover developers
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-3 2xl:grid-cols-4">
            {data.map((connection) => (
              <RequestCard
                key={connection.connectionId}
                user={connection.user}
                onOpen={() => setSelectedId(connection.connectionId)}
              >
                {removeButton(connection)}
              </RequestCard>
            ))}
          </div>
        )}
      </div>

      <UserDrawer
        user={selected?.user ?? null}
        onClose={() => setSelectedId(null)}
        footer={selected && <div className="flex gap-2">{removeButton(selected, () => setSelectedId(null))}</div>}
      />
    </div>
  );
}
