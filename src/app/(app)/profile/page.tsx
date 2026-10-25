"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Code2, Globe, Image as ImageIcon, Link2, User } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth-field";
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

  const bioLength = (useWatch({ control, name: "bio" }) ?? "").length;
  const imageUrl = useWatch({ control, name: "profileImageUrl" });

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section className="glass space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold">Basics</h2>
        <div className="flex items-center gap-4">
          {imageUrl && !errors.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-16 rounded-full border object-cover" />
          ) : (
            <span className="bg-brand flex size-16 items-center justify-center rounded-full text-2xl font-bold text-white">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <AuthField
              id="profileImageUrl"
              label="Profile image URL"
              icon={ImageIcon}
              placeholder="https://..."
              error={errors.profileImageUrl?.message}
              {...register("profileImageUrl")}
            />
          </div>
        </div>
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

      <section className="glass space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold">Skills &amp; experience</h2>
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

      <section className="glass space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold">Links</h2>
        <AuthField id="github" label="GitHub" icon={Code2} placeholder="https://github.com/you" error={errors.github?.message} {...register("github")} />
        <AuthField id="linkedin" label="LinkedIn" icon={Link2} placeholder="https://linkedin.com/in/you" error={errors.linkedin?.message} {...register("linkedin")} />
        <AuthField id="portfolio" label="Portfolio" icon={Globe} placeholder="https://yoursite.dev" error={errors.portfolio?.message} {...register("portfolio")} />
      </section>

      <div className="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
        {welcome && (
          <button
            type="button"
            onClick={() => router.replace("/feed")}
            className="cursor-pointer text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Skip for now
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || update.isPending}
          className="bg-brand h-12 w-full cursor-pointer rounded-xl px-8 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
        >
          {update.isPending ? "Saving..." : welcome ? "Save and continue" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function ProfileContent() {
  const welcome = useSearchParams().get("welcome") === "1";
  const { data: profile, isPending, error } = useMyProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
