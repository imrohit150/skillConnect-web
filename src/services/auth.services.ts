import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { LoginInput, SignupInput, User } from "@/types";

export async function getMe() {
  return (await api<{ user: User }>(API_ROUTES.auth.me)).user;
}

export function login(input: LoginInput) {
  return api<{ user: User }>(API_ROUTES.auth.login, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function signup(input: SignupInput) {
  return api<{ user: User }>(API_ROUTES.auth.signup, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return api(API_ROUTES.auth.logout, { method: "POST" });
}
