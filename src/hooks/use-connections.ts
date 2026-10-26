import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersKey } from "@/hooks/use-users";
import * as connectionsService from "@/services/connections.services";

export const receivedRequestsKey = ["requests", "received"] as const;
export const sentRequestsKey = ["requests", "sent"] as const;
export const passedUsersKey = ["requests", "passed"] as const;
export const connectionsKey = ["connections"] as const;

export function useConnections() {
  return useQuery({
    queryKey: connectionsKey,
    queryFn: connectionsService.getConnections,
  });
}

export function useRemoveConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionsKey });
      queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}

export function usePassedUsers() {
  return useQuery({
    queryKey: passedUsersKey,
    queryFn: connectionsService.getPassedUsers,
  });
}

export function useUnpassUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.unpassUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passedUsersKey });
      queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}

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

export function useSendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.sendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      queryClient.invalidateQueries({ queryKey: sentRequestsKey });
    },
  });
}

export function usePassUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectionsService.passUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      queryClient.invalidateQueries({ queryKey: passedUsersKey });
    },
  });
}
