"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Loader2, MessageCircle, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RequestCard } from "@/components/request-card";
import { UserDrawer } from "@/components/user-drawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnections, useRemoveConnection } from "@/hooks/use-connections";
import { useStartConversation } from "@/hooks/use-conversations";
import type { Connection } from "@/types";

export default function ConnectionsView() {
  const router = useRouter();
  const { data, isPending, error } = useConnections();
  const remove = useRemoveConnection();
  const startConversation = useStartConversation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectionToRemove, setConnectionToRemove] = useState<Connection | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const selected = data?.find((c) => c.connectionId === selectedId);

  function confirmRemoval() {
    if (!connectionToRemove || remove.isPending) return;
    const connection = connectionToRemove;
    remove.mutate(connection.user._id, {
      onSuccess: () => {
        toast.success(`${connection.user.name} removed`);
        setConnectionToRemove(null);
        if (selectedId === connection.connectionId) setSelectedId(null);
      },
      onError: (e) => toast.error(e.message),
    });
  }

  function removeButton(connection: Connection) {
    return (
      <button
        type="button"
        disabled={remove.isPending || startConversation.isPending}
        onClick={() => setConnectionToRemove(connection)}
        className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-white/80 text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
      >
        {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
        Remove
      </button>
    );
  }

  function messageButton(connection: Connection) {
    const opening = startConversation.isPending && startConversation.variables === connection.user._id;
    return (
      <button
        type="button"
        disabled={startConversation.isPending || remove.isPending}
        onClick={() => startConversation.mutate(connection.user._id, {
          onSuccess: (conversation) => {
            setSelectedId(null);
            router.push(`/messages?conversation=${conversation._id}`);
          },
          onError: (e) => toast.error(e.message),
        })}
        className="bg-brand flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {opening ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
        {opening ? "Opening..." : "Message"}
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
                {messageButton(connection)}
                {removeButton(connection)}
              </RequestCard>
            ))}
          </div>
        )}
      </div>

      <UserDrawer
        user={selected?.user ?? null}
        onClose={() => setSelectedId(null)}
        footer={selected && <div className="flex gap-2">{messageButton(selected)}{removeButton(selected)}</div>}
      />

      <Dialog
        open={connectionToRemove !== null}
        onOpenChange={(open, eventDetails) => {
          if (remove.isPending) {
            eventDetails.cancel();
            return;
          }
          if (!open) setConnectionToRemove(null);
        }}
      >
        <DialogContent
          initialFocus={cancelButtonRef}
          showCloseButton={false}
          className="overflow-hidden rounded-3xl border border-white/80 bg-background p-6 shadow-2xl shadow-cyan-950/15 ring-0 sm:max-w-md sm:p-8"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10 text-destructive">
            <UserMinus className="size-6" />
          </div>
          <DialogHeader className="gap-2.5">
            <DialogTitle className="text-2xl font-bold tracking-tight">Remove connection?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              You and {connectionToRemove?.user.name} will no longer be connected.
              To chat again, you’ll need to send a new connection request and have it accepted.
            </DialogDescription>
          </DialogHeader>

          {connectionToRemove && (
            <div className="my-1 flex items-center gap-3 rounded-2xl border bg-white/75 p-3.5">
              {connectionToRemove.user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={connectionToRemove.user.profileImageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <span className="bg-brand flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
                  {connectionToRemove.user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{connectionToRemove.user.name}</p>
                <p className="text-xs text-muted-foreground">Your connection</p>
              </div>
            </div>
          )}

          <DialogFooter className="m-0 gap-3 rounded-none border-0 bg-transparent p-0 pt-2">
            <DialogClose
              render={
                <Button
                  ref={cancelButtonRef}
                  variant="outline"
                  disabled={remove.isPending}
                  className="h-11 cursor-pointer rounded-xl bg-white/80 px-5 font-semibold sm:flex-1"
                />
              }
            >
              Keep connection
            </DialogClose>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={confirmRemoval}
              className="h-11 cursor-pointer gap-2 rounded-xl bg-destructive px-5 font-semibold text-white shadow-sm hover:bg-destructive/90 sm:flex-1"
            >
              {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
              {remove.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
