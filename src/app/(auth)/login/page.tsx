"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth-field";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginValues } from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onChange" });

  function onSubmit(values: LoginValues) {
    login.mutate(values, {
      onSuccess: () => router.replace("/feed"),
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back ✨</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Log in to pick up where you left off.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={!isValid || login.isPending}
          className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {login.isPending ? "Logging in..." : "Log in"}
          {!login.isPending && <ArrowRight className="size-4" />}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
