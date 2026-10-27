"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CircleCheck, KeyRound, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import { AuthField } from "@/components/auth-field";
import { useResetPassword } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

function subscribeToHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
const readToken = () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
const serverToken = () => null;

export function ResetPasswordView() {
  const token = useSyncExternalStore(subscribeToHash, readToken, serverToken);
  const [completedToken, setCompletedToken] = useState<string | null>(null);

  if (completedToken && (token === completedToken || token === "")) return (
    <div className="space-y-5">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600"><CircleCheck className="size-8" /></div>
      <h2 className="text-3xl font-bold tracking-tight">Password updated</h2>
      <p role="status" className="text-sm leading-relaxed text-muted-foreground">You&apos;re all set. Your previous sessions have been signed out. Log in with your new password to continue.</p>
      <Link href="/login" className="bg-brand flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/20">Back to login <ArrowRight className="size-4" /></Link>
    </div>
  );
  return <ResetPasswordForm key={token ?? "loading"} token={token} onComplete={() => {
    setCompletedToken(token);
    window.history.replaceState(null, "", window.location.pathname);
  }} />;
}

function ResetPasswordForm({ token, onComplete }: { token: string | null; onComplete: () => void }) {
  const reset = useResetPassword();
  const { register, handleSubmit, reset: clearForm, formState: { errors, isValid } } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), mode: "onChange" });
  const expired = reset.error instanceof ApiError && reset.error.code === "INVALID_RESET_TOKEN";

  if (token === null) return <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" /> Opening reset link...</div>;
  if (!/^[a-f0-9]{64}$/.test(token) || expired) return (
    <div className="space-y-5">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700"><KeyRound className="size-8" /></div>
      <h2 className="text-3xl font-bold tracking-tight">Request a new link</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">This reset link is missing, expired, or has already been used. Request a fresh link to reset your password.</p>
      <Link href="/forgot-password" className="bg-brand flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white">Get a new reset link <ArrowRight className="size-4" /></Link>
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to login</Link>
    </div>
  );

  return (
    <>
      <div>
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-sm"><ShieldCheck className="size-8" /></div>
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-cyan-700 uppercase">A fresh start</p>
        <h2 className="text-3xl font-bold tracking-tight">Choose a new password</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use at least 8 characters. Your previous sessions will be signed out when you save.</p>
      </div>
      <form onSubmit={handleSubmit(({ newPassword }) => reset.mutate({ token, newPassword }, { onSuccess: () => { clearForm(); onComplete(); } }))} noValidate className="space-y-4">
        <AuthField id="new-password" label="New password" icon={Lock} type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.newPassword?.message} disabled={reset.isPending} {...register("newPassword")} />
        <AuthField id="confirm-password" label="Confirm new password" icon={Lock} type="password" autoComplete="new-password" placeholder="Enter your new password again" error={errors.confirmPassword?.message} disabled={reset.isPending} {...register("confirmPassword")} />
        {reset.error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{reset.error.message}</p>}
        <button type="submit" disabled={!isValid || reset.isPending} className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">{reset.isPending ? <><LoaderCircle className="size-4 animate-spin" /> Updating password...</> : <>Save new password <ArrowRight className="size-4" /></>}</button>
      </form>
      <div className="border-t pt-4 text-center"><Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to login</Link></div>
    </>
  );
}
