/**
 * Browser calls are same-origin ("" + /api/v1/...) and proxied by next.config rewrites.
 * Server components still call the absolute API URL directly.
 */
function resolveApiUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  }
  return "";
}

const API_URL = resolveApiUrl();

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function redirectOnUnauthorized(status: number) {
  if (typeof window === "undefined" || status !== 401) return;
  const path = window.location.pathname;
  if (path.startsWith("/app/login") || path.startsWith("/app/register")) return;
  const next = `${path}${window.location.search}`;
  const safeNext =
    next.startsWith("/app") && !next.startsWith("//")
      ? `?next=${encodeURIComponent(next)}`
      : "";
  window.location.href = `/app/login${safeNext}`;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const base = resolveApiUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    redirectOnUnauthorized(res.status);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body
        ? Array.isArray((body as { message: unknown }).message)
          ? ((body as { message: string[] }).message.join(", "))
          : typeof (body as { message: unknown }).message === "string"
            ? (body as { message: string }).message
            : `Request failed (${res.status})`
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function get<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(path, { ...init, method: "GET" });
}

export function post<T>(path: string, body?: unknown, init?: RequestInit) {
  return apiFetch<T>(path, {
    ...init,
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function patch<T>(path: string, body?: unknown, init?: RequestInit) {
  return apiFetch<T>(path, {
    ...init,
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function downloadAuthenticated(path: string, filename: string) {
  const base = resolveApiUrl();
  const res = await fetch(`${base}${path}`, { credentials: "include" });
  if (!res.ok) {
    redirectOnUnauthorized(res.status);
    throw new ApiError(res.status, `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { API_URL };
