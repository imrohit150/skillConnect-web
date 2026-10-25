import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import * as authService from "@/services/auth.services";
import type { LoginInput, SignupInput } from "@/types";

export const currentUserKey = ["currentUser"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: authService.getMe,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 401) && count < 1,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user }) => queryClient.setQueryData(currentUserKey, user),
  });
}

// Signup doesn't fill the user cache so the profile redirect isn't raced by the auth layout.
export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signup(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.clear(),
  });
}
