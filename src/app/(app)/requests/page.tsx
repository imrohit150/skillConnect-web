"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Compass, EyeOff, Inbox, Loader2, Send, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RequestCard } from "@/components/request-card";
import { UserDrawer } from "@/components/user-drawer";
import {
  useAcceptRequest,
  useCancelRequest,
  useIgnoreRequest,
  usePassedUsers,
  useReceivedRequests,
  useSentRequests,
  useUnpassUser,
} from "@/hooks/use-connections";
import { cn } from "@/lib/utils";

type Tab = "received" | "sent" | "passed";

const outlineBtn =
  "flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-white/80 text-xs font-semibold sm:text-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

function DiscoverLink() {
  return (
    <Link
      href="/feed"
      className="bg-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs sm:h-11 sm:px-6 sm:text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5"
    >
      <Compass className="size-4" />
      Discover developers
    </Link>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function ReceivedList() {
  const { data, isPending, error } = useReceivedRequests();
  const accept = useAcceptRequest();
  const ignore = useIgnoreRequest();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isPending) return <Spinner />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (data.length === 0)
    return (
      <EmptyState
        icon={Inbox}
        title="No requests yet"
        description="When another developer wants to connect with you, their request will show up here."
        action={<DiscoverLink />}
      />
    );

  const busy = accept.isPending || ignore.isPending;
  const selected = data.find((r) => r._id === selectedId);

  const actions = (request: (typeof data)[number], onDone?: () => void) => (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          accept.mutate(request._id, {
            onSuccess: () => {
              toast.success(`You and ${request.senderId.name} are now connected`);
              onDone?.();
            },
            onError: (e) => toast.error(e.message),
          })
        }
        className="bg-brand flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold sm:text-sm text-white shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Check className="size-4" />
        Accept
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          ignore.mutate(request._id, {
            onSuccess: () => onDone?.(),
            onError: (e) => toast.error(e.message),
          })
        }
        className={cn(outlineBtn, "text-muted-foreground hover:text-destructive")}
      >
        <X className="size-4" />
        Ignore
      </button>
    </>
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5 2xl:grid-cols-4">
        {data.map((request) => (
          <RequestCard key={request._id} user={request.senderId} onOpen={() => setSelectedId(request._id)}>
            {actions(request)}
          </RequestCard>
        ))}
      </div>
      <UserDrawer
        user={selected?.senderId ?? null}
        onClose={() => setSelectedId(null)}
        footer={selected && <div className="flex gap-2">{actions(selected, () => setSelectedId(null))}</div>}
      />
    </>
  );
}

function SentList() {
  const { data, isPending, error } = useSentRequests();
  const cancel = useCancelRequest();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isPending) return <Spinner />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (data.length === 0)
    return (
      <EmptyState
        icon={Send}
        title="No sent requests"
        description="Requests you send to other developers will be listed here until they respond."
        action={<DiscoverLink />}
      />
    );

  const selected = data.find((r) => r._id === selectedId);

  const actions = (request: (typeof data)[number], onDone?: () => void) => (
    <button
      type="button"
      disabled={cancel.isPending}
      onClick={() =>
        cancel.mutate(request._id, {
          onSuccess: () => {
            toast.success("Request cancelled");
            onDone?.();
          },
          onError: (e) => toast.error(e.message),
        })
      }
      className={cn(outlineBtn, "text-muted-foreground hover:text-destructive")}
    >
      {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
      Cancel request
    </button>
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5 2xl:grid-cols-4">
        {data.map((request) => (
          <RequestCard key={request._id} user={request.recipientId} onOpen={() => setSelectedId(request._id)}>
            {actions(request)}
          </RequestCard>
        ))}
      </div>
      <UserDrawer
        user={selected?.recipientId ?? null}
        onClose={() => setSelectedId(null)}
        footer={selected && <div className="flex gap-2">{actions(selected, () => setSelectedId(null))}</div>}
      />
    </>
  );
}

function PassedList() {
  const { data, isPending, error } = usePassedUsers();
  const unpass = useUnpassUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isPending) return <Spinner />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (data.length === 0)
    return (
      <EmptyState
        icon={EyeOff}
        title="No passed developers"
        description="Developers you pass on in Discover are kept here, so you can bring them back anytime."
        action={<DiscoverLink />}
      />
    );

  const selected = data.find((r) => r._id === selectedId);

  const actions = (item: (typeof data)[number], onDone?: () => void) => (
    <button
      type="button"
      disabled={unpass.isPending}
      onClick={() =>
        unpass.mutate(item.passedUserId._id, {
          onSuccess: () => {
            toast.success(`${item.passedUserId.name} is back in Discover`);
            onDone?.();
          },
          onError: (e) => toast.error(e.message),
        })
      }
      className={cn(outlineBtn, "text-muted-foreground hover:text-primary")}
    >
      {unpass.isPending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
      Undo pass
    </button>
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5 2xl:grid-cols-4">
        {data.map((item) => (
          <RequestCard key={item._id} user={item.passedUserId} onOpen={() => setSelectedId(item._id)}>
            {actions(item)}
          </RequestCard>
        ))}
      </div>
      <UserDrawer
        user={selected?.passedUserId ?? null}
        onClose={() => setSelectedId(null)}
        footer={selected && <div className="flex gap-2">{actions(selected, () => setSelectedId(null))}</div>}
      />
    </>
  );
}

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const received = useReceivedRequests();
  const sent = useSentRequests();
  const passed = usePassedUsers();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "received", label: "Received", count: received.data?.length },
    { id: "sent", label: "Sent", count: sent.data?.length },
    { id: "passed", label: "Passed", count: passed.data?.length },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 sm:gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Requests</h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:mt-1.5 sm:text-base sm:leading-6">
          Accept developers who want to connect, manage the requests you sent, or bring back people you passed.
        </p>
      </div>

      <div className="inline-flex w-fit rounded-full border bg-white/70 p-1">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold sm:gap-2 sm:px-5 sm:text-sm text-muted-foreground transition",
              tab === id && "bg-brand text-white shadow-md shadow-cyan-500/25",
            )}
          >
            {label}
            {count ? (
              <span
                className={cn(
                  "rounded-full px-2 text-xs",
                  tab === id ? "bg-white/25" : "bg-accent text-accent-foreground",
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="scroll-thin -mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
        {tab === "received" ? <ReceivedList /> : tab === "sent" ? <SentList /> : <PassedList />}
      </div>
    </div>
  );
}
