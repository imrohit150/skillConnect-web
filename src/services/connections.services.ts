import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { PassedUser, ReceivedRequest, SentRequest } from "@/types";

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

export function sendRequest(userId: string) {
  return api(API_ROUTES.connections.request(userId), { method: "POST" });
}

export function passUser(userId: string) {
  return api(API_ROUTES.users.pass(userId), { method: "POST" });
}

export function unpassUser(userId: string) {
  return api(API_ROUTES.users.pass(userId), { method: "DELETE" });
}

export async function getPassedUsers() {
  return (await api<{ users: PassedUser[] }>(API_ROUTES.users.passed)).users;
}
