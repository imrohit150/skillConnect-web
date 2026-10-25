const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? "Something went wrong", res.status);
  }
  return body as T;
}
