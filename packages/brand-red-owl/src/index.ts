/**
 * Red Owl Boxing Scarborough — brand pack (Phase A gym facts).
 * Sources: redowlboxing.com/pages/scarborough-members, scarboroughsmartbox.ca
 * Do not merge into Sully defaults — load only when NEXT_PUBLIC_BRAND=red-owl.
 */

export const RED_OWL_SLUG = "red-owl" as const;

export const redOwlGym = {
  name: "Red Owl Boxing",
  legalName: "Red Owl 2021",
  shortName: "Red Owl 2021",
  tagline: "Train like a fighter. Think like a champion.",
  partnerLine: "Powered by Scarberian Boxing Club",
  addressLine1: "2206 Eglinton Ave E, Unit 120",
  addressLine2: "Scarborough, ON M1L 2N3",
  addressHint: "Same building as Mandarin — west side entrance",
  phoneDisplay: "(647) 572-5664",
  phoneTel: "+16475725664",
  phoneAltDisplay: "",
  phoneAltTel: "",
  email: "info.scarberianboxingclub@gmail.com",
  emailOwner: "info.scarberianboxingclub@gmail.com",
  website: "https://www.redowlboxing.com",
  membersUrl: "https://www.redowlboxing.com/pages/scarborough-members",
  smartboxUrl: "https://scarboroughsmartbox.ca",
  shopUrl: "https://www.redowlboxing.com/collections/all-merchandise",
  donationsUrl: "https://www.redowlboxing.com",
  boxrecUrl: "",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=2206+Eglinton+Ave+E+Unit+120+Scarborough+ON",
  mapEmbedQuery: "2206+Eglinton+Ave+E,+Unit+120,+Scarborough,+ON+M1L+2N3",
  hours: [
    { days: "Mon – Fri", open: "5:00 PM", close: "10:00 PM" },
    { days: "Saturday", open: "Coming soon", close: "" },
    { days: "Sunday", open: "Closed", close: "" },
  ],
  hoursSummary: "Mon–Fri 5:00 PM–10:00 PM · Sat coming soon",
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    twitter: "https://twitter.com/",
  },
} as const;

export const redOwlCopy = {
  brandSub: "RED OWL 2021 · Scarborough",
  manifesto: [
    "Train like a fighter",
    "Think like a champion",
    "Scarborough's new home for champions",
  ] as const,
  lead: "Red Owl × Scarberian — boxing classes, open gym, and a fighter's lifestyle at 2206 Eglinton Ave E.",
  ctaPrimary: "Start 3-day trial",
  ctaPrimaryHref: "/trial",
  ctaSecondary: "Visit the gym",
  ctaSecondaryHref: "/contact",
  ctaTertiary: "Smartbox program",
  ctaTertiaryHref: "/smartbox",
  footerBlurb:
    "RED OWL 2021 — Scarborough Smartbox & Red Owl Boxing. Platform by Quiet Agency.",
  appName: "RED OWL 2021",
  appSubtitle: "Member app",
  established: 2021,
} as const;

export const redOwlAssets = {
  logoPrimary: "/brand/red-owl/logo-stacked.png",
  logoHorizontal: "/brand/red-owl/logo-horizontal.png",
  markRed: "/brand/red-owl/mark-red.png",
  markWhite: "/brand/red-owl/mark-white.png",
  /** Scarborough Smartbox / Red Owl originals only — never Sully assets */
  heroImage: "/gym/red-owl/smartbox-training.jpg",
  smartboxTraining: "/gym/red-owl/smartbox-training.jpg",
  smartboxJunior: "/gym/red-owl/smartbox-junior-jabs.jpg",
  smartboxHeroAlt: "/gym/red-owl/smartbox-hero.jpg",
  scarboroughGym: "/gym/red-owl/scarborough-gym-3.jpg",
  fightNight: "/gym/red-owl/redowl-fight-night.jpg",
  eventCrowd: "/gym/red-owl/redowl-event-crowd.jpg",
  ring: "/gym/red-owl/redowl-ring-1.jpg",
} as const;

export const redOwlMeta = {
  title: "RED OWL 2021 | Train like a fighter",
  description:
    "RED OWL 2021 — Red Owl Boxing Scarborough & Smartbox. Member app, classes, digital card. Platform by Quiet Agency.",
  applicationName: "REDOWL2021",
  themeColor: "#E10600",
} as const;

export const redOwlBrand = {
  id: RED_OWL_SLUG,
  gym: redOwlGym,
  copy: redOwlCopy,
  assets: redOwlAssets,
  meta: redOwlMeta,
} as const;

export type RedOwlBrand = typeof redOwlBrand;
