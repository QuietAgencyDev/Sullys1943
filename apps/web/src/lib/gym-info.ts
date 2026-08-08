/** Soft-launch gym facts — single source for marketing + contact. */
export const GYM = {
  name: "Sully's Boxing Gym",
  legalName: "Sully's Recreation & Athletic Centre",
  tagline: "Canada's oldest boxing club · EST 1943",
  addressLine1: "1554 Dundas St W (lower level)",
  addressLine2: "Toronto, ON M6H 1Z6",
  phoneDisplay: "(416) 805-8108",
  phoneTel: "+14168058108",
  phoneAltDisplay: "+1-647-284-1510",
  phoneAltTel: "+16472841510",
  email: "info@sullysboxinggym.com",
  emailOwner: "danielle@sullysboxinggym.com",
  website: "https://www.sullysboxinggym.com",
  shopUrl: "https://www.sullysboxinggym.com/shop/",
  donationsUrl: "https://www.sullysboxinggym.com/donations/",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1554+Dundas+St+W+Toronto+ON+M6H+1Z6",
  mapEmbedQuery: "1554+Dundas+St+W,+Toronto,+ON+M6H+1Z6",
  hours: [
    { days: "Mon – Fri", open: "7:30 AM", close: "9:00 PM" },
    { days: "Saturday", open: "12:00 PM", close: "5:00 PM" },
    { days: "Sunday", open: "Closed", close: "" },
  ],
  hoursSummary: "Mon–Fri 7:30 AM–9:00 PM · Sat 12–5 PM",
  social: {
    instagram: "https://www.instagram.com/sullysboxinggym/",
    facebook: "https://www.facebook.com/sullysboxinggym/",
    twitter: "https://twitter.com/sullysboxinggym",
  },
} as const;

export function formatAddress(separator = ", ") {
  return `${GYM.addressLine1}${separator}${GYM.addressLine2}`;
}
