import { Briefcase } from "lucide-react";

type ProfileCardProps = {
  name: string;
  bio?: string;
  imageUrl?: string;
  experienceLevel?: string;
  skills?: string[];
};

export function ProfileCard({ name, bio, imageUrl, experienceLevel, skills = [] }: ProfileCardProps) {
  return (
    <div className="glass w-full max-w-sm overflow-hidden rounded-[2rem] border bg-white/80 p-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <div className="bg-brand flex size-full items-center justify-center text-7xl font-bold text-white">
            {name.charAt(0).toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="space-y-3 px-3 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-xl font-bold">{name || "Your name"}</h3>
          {experienceLevel && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              <Briefcase className="size-3" />
              {experienceLevel}
            </span>
          )}
        </div>
        <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
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
