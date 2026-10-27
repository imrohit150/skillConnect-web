"use client";

import { useState } from "react";
import Script from "next/script";
import { ArrowRight, BadgeCheck, Check, Crown, FlaskConical, Loader2, ShieldCheck, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/premium-badge";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDemoCheckout, useMembership } from "@/hooks/use-membership";
import { CheckoutCancelled } from "@/lib/razorpay";

const plusFeatures = ["A blue premium badge beside your name", "Badge on your profile, cards and connections", "All your free discovery and networking features"];
const proFeatures = ["Everything included in Plus", "One-to-one video calls with your connections", "Build and collaborate face to face"];

export default function MembershipPage() {
  const { data: user } = useCurrentUser();
  const membership = useMembership();
  const checkout = useDemoCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const active = membership.data?.premiumStatus === true;
  const busy = checkout.isPending;

  function startCheckout() {
    if (!user || busy || active) return;
    checkout.mutate(user, {
      onSuccess: () => toast.success("Your demo Plus membership is active. Enjoy your badge!"),
      onError: (error) => {
        if (error instanceof CheckoutCancelled) toast.info(error.message);
        else toast.error(error.message);
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-4 sm:space-y-7">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => { setScriptReady(true); setScriptError(false); }}
        onError={() => { setScriptReady(false); setScriptError(true); }}
      />

      <div className="space-y-2 sm:space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary">
          <Crown className="size-3.5" /> SkillConnect Membership
        </span>
        <h1 className="text-[22px] leading-7 font-bold tracking-tight sm:text-4xl sm:leading-10">Good connections. <span className="text-gradient">A little extra.</span></h1>
        <p className="max-w-2xl text-xs leading-5 sm:text-base sm:leading-relaxed text-muted-foreground">Make your profile stand out today. Bring your connections face to face tomorrow.</p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/90 p-3 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm"><FlaskConical className="size-5" /></span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-cyan-950 sm:text-base">This is a demo. You don’t have to pay real money.</p>
          <p className="text-xs leading-5 text-cyan-900/75 sm:text-sm sm:leading-relaxed">Checkout runs in Razorpay test mode. No real money is charged, and there are no real recurring payments. Use the test card below instead of your own card.</p>
        </div>
      </div>

      {membership.isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Checking your membership…</p>
      ) : membership.error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <p>We couldn’t check your membership. {membership.error.message}</p>
          <Button variant="outline" onClick={() => membership.refetch()} disabled={membership.isFetching} className="cursor-pointer">Try again</Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold">Your plan: {active ? "Plus" : "Free"}</span>
          {active && <PremiumBadge />}
          <span className="text-muted-foreground">{active ? "Your demo premium badge is active." : "Discovery, connections and text chat stay free."}</span>
          {active && membership.data?.premiumUntil && (
            <span className="text-muted-foreground">Current period ends {new Date(membership.data.premiumUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.</span>
          )}
        </div>
      )}

      {checkout.isError && checkout.awaitingVerification && !active && (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Your test payment completed, but we couldn’t verify your membership yet. Select “Retry badge activation” below to try again without another checkout.
        </p>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <section className="relative flex flex-col overflow-hidden rounded-[2rem] border border-primary/30 bg-white/85 p-4 shadow-xl shadow-cyan-900/5 sm:p-8">
          <div className="bg-brand absolute inset-x-0 top-0 h-1.5" />
          <div className="mb-4 flex items-center sm:mb-6 justify-between gap-3">
            <span className="bg-brand flex size-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-cyan-500/20"><BadgeCheck className="size-6" /></span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{active ? "Your current plan" : "Available in demo"}</span>
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">Plus</h2>
          <p className="mt-2 text-sm text-muted-foreground">A small badge. A profile that stands out.</p>
          <div className="mt-4 flex items-baseline sm:mt-6 gap-1.5"><span className="text-4xl font-bold sm:text-5xl tracking-tight">₹99</span><span className="text-sm text-muted-foreground">/ month</span></div>
          <p className="mt-2 text-xs font-medium text-primary">Demo price · no real charge</p>

          <div className="my-4 flex sm:my-6 items-center gap-3 rounded-2xl border bg-background/60 p-4">
            <span className="bg-brand flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-white">{user?.name.charAt(0).toUpperCase() || "S"}</span>
            <div className="min-w-0"><div className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">{user?.name || "Your name"}</span><PremiumBadge /></div><p className="text-xs text-muted-foreground">Your premium look</p></div>
            <Sparkles className="ml-auto size-5 shrink-0 text-primary/60" />
          </div>

          <ul className="mb-4 space-y-2 sm:mb-8 sm:space-y-3">
            {plusFeatures.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-xs leading-5 sm:text-sm sm:leading-relaxed"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}
          </ul>
          <Button
            disabled={active || busy || membership.isPending || !!membership.error || (!scriptReady && !checkout.awaitingVerification)}
            onClick={startCheckout}
            className="bg-brand mt-auto h-11 w-full sm:h-12 cursor-pointer gap-2 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : active ? <BadgeCheck className="size-4" /> : <ArrowRight className="size-4" />}
            {busy ? "Completing demo checkout…" : active ? "Plus is active" : checkout.awaitingVerification ? "Retry badge activation" : "Try demo checkout"}
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">{scriptError ? "Checkout couldn’t load. Refresh this page to try again." : "Razorpay test mode. No real payment required."}</p>
        </section>

        <section className="flex flex-col rounded-[2rem] border bg-white/55 p-4 sm:p-8">
          <div className="mb-4 flex items-center sm:mb-6 justify-between gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border bg-white text-muted-foreground"><Video className="size-6" /></span>
            <span className="rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-muted-foreground">Coming soon</span>
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">Pro</h2>
          <p className="mt-2 text-sm text-muted-foreground">Take the conversation beyond text.</p>
          <div className="mt-4 sm:mt-6"><p className="text-2xl font-bold tracking-tight sm:text-3xl">Meet. Build. Together.</p><p className="mt-2 text-xs text-muted-foreground">Pricing will be announced at launch.</p></div>

          <div className="my-4 flex sm:my-6 min-h-20 items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/50 p-4 text-muted-foreground"><Video className="size-7" /><span className="text-sm font-medium">Your next collaboration, face to face.</span></div>
          <ul className="mb-4 space-y-2 sm:mb-8 sm:space-y-3">
            {proFeatures.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-xs leading-5 sm:text-sm sm:leading-relaxed text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0" />{feature}</li>)}
          </ul>
          <Button disabled variant="outline" className="mt-auto h-11 w-full sm:h-12 gap-2 rounded-xl font-semibold"><Video className="size-4" />Video calling · Coming soon</Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Pro isn’t available to purchase yet.</p>
        </section>
      </div>

      {!active && (
        <section className="glass rounded-2xl border bg-white/65 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-primary" />Try it with a test card</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose Card in checkout and use these demo details. If a test bank screen appears, choose Success.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A sample mobile number is prefilled for this demo. If Razorpay asks for contact details, keep that number and select Continue. You don’t need to enter your personal mobile number.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">If this test-mode checkout asks for an OTP, enter any 6-digit number, such as <span className="font-mono font-semibold text-foreground">123456</span>. This is only for the demo—no real OTP is needed.</p>
          <dl className="mt-4 grid gap-4 rounded-xl border bg-white/80 p-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div><dt className="text-xs text-muted-foreground">Card number</dt><dd className="mt-1 font-mono text-sm font-semibold">4718 6091 0820 4366</dd></div>
            <div><dt className="text-xs text-muted-foreground">Expiry</dt><dd className="mt-1 text-sm font-semibold">Any future date</dd></div>
            <div><dt className="text-xs text-muted-foreground">CVV</dt><dd className="mt-1 text-sm font-semibold">Any 3 digits</dd></div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">The badge means premium membership, not identity verification. <a href="https://razorpay.com/docs/payments/subscriptions/test/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">Razorpay test instructions</a></p>
        </section>
      )}
    </div>
  );
}
