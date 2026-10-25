"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, Code2, Globe, Image as ImageIcon, Link2, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth-field";
import { ProfileCard } from "@/components/profile-card";
import { TagInput } from "@/components/tag-input";
import { Label } from "@/components/ui/label";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-profile";
import type { Profile } from "@/types";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validators";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

function ProfileForm({ profile, welcome }: { profile: Profile; welcome: boolean }) {
  const router = useRouter();
  const update = useUpdateProfile();
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [interests, setInterests] = useState(profile.interests ?? []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.name,
      profileImageUrl: profile.profileImageUrl ?? "",
      bio: profile.bio ?? "",
      experienceLevel: profile.experienceLevel ?? "Beginner",
      github: profile.socialLinks?.github ?? "",
      linkedin: profile.socialLinks?.linkedin ?? "",
      portfolio: profile.socialLinks?.portfolio ?? "",
    },
  });

  const bio = useWatch({ control, name: "bio" }) ?? "";
  const bioLength = bio.length;
  const imageUrl = useWatch({ control, name: "profileImageUrl" });
  const name = useWatch({ control, name: "name" }) ?? "";
  const experienceLevel = useWatch({ control, name: "experienceLevel" });
  const previewImage = imageUrl && !errors.profileImageUrl ? imageUrl : undefined;

  function onSubmit(values: ProfileFormValues) {
    const { github, linkedin, portfolio, ...rest } = values;
    update.mutate(
      { ...rest, skills, interests, socialLinks: { github, linkedin, portfolio } },
      {
        onSuccess: () => {
          toast.success("Profile saved");
          if (welcome) router.replace("/feed");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="grid gap-6 lg:h-[calc(100dvh-14rem)] lg:min-h-[480px] lg:grid-cols-[22rem_minmax(0,1fr)]">
    <div className="flex justify-center lg:items-start">
      <ProfileCard
        name={name}
        bio={bio}
        imageUrl={previewImage}
        experienceLevel={experienceLevel}
        skills={skills}
      />
    </div>
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-col gap-4">
      <div className="scroll-thin glass min-h-0 flex-1 space-y-4 overflow-y-auto rounded-3xl border bg-card p-6 sm:p-8">
      <section className="space-y-4">
        <AuthField
          id="profileImageUrl"
          label="Profile image URL"
          icon={ImageIcon}
          placeholder="https://..."
          error={errors.profileImageUrl?.message}
          {...register("profileImageUrl")}
        />
        <AuthField
          id="name"
          label="Full name"
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-[13px] font-semibold">
            Bio
          </Label>
          <textarea
            id="bio"
            rows={4}
            maxLength={300}
            placeholder="Tell other developers about yourself..."
            className="w-full resize-none rounded-xl border bg-white/80 p-3.5 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
            {...register("bio")}
          />
          <p className="text-right text-xs text-muted-foreground">{bioLength}/300</p>
        </div>
      </section>

      <section className="space-y-4">
        <TagInput
          id="skills"
          label="Skills"
          placeholder="React, Node.js, MongoDB..."
          value={skills}
          onChange={setSkills}
        />
        <div className="space-y-1.5">
          <Label className="text-[13px] font-semibold">Experience level</Label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((level) => (
              <label
                key={level}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white/80 py-3 text-sm font-medium shadow-sm transition has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-accent-foreground"
              >
                <input type="radio" value={level} className="sr-only" {...register("experienceLevel")} />
                <Briefcase className="size-4" />
                {level}
              </label>
            ))}
          </div>
        </div>
        <TagInput
          id="interests"
          label="Interests"
          placeholder="Open source, AI, Web3..."
          value={interests}
          onChange={setInterests}
        />
      </section>

      <section className="space-y-4">
        <AuthField id="github" label="GitHub" icon={Code2} placeholder="https://github.com/you" error={errors.github?.message} {...register("github")} />
        <AuthField id="linkedin" label="LinkedIn" icon={Link2} placeholder="https://linkedin.com/in/you" error={errors.linkedin?.message} {...register("linkedin")} />
        <AuthField id="portfolio" label="Portfolio" icon={Globe} placeholder="https://yoursite.dev" error={errors.portfolio?.message} {...register("portfolio")} />
      </section>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="submit"
          disabled={!isValid || update.isPending}
          className="bg-brand flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {update.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {welcome ? "Save and continue" : "Update profile"}
            </>
          )}
        </button>
        {welcome && (
          <button
            type="button"
            onClick={() => router.replace("/feed")}
            className="cursor-pointer text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Skip for now
          </button>
        )}
      </div>
    </form>
    </div>
  );
}

function ProfileContent() {
  const welcome = useSearchParams().get("welcome") === "1";
  const { data: profile, isPending, error } = useMyProfile();

  return (
    <div className="mx-auto w-full max-w-[63.5rem] space-y-6">
      <div className="flex items-center gap-4">
        {!welcome && (
          <Link
            href="/feed"
            aria-label="Back to feed"
            className="glass flex size-11 shrink-0 items-center justify-center rounded-full border bg-white/80 text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {welcome ? (
            <>
              Welcome to <span className="text-gradient">SkillConnect</span> 🎉
            </>
          ) : (
            "Your profile"
          )}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {welcome
            ? "Tell developers about yourself so they can find and connect with you."
            : "Keep your details fresh so the right people find you."}
        </p>
        </div>
      </div>

      {isPending ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : (
        <ProfileForm profile={profile} welcome={welcome} />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
