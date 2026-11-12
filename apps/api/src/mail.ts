/**
 * Transactional mail through Resend.
 * Cloudflare Email Routing receives people. It does not send the reset link.
 * With no RESEND_API_KEY the caller keeps the link in the server log only.
 */

export async function sendPasswordResetEmail(input: {
  to: string;
  firstName: string;
  resetLink: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from =
    process.env.EMAIL_FROM?.trim() ||
    "Sully's Boxing Gym <noreply@sullys1943.com>";
  const name = input.firstName.trim() || "Member";
  const text = [
    `${name},`,
    "",
    "A password reset was requested for your Sully's account.",
    "This link works for one hour:",
    input.resetLink,
    "",
    "If you did not ask for this, ignore the email. Your password stays the same.",
    "",
    "Sully's Boxing Gym",
    "https://www.sullys1943.com/app",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: "Reset your Sully's password",
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[auth] reset email failed ${res.status} ${detail.slice(0, 180)}`);
    return false;
  }
  return true;
}
