/**
 * Resolve a member portrait URL.
 * Uses User.photoUrl when set; falls back to known demo portraits
 * until the AI member-photo system ships.
 */
export function resolveMemberPhoto(input: {
  photoUrl?: string | null;
  name?: string | null;
  email?: string | null;
}): string | null {
  if (input.photoUrl) return input.photoUrl;

  const email = (input.email ?? "").trim().toLowerCase();
  if (email === "member@sullys.local") return "/members/gavin-sheppard.png";

  const name = (input.name ?? "").trim().toLowerCase();
  if (name.includes("gavin") && name.includes("sheppard")) {
    return "/members/gavin-sheppard.png";
  }

  return null;
}
