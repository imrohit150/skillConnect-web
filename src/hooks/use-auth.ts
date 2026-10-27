import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import * as authService from "@/services/auth.services";
import type { LoginInput, SignupInput } from "@/types";

export const currentUserKey = ["currentUser"] as const;
export const pendingSignupKey = ["pendingSignup"] as const;

export function usePendingSignup(enabled = true) {
  return useQuery({
    queryKey: pendingSignupKey, queryFn: authService.getPendingSignup,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
    staleTime: 0, enabled,
  });
}

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
    onMutate: () => queryClient.cancelQueries({ queryKey: currentUserKey }),
    onSuccess: ({ user }) => queryClient.setQueryData(currentUserKey, user),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signup(input),
    onMutate: () => queryClient.cancelQueries({ queryKey: pendingSignupKey }),
    onSuccess: ({ signup }) => queryClient.setQueryData(pendingSignupKey, signup),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.verifyEmail,
    onMutate: async () => { await queryClient.cancelQueries({ queryKey: currentUserKey }); await queryClient.cancelQueries({ queryKey: pendingSignupKey }); },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(currentUserKey, user);
      queryClient.removeQueries({ queryKey: pendingSignupKey });
    },
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.resendVerification,
    onMutate: () => queryClient.cancelQueries({ queryKey: pendingSignupKey }),
    onSuccess: ({ signup }) => queryClient.setQueryData(pendingSignupKey, signup),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.clear(),
  });
}
