import { useInfiniteQuery } from "@tanstack/react-query";
import * as usersService from "@/services/users.services";
import type { UserFilters } from "@/types";

export const usersKey = ["users"] as const;

export function useUsers(filters: UserFilters) {
  return useInfiniteQuery({
    queryKey: [...usersKey, filters],
    queryFn: ({ pageParam }) => usersService.getUsers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) =>
      pagination.hasNextPage ? pagination.page + 1 : undefined,
  });
}
