import type { Profile } from "@/types";

// A profile must have a photo and at least one skill before the rest of the app unlocks.
export function isProfileComplete(profile: Profile) {
  return Boolean(profile.profileImageUrl && (profile.skills?.length ?? 0) > 0);
}
