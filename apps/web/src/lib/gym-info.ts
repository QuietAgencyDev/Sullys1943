/**
 * Soft-launch gym facts — resolves from active brand (Sully default / Red Owl when NEXT_PUBLIC_BRAND=red-owl).
 */
import { getBrand } from "./brand";

export const GYM = getBrand().gym;

export function formatAddress(separator = ", ") {
  return `${GYM.addressLine1}${separator}${GYM.addressLine2}`;
}
