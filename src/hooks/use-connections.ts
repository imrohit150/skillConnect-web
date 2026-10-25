import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as connectionsService from "@/services/connections.services";

export const receivedRequestsKey = ["requests", "received"] as const;
export const sentRequestsKey = ["requests", "sent"] as const;

export function useReceivedRequests() {
  return useQuery({
    queryKey: receivedRequestsKey,
    queryFn: connectionsService.getReceivedRequests,
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: sentRequestsKey,
    queryFn: connectionsService.getSentRequests,
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivedRequestsKey });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useIgnoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.ignoreRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receivedRequestsKey }),
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.cancelRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sentRequestsKey }),
  });
}
