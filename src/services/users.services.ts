import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { UserFilters, UsersPage } from "@/types";

export const USERS_PAGE_SIZE = 8;

export function getUsers(filters: UserFilters, page: number) {
  const params = new URLSearchParams({ page: String(page), limit: String(USERS_PAGE_SIZE) });
  if (filters.search) params.set("search", filters.search);
  if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
  return api<UsersPage>(`${API_ROUTES.users.list}?${params}`);
}
