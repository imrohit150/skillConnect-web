"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle, Mail, MailCheck } from "lucide-react";
import { AuthField } from "@/components/auth-field";
import { useForgotPassword } from "@/hooks/use-auth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators";

export function ForgotPasswordView() {
  const request = useForgotPassword();
  const [sentTo, setSentTo] = useState("");
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), mode: "onChange" });

  return (
    <>
      <div>
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-sm">{sentTo ? <MailCheck className="size-8" /> : <KeyRound className="size-8" />}</div>
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-cyan-700 uppercase">Account recovery</p>
        <h2 className="text-3xl font-bold tracking-tight">{sentTo ? "Check your inbox" : "Forgot your password?"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sentTo ? "If an account exists for this email, a password reset link will arrive shortly." : "Enter the email you signed up with. We'll send you a link to choose a new password."}</p>
      </div>

      {sentTo ? (
        <div className="space-y-5">
          <div role="status" className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"><p className="text-xs text-muted-foreground">Email address entered</p><p className="mt-1 break-all text-sm font-semibold">{sentTo}</p></div>
          <p className="text-sm leading-relaxed text-muted-foreground">The link expires in <span className="font-semibold text-foreground">15 minutes</span>. Check your spam folder too. Your password stays the same until you finish resetting it.</p>
          <button type="button" onClick={() => { setSentTo(""); request.reset(); }} className="cursor-pointer text-sm font-semibold text-primary hover:underline">Try again or use another email</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(({ email }) => request.mutate(email, { onSuccess: () => setSentTo(email) }))} noValidate className="space-y-4">
          <AuthField id="recovery-email" label="Email address" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} disabled={request.isPending} {...register("email")} />
          {request.error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{request.error.message}</p>}
          <button type="submit" disabled={!isValid || request.isPending} className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">{request.isPending ? <><LoaderCircle className="size-4 animate-spin" /> Sending request...</> : <>Send reset link <ArrowRight className="size-4" /></>}</button>
        </form>
      )}
      <div className="border-t pt-4 text-center"><Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to login</Link></div>
    </>
  );
}
