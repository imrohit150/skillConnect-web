import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUserKey } from "@/hooks/use-auth";
import * as profileService from "@/services/profile.services";
import type { ProfileUpdate } from "@/types";

const profileKey = ["profile", "me"] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: profileService.getMyProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdate) => profileService.updateMyProfile(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(profileKey, user);
      queryClient.invalidateQueries({ queryKey: currentUserKey });
    },
  });
}
