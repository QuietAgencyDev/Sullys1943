const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Login failed");
  }
  return res.json();
}

export async function me() {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}
