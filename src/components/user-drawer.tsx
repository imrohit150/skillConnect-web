"use client";

import { Briefcase, Code2, Crown, Globe, Link2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { UserActions } from "@/components/user-actions";
import { PremiumBadge } from "@/components/premium-badge";
import type { PublicUser } from "@/types";

type UserDrawerProps = {
  user: PublicUser | null;
  onClose: () => void;
  footer?: React.ReactNode;
};

function Chips({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border bg-white px-2.5 py-1 font-[family-name:var(--font-mono-code)] text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export function UserDrawer({ user, onClose, footer }: UserDrawerProps) {
  const links = [
    { href: user?.socialLinks?.github, label: "GitHub", icon: Code2 },
    { href: user?.socialLinks?.linkedin, label: "LinkedIn", icon: Link2 },
    { href: user?.socialLinks?.portfolio, label: "Portfolio", icon: Globe },
  ].filter((link) => link.href);

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 bg-background p-0 sm:max-w-md" showCloseButton>
        {user && (
          <>
            <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-5">
              <div className="aspect-video w-full overflow-hidden rounded-2xl sm:aspect-square sm:rounded-3xl">
                {user.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-brand flex size-full items-center justify-center text-7xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2"><SheetTitle className="min-w-0 break-words text-xl font-bold sm:text-2xl">{user.name}</SheetTitle>{user.premiumStatus && <PremiumBadge className="[&_svg]:size-5 sm:[&_svg]:size-6" />}</div>
                <div className="flex flex-wrap gap-2">
                  {user.experienceLevel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      <Briefcase className="size-3" />
                      {user.experienceLevel}
                    </span>
                  )}
                  {user.premiumStatus && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Crown className="size-3" />
                      Premium
                    </span>
                  )}
                </div>
                <SheetDescription className="leading-relaxed">
                  {user.bio || "This developer hasn't added a bio yet."}
                </SheetDescription>
              </div>

              <Chips title="Skills" items={user.skills} />
              <Chips title="Interests" items={user.interests} />

              {links.length > 0 && (
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {links.map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border bg-white/80 px-3.5 py-2 text-sm font-medium transition hover:border-primary/50 hover:text-primary"
                      >
                        <Icon className="size-4" />
                        {label}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <div className="border-t bg-background p-4">
              {footer ?? <UserActions user={user} onDone={onClose} />}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
