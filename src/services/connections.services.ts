import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { ReceivedRequest, SentRequest } from "@/types";

export async function getReceivedRequests() {
  return (await api<{ requests: ReceivedRequest[] }>(API_ROUTES.connections.received)).requests;
}

export async function getSentRequests() {
  return (await api<{ requests: SentRequest[] }>(API_ROUTES.connections.sent)).requests;
}

export function acceptRequest(requestId: string) {
  return api(API_ROUTES.connections.accept(requestId), { method: "PATCH" });
}

export function ignoreRequest(requestId: string) {
  return api(API_ROUTES.connections.ignore(requestId), { method: "PATCH" });
}

export function cancelRequest(requestId: string) {
  return api(API_ROUTES.connections.cancel(requestId), { method: "PATCH" });
}
