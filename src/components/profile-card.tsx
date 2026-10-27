import { Briefcase } from "lucide-react";
import { PremiumBadge } from "@/components/premium-badge";

type ProfileCardProps = {
  name: string;
  bio?: string;
  imageUrl?: string;
  experienceLevel?: string;
  skills?: string[];
  premiumStatus?: boolean;
};

export function ProfileCard({ name, bio, imageUrl, experienceLevel, skills = [], premiumStatus }: ProfileCardProps) {
  return (
    <div className="glass grid w-full max-w-sm grid-cols-[4.5rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl border bg-white/80 p-3 sm:block sm:rounded-[2rem]">
      <div className="relative aspect-square self-start overflow-hidden rounded-xl sm:rounded-3xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <div className="bg-brand flex size-full items-center justify-center text-7xl font-bold text-white">
            {name.charAt(0).toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-2 sm:space-y-3 sm:px-3 sm:pt-4 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1"><h3 className="truncate text-base font-bold sm:text-xl">{name || "Your name"}</h3>{premiumStatus && <PremiumBadge />}</div>
          {experienceLevel && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-accent-foreground sm:px-2.5 sm:text-xs">
              <Briefcase className="size-3" />
              {experienceLevel}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground sm:line-clamp-3 sm:min-h-[3.75rem] sm:text-sm sm:leading-relaxed">
          {bio || "Your bio will appear here."}
        </p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border bg-white px-2.5 py-1 font-[family-name:var(--font-mono-code)] text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                +{skills.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
