"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Clock3, LoaderCircle, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { pendingSignupKey, useCurrentUser, usePendingSignup, useResendVerification, useVerifyEmail } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import type { PendingSignup } from "@/types";

function remaining(until: string | number | null | undefined, now: number | null) {
  return until && now !== null ? Math.max(0, Math.ceil((new Date(until).getTime() - now) / 1000)) : 0;
}

function clockLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function VerifyEmailView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data: signup, isPending, error: signupError, refetch } = usePendingSignup(!user?.isEmailVerified);
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [resendRetryAt, setResendRetryAt] = useState(0);
  const [rateLimitUntil, setRateLimitUntil] = useState(0);
  const [signupEnded, setSignupEnded] = useState(false);

  useEffect(() => {
    // A state initializer also runs during prerender. Start the clock after mount.
    const tick = () => startTransition(() => setNow(Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const state = signup?.emailVerification;
  const expiresIn = remaining(state?.expiresAt, now);
  const resendIn = Math.max(remaining(state?.resendAvailableAt, now), remaining(resendRetryAt, now));
  const rateLimitIn = remaining(rateLimitUntil, now);
  const expired = state?.status === "expired" || (now !== null && Boolean(state?.expiresAt) && expiresIn === 0);
  const locked = state?.status === "locked" || state?.attemptsRemaining === 0;
  const active = now !== null && state?.status === "sent" && !expired && !locked;
  const busy = now === null || verify.isPending || resend.isPending;

  function handleError(failure: Error) {
    setError(failure.message);
    if (!(failure instanceof ApiError)) return;
    if (failure.code === "SIGNUP_LOGIN_FAILED" || failure.code === "EMAIL_IN_USE") { toast.message(failure.message); router.replace("/login"); return; }
    if (failure.code === "SIGNUP_EXPIRED") { setSignupEnded(true); return; }
    if (failure.retryAfter) {
      const until = Date.now() + failure.retryAfter * 1000;
      setResendRetryAt(until);
      if (failure.code === "VERIFICATION_RATE_LIMIT") setRateLimitUntil(until);
    }
    queryClient.setQueryData<PendingSignup>(pendingSignupKey, (previous) => {
      if (!previous?.emailVerification) return previous;
      return { ...previous, emailVerification: {
        ...previous.emailVerification,
        ...(failure.attemptsRemaining !== undefined ? { attemptsRemaining: failure.attemptsRemaining } : {}),
        ...(failure.code === "OTP_EXPIRED" ? { status: "expired" as const } : {}),
        ...(failure.code === "OTP_ATTEMPTS_EXCEEDED" ? { status: "locked" as const, attemptsRemaining: 0 } : {}),
      } };
    });
    if (failure.code === "OTP_NOT_CURRENT") {
      void queryClient.invalidateQueries({ queryKey: pendingSignupKey });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || busy || rateLimitIn || !/^\d{6}$/.test(otp)) return;
    setError(""); setNotice("");
    verify.mutate(otp, {
      onSuccess: () => toast.success("Email verified and account created! Let's finish your profile."),
      onError: handleError,
    });
  }

  function sendCode() {
    if (busy || resendIn || rateLimitIn) return;
    setError(""); setNotice("");
    resend.mutate(undefined, {
      onSuccess: () => {
        setOtp(""); setResendRetryAt(0); setNow(Date.now());
        setNotice("A new code is on its way. Use the latest email.");
      },
      onError: handleError,
    });
  }

  if (user?.isEmailVerified) {
    return <div role="status" className="flex items-center gap-3 py-12"><ShieldCheck className="size-6 text-primary" /> Account created. Opening your profile...</div>;
  }
  if (signupEnded || (signupError instanceof ApiError && signupError.code === "SIGNUP_EXPIRED") || (signup && now !== null && remaining(signup.expiresAt, now) === 0)) {
    return <div className="space-y-4 py-8"><h2 className="text-2xl font-bold">Start a new signup</h2><p className="text-sm leading-relaxed text-muted-foreground">This signup expired or was already completed. If you finished verifying your email, you can log in.</p><Link href="/signup" className="inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft className="size-4" /> Back to signup</Link><p className="text-sm"><Link href="/login" className="text-primary hover:underline">Already verified? Log in</Link></p></div>;
  }
  if (isPending || now === null) {
    return <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" /> Loading your signup...</div>;
  }
  if (!signup) {
    return <div className="space-y-4 py-8 text-center"><p role="alert">Could not load your signup. Please try again.</p><button type="button" onClick={() => void refetch()} className="font-semibold text-primary hover:underline">Try again</button></div>;
  }

  return (
    <>
      <div>
        <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 shadow-sm">
          <MailCheck className="size-8 text-cyan-600" aria-hidden="true" />
          <span className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-4 border-white bg-cyan-600 text-white"><ShieldCheck className="size-3.5" /></span>
        </div>
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-cyan-700 uppercase">One last step</p>
        <h2 className="text-3xl font-bold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Verify your email to finish signing up. Your account will be created after verification.</p>
      </div>

      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3.5">
        <p className="text-xs text-muted-foreground">Your verification email goes to</p>
        <p className="mt-1 break-all text-sm font-semibold">{signup.email}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="verification-code" className="text-[13px] font-semibold">6-digit verification code</label>
          <input
            id="verification-code" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required value={otp} disabled={busy || !active}
            onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
            aria-invalid={Boolean(error)} aria-describedby="verification-help verification-feedback"
            placeholder="000000"
            className="h-16 w-full rounded-xl border bg-white/90 px-3 text-center font-mono text-3xl font-semibold tracking-[0.35em] shadow-sm outline-none transition placeholder:text-muted-foreground/25 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-50 sm:tracking-[0.5em]"
          />
          <div id="verification-help" className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{active ? `Expires in ${clockLabel(expiresIn)}` : expired ? "Code expired" : locked ? "Attempt limit reached" : "Send a code to get started"}</span>
            {active && <span>{state?.attemptsRemaining} attempts left</span>}
          </div>
        </div>

        <div id="verification-feedback" aria-live="polite" aria-atomic="true">
          {error ? <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
            : expired || locked ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{locked ? "You've used all attempts for this code." : "This code has expired."} Request a new code below to continue.</p>
            : notice ? <p role="status" className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">{notice}</p>
            : state?.message ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{state.message}</p> : null}
        </div>

        <button type="submit" disabled={busy || !active || otp.length !== 6 || rateLimitIn > 0} className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">
          {verify.isPending ? <><LoaderCircle className="size-4 animate-spin" /> Creating your account...</> : rateLimitIn ? `Try again in ${clockLabel(rateLimitIn)}` : <>Verify &amp; create account <ArrowRight className="size-4" /></>}
        </button>
      </form>

      <div className="space-y-3 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground">Can&apos;t find the email? Check your spam folder.<br />Only the code from your latest email will work.</p>
        <button type="button" onClick={sendCode} disabled={busy || resendIn > 0 || rateLimitIn > 0} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline">
          <RefreshCw className={`size-3.5 ${resend.isPending ? "animate-spin" : ""}`} aria-hidden="true" />
          {resend.isPending ? "Sending code..." : Math.max(resendIn, rateLimitIn) > 0 ? `Resend code in ${clockLabel(Math.max(resendIn, rateLimitIn))}` : !state || state.status === "not_sent" ? "Send verification code" : "Resend code"}
        </button>
      </div>

      <div className="border-t pt-4 text-center">
        <Link href="/signup" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Wrong email? Back to signup</Link>
      </div>
    </>
  );
}
