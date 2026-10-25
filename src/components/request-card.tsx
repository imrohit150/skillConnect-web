import { Briefcase } from "lucide-react";
import type { PublicUser } from "@/types";

type RequestCardProps = {
  user: PublicUser;
  children: React.ReactNode;
};

export function RequestCard({ user, children }: RequestCardProps) {
  const skills = user.skills ?? [];

  return (
    <div className="glass flex flex-col gap-4 rounded-3xl border bg-card p-5">
      <div className="flex items-center gap-3">
        {user.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profileImageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-14 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <span className="bg-brand flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-bold">{user.name}</h3>
          {user.experienceLevel && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              <Briefcase className="size-3" />
              {user.experienceLevel}
            </span>
          )}
        </div>
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
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
      <div className="mt-auto flex gap-2 pt-1">{children}</div>
    </div>
  );
}
