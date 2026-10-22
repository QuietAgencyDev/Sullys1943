/**
 * Active product brand — driven by NEXT_PUBLIC_BRAND.
 * Default: sullys (unchanged production behaviour).
 * Local Red Owl: NEXT_PUBLIC_BRAND=red-owl
 */
import {
  redOwlBrand,
  redOwlGym,
  type RedOwlBrand,
} from "@sullys/brand-red-owl";

export type BrandId = "sullys" | "red-owl";

export type BrandGym = {
  name: string;
  legalName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  phoneDisplay: string;
  phoneTel: string;
  phoneAltDisplay: string;
  phoneAltTel: string;
  email: string;
  emailOwner: string;
  website: string;
  shopUrl: string;
  donationsUrl: string;
  boxrecUrl: string;
  mapUrl: string;
  mapEmbedQuery: string;
  hours: readonly { days: string; open: string; close: string }[];
  hoursSummary: string;
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  partnerLine?: string;
  addressHint?: string;
  membersUrl?: string;
  smartboxUrl?: string;
};

export type BrandConfig = {
  id: BrandId;
  gym: BrandGym;
  copy: {
    brandName: string;
    brandSub: string;
    manifesto: readonly string[];
    lead: string;
    footerBlurb: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    ctaTertiary: string;
    ctaTertiaryHref: string;
    appName: string;
    appSubtitle: string;
    established: number;
    demoMemberEmail: string;
    demoCoachEmail: string;
  };
  assets: {
    logoPrimary: string;
    logoAlt: string;
    heroImage: string;
  };
  meta: {
    title: string;
    description: string;
    applicationName: string;
    themeColor: string;
  };
  /** Marketing nav — Red Owl swaps Legacy/Donate for Smartbox/Trial */
  nav: readonly { href: string; label: string }[];
  showSullyPartners: boolean;
};

const SULLYS_NAV = [
  { href: "/legacy", label: "Legacy" },
  { href: "/coaches", label: "Coaches" },
  { href: "/classes", label: "Classes" },
  { href: "/programs", label: "Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Visit" },
  { href: "/join", label: "Join" },
] as const;

const RED_OWL_NAV = [
  { href: "/about", label: "About" },
  { href: "/smartbox", label: "Smartbox" },
  { href: "/coaches", label: "Team" },
  { href: "/classes", label: "Classes" },
  { href: "/programs", label: "Programs" },
  { href: "/trial", label: "Free trial" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Visit" },
  { href: "/join", label: "Join" },
] as const;

const sullysBrand: BrandConfig = {
  id: "sullys",
  gym: {
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
    boxrecUrl: "https://boxrec.com/en/club/3854",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=1554+Dundas+St+W+Toronto+ON+M6H+1Z6",
    mapEmbedQuery: "1554+Dundas+St+W,+Toronto,+ON+M6H+1Z6",
    hours: [
      { days: "Mon – Fri", open: "7:30 AM", close: "9:00 PM" },
      { days: "Saturday", open: "11:00 AM", close: "5:00 PM" },
      { days: "Sunday", open: "Closed", close: "" },
    ],
    hoursSummary: "Mon–Fri 7:30 AM–9:00 PM · Sat 11 AM–5 PM",
    social: {
      instagram: "https://www.instagram.com/sullysboxinggym/",
      facebook: "https://www.facebook.com/sullysboxinggym/",
      twitter: "https://twitter.com/sullysboxinggym",
    },
  },
  copy: {
    brandName: "Sully's",
    brandSub: "Boxing Gym · EST 1943",
    manifesto: [
      "Boxing is the engine",
      "People are the purpose",
      "Character is the legacy",
    ],
    lead: "We build character before life demands it — discipline, respect, and leadership through the craft of boxing.",
    footerBlurb:
      "Boxing is the engine. People are the purpose. Character is the legacy.",
    ctaPrimary: "Join Now",
    ctaPrimaryHref: "/join",
    ctaSecondary: "Visit the gym",
    ctaSecondaryHref: "/contact",
    ctaTertiary: "Legacy Wall",
    ctaTertiaryHref: "/legacy",
    appName: "Sully's",
    appSubtitle: "Member Portal",
    established: 1943,
    demoMemberEmail: "member@sullys.local",
    demoCoachEmail: "coach@sullys.local",
  },
  assets: {
    logoPrimary: "/brand/sullys-logo-primary.png",
    logoAlt: "Sully's Boxing Gym",
    heroImage: "/gym/hero-floor.jpg",
  },
  meta: {
    title: "Sully's Boxing Gym | Boxing is the engine · EST 1943",
    description:
      "Canada's oldest boxing club. Boxing is the engine. People are the purpose. Character is the legacy. Building character before life demands it.",
    applicationName: "Sully's",
    themeColor: "#C82026",
  },
  nav: SULLYS_NAV,
  showSullyPartners: true,
};

function toRedOwlConfig(pack: RedOwlBrand): BrandConfig {
  return {
    id: "red-owl",
    gym: {
      name: pack.gym.name,
      legalName: pack.gym.legalName,
      tagline: pack.gym.tagline,
      addressLine1: pack.gym.addressLine1,
      addressLine2: pack.gym.addressLine2,
      phoneDisplay: pack.gym.phoneDisplay,
      phoneTel: pack.gym.phoneTel,
      phoneAltDisplay: pack.gym.phoneAltDisplay,
      phoneAltTel: pack.gym.phoneAltTel,
      email: pack.gym.email,
      emailOwner: pack.gym.emailOwner,
      website: pack.gym.website,
      shopUrl: pack.gym.shopUrl,
      donationsUrl: pack.gym.donationsUrl,
      boxrecUrl: pack.gym.boxrecUrl,
      mapUrl: pack.gym.mapUrl,
      mapEmbedQuery: pack.gym.mapEmbedQuery,
      hours: pack.gym.hours,
      hoursSummary: pack.gym.hoursSummary,
      social: { ...pack.gym.social },
      partnerLine: pack.gym.partnerLine,
      addressHint: pack.gym.addressHint,
      membersUrl: pack.gym.membersUrl,
      smartboxUrl: pack.gym.smartboxUrl,
    },
    copy: {
      brandName: pack.copy.appName,
      brandSub: pack.copy.brandSub,
      manifesto: pack.copy.manifesto,
      lead: pack.copy.lead,
      footerBlurb: pack.copy.footerBlurb,
      ctaPrimary: pack.copy.ctaPrimary,
      ctaPrimaryHref: pack.copy.ctaPrimaryHref,
      ctaSecondary: pack.copy.ctaSecondary,
      ctaSecondaryHref: pack.copy.ctaSecondaryHref,
      ctaTertiary: pack.copy.ctaTertiary,
      ctaTertiaryHref: pack.copy.ctaTertiaryHref,
      appName: pack.copy.appName,
      appSubtitle: pack.copy.appSubtitle,
      established: pack.copy.established,
      demoMemberEmail: "member@redowl.local",
      demoCoachEmail: "coach@redowl.local",
    },
    assets: {
      logoPrimary: pack.assets.logoPrimary,
      logoAlt: pack.copy.appName,
      heroImage: pack.assets.heroImage,
    },
    meta: { ...pack.meta },
    nav: RED_OWL_NAV,
    showSullyPartners: false,
  };
}

export function getBrandId(): BrandId {
  const raw = (process.env.NEXT_PUBLIC_BRAND ?? "sullys").trim().toLowerCase();
  return raw === "red-owl" ? "red-owl" : "sullys";
}

export function getBrand(): BrandConfig {
  return getBrandId() === "red-owl" ? toRedOwlConfig(redOwlBrand) : sullysBrand;
}

/** @deprecated Prefer getBrand().gym — kept for existing imports */
export function getGym() {
  return getBrand().gym;
}

export { redOwlGym };
