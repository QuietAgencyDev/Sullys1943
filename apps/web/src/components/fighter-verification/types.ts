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

export function normalizeBoxrecHref(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  const path = id.startsWith("/") ? id : `/${id}`;
  return `https://boxrec.com${path}`;
}
