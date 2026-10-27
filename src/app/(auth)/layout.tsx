"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const people = [
  { initials: "AK", color: "from-cyan-400 to-sky-500" },
  { initials: "JD", color: "from-teal-400 to-cyan-500" },
  { initials: "SM", color: "from-sky-400 to-blue-500" },
  { initials: "RK", color: "from-emerald-400 to-teal-500" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (pathname === "/forgot-password" || pathname === "/reset-password") return;
    if (!user) return;
    if (user.isEmailVerified) router.replace(pathname === "/verify-email" ? "/profile?welcome=1" : "/feed");
  }, [user, pathname, router]);

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div className="glass grid w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-white/60 lg:min-h-[640px] lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-gradient-to-br from-cyan-50 via-sky-50 to-white p-10 lg:flex">
          <div className="bg-brand absolute -bottom-24 -left-24 size-72 rounded-full opacity-20 blur-3xl" />
          <Logo href="/login" />

          <div className="relative space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-3.5 py-1.5 font-[family-name:var(--font-mono-code)] text-[11px] font-semibold tracking-widest text-cyan-700 uppercase">
              <span className="size-1.5 rounded-full bg-cyan-500" />
              Built for developers
            </span>
            <h1 className="text-5xl leading-[1.08] font-bold tracking-tight">
              Good code.
              <br />
              <span className="text-gradient">Great connections.</span>
            </h1>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              Find your people in tech. Discover developers, build meaningful
              connections, and turn conversations into collaborations.
            </p>
          </div>

          <div className="relative space-y-4">
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center">
                {people.map((p) => (
                  <span
                    key={p.initials}
                    className={`-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[11px] font-bold text-white first:ml-0 ${p.color}`}
                  >
                    {p.initials}
                  </span>
                ))}
                <span className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-white bg-cyan-100 text-xs font-bold text-cyan-700">
                  +
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">Your next collaboration starts here.</p>
              <p className="text-xs text-muted-foreground">Connect. Collaborate. Create.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              © SkillConnect · Made for builders, by builders.
            </p>
          </div>
        </aside>

        <main className={cn("flex flex-col justify-center gap-6 bg-white/70 p-6 sm:p-10", isSignup && "max-sm:gap-2.5 max-sm:px-5 max-sm:py-3")}>
          <Logo href="/login" className={cn("lg:hidden", isSignup && "max-sm:[&>span:first-child]:size-8 max-sm:[&>span:first-child]:rounded-lg max-sm:[&>span:first-child]:text-base max-sm:[&>span:last-child]:text-lg")} />
          {children}
        </main>
      </div>
    </div>
  );
}
