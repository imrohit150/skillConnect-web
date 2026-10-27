import { API_ROUTES } from "@/constants/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfter?: number;
  attemptsRemaining?: number;
  constructor(message: string, status: number, details: { code?: string; retryAfter?: number; attemptsRemaining?: number } = {}) {
    super(message);
    this.status = status;
    this.code = details.code;
    this.retryAfter = details.retryAfter;
    this.attemptsRemaining = details.attemptsRemaining;
  }
}

let refreshPromise: Promise<boolean> | null = null;

// Parallel 401s share one refresh call, so the rotated refresh token isn't used twice.
function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${API_URL}${API_ROUTES.auth.refresh}`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function request(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers });
}

const NO_REFRESH_PATHS: string[] = [
  API_ROUTES.auth.login,
  API_ROUTES.auth.signup,
  API_ROUTES.auth.pendingSignup,
  API_ROUTES.auth.verifyEmail,
  API_ROUTES.auth.resendVerification,
  API_ROUTES.auth.refresh,
];

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await request(path, init);

  if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    if (await refreshSession()) {
      res = await request(path, init);
    }
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const retryAfterHeader = Number(res.headers.get("Retry-After"));
    throw new ApiError(body?.message ?? "Something went wrong", res.status, {
      code: body?.code,
      attemptsRemaining: body?.attemptsRemaining,
      retryAfter: body?.retryAfter ?? (retryAfterHeader > 0 ? retryAfterHeader : undefined),
    });
  }
  return body as T;
}
