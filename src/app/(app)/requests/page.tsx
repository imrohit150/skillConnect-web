"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Compass, Inbox, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RequestCard } from "@/components/request-card";
import {
  useAcceptRequest,
  useCancelRequest,
  useIgnoreRequest,
  useReceivedRequests,
  useSentRequests,
} from "@/hooks/use-connections";
import { cn } from "@/lib/utils";

type Tab = "received" | "sent";

const outlineBtn =
  "flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-white/80 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

function DiscoverLink() {
  return (
    <Link
      href="/feed"
      className="bg-brand inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5"
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((request) => (
        <RequestCard key={request._id} user={request.senderId}>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              accept.mutate(request._id, {
                onSuccess: () => toast.success(`You and ${request.senderId.name} are now connected`),
                onError: (e) => toast.error(e.message),
              })
            }
            className="bg-brand flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-4" />
            Accept
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              ignore.mutate(request._id, {
                onError: (e) => toast.error(e.message),
              })
            }
            className={cn(outlineBtn, "text-muted-foreground hover:text-destructive")}
          >
            <X className="size-4" />
            Ignore
          </button>
        </RequestCard>
      ))}
    </div>
  );
}

function SentList() {
  const { data, isPending, error } = useSentRequests();
  const cancel = useCancelRequest();

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((request) => (
        <RequestCard key={request._id} user={request.recipientId}>
          <button
            type="button"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(request._id, {
                onSuccess: () => toast.success("Request cancelled"),
                onError: (e) => toast.error(e.message),
              })
            }
            className={cn(outlineBtn, "text-muted-foreground hover:text-destructive")}
          >
            {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            Cancel request
          </button>
        </RequestCard>
      ))}
    </div>
  );
}

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const received = useReceivedRequests();
  const sent = useSentRequests();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "received", label: "Received", count: received.data?.length },
    { id: "sent", label: "Sent", count: sent.data?.length },
  ];

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
        <p className="mt-1.5 text-muted-foreground">
          Accept developers who want to connect, or manage the requests you sent.
        </p>
      </div>

      <div className="inline-flex w-fit rounded-full border bg-white/70 p-1">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground transition",
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

      {tab === "received" ? <ReceivedList /> : <SentList />}
    </div>
  );
}
