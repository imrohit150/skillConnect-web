import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { Profile, ProfileUpdate } from "@/types";

export async function getMyProfile() {
  return (await api<{ user: Profile }>(API_ROUTES.profile.me)).user;
}

export function uploadProfileImage(file: File) {
  const body = new FormData();
  body.append("image", file);
  return api<{ user: Profile }>(API_ROUTES.profile.image, { method: "POST", body });
}

export function updateMyProfile(input: ProfileUpdate) {
  return api<{ user: Profile }>(API_ROUTES.profile.me, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
