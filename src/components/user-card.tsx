import { Briefcase } from "lucide-react";
import { UserActions } from "@/components/user-actions";
import { PremiumBadge } from "@/components/premium-badge";
import type { PublicUser } from "@/types";

type UserCardProps = {
  user: PublicUser;
  onOpen: () => void;
};

export function UserCard({ user, onOpen }: UserCardProps) {
  const skills = user.skills ?? [];

  return (
    <div className="glass flex flex-col overflow-hidden rounded-2xl border bg-white/80 p-2.5 sm:rounded-[2rem] sm:p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 cursor-pointer flex-col text-left"
      >
        <div className="aspect-video w-full overflow-hidden rounded-xl sm:aspect-[4/3] sm:rounded-3xl border-2 border-white shadow-sm ring-1 ring-primary/25">
          {user.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <div className="bg-brand flex size-full items-center justify-center text-6xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 px-2 pt-3 sm:space-y-2.5 sm:px-3 sm:pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1"><h3 className="truncate text-base font-bold sm:text-lg">{user.name}</h3>{user.premiumStatus && <PremiumBadge />}</div>
            {user.experienceLevel && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                <Briefcase className="size-3" />
                {user.experienceLevel}
              </span>
            )}
          </div>
          <p className="line-clamp-2 min-h-8 text-xs leading-4 sm:min-h-10 sm:text-sm sm:leading-5 text-muted-foreground">
            {user.bio || "No bio yet."}
          </p>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border bg-white px-2.5 py-1 font-[family-name:var(--font-mono-code)] text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-1 py-1 text-[11px] font-medium text-muted-foreground">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </button>
      <div className="px-2 pt-3 pb-1 sm:px-3 sm:pt-4 sm:pb-2">
        <UserActions user={user} />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="glass animate-pulse rounded-[2rem] border bg-white/60 p-3 motion-reduce:animate-none">
      <div className="aspect-[4/3] rounded-3xl bg-muted" />
      <div className="space-y-3 px-3 py-4">
        <div className="h-5 w-1/2 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-11 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
