"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth-field";
import { DateOfBirthPicker } from "@/components/date-of-birth-picker";
import { useSignup } from "@/hooks/use-auth";
import { signupFormSchema, type SignupFormValues } from "@/lib/validators";

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    mode: "onChange",
    defaultValues: { dateOfBirth: "" },
  });

  function onSubmit(values: SignupFormValues) {
    const { name, email, password, dateOfBirth } = values;
    signup.mutate(
      { name, email, password, dateOfBirth },
      {
        onSuccess: () => router.replace("/profile?welcome=1"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create your account ✨</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join the community. Your next connection awaits.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
        <AuthField
          id="name"
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register("name")}
        />
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
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => (
            <DateOfBirthPicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              triggerRef={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <div>
          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border accent-cyan-600"
              {...register("terms")}
            />
            <span>
              I agree to the{" "}
              <span className="font-semibold text-primary">Terms of Service</span> and{" "}
              <span className="font-semibold text-primary">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-xs text-destructive">{errors.terms.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || signup.isPending}
          className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {signup.isPending ? "Creating account..." : "Create free account"}
          {!signup.isPending && <ArrowRight className="size-4" />}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
