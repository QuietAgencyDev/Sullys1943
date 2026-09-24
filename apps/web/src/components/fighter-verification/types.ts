/**
 * How to integrate:
 * Import types from this file in FighterVerificationForm / FighterRecordLinks.
 * Do not add these fields to AuthUser / auth-client — keep auth payloads untouched.
 */
export type FighterVerification = {
  isCompetitiveFighter: boolean;
  boxingOntarioRegNum: string | null;
  boxrecIdPro: string | null;
  boxrecIdAmateur: string | null;
  links?: {
    boxrecPro: string | null;
    boxrecAmateur: string | null;
    boxingOntario: string | null;
  };
};

export function normalizeBoxrecHref(
  id: string | null | undefined,
  recordType: "pro" | "amateur",
): string | null {
  if (!id) return null;
  if (/^\d+$/.test(id)) {
    const division = recordType === "pro" ? "box-pro" : "box-am";
    return `https://boxrec.com/en/${division}/${id}`;
  }
  let path = id.startsWith("/") ? id : `/${id}`;
  if (path.startsWith("/box-pro/") || path.startsWith("/box-am/")) {
    path = `/en${path}`;
  }
  return `https://boxrec.com${path}`;
}
