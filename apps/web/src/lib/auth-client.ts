import { get, post } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  /** Static or future AI member portrait path (e.g. /members/gavin-sheppard.png) */
  photoUrl?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
};

export function login(email: string, password: string) {
  return post<AuthResponse>("/api/v1/auth/login", { email, password });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return post<AuthResponse>("/api/v1/auth/register", input);
}

export function logout() {
  return post<void>("/api/v1/auth/logout");
}

export function getMe() {
  return get<AuthUser>("/api/v1/auth/me");
}
