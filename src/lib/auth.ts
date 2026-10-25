import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  premiumStatus?: boolean;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string; dateOfBirth: string };

export const currentUserKey = ["currentUser"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: async () => (await api<{ user: User }>("/auth/me")).user,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 401) && count < 1,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      api<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ user }) => queryClient.setQueryData(currentUserKey, user),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupInput) =>
      api<{ user: User }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ user }) => queryClient.setQueryData(currentUserKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSettled: () => queryClient.clear(),
  });
}
