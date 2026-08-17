import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { ProofCounters } from "@/components/proof-counters";
import { GymAtmosphere } from "@/components/gym-atmosphere";
import {
  WhySection,
  CascadeSection,
  ProgramsSection,
} from "@/components/vision-sections";
import { LiveClasses } from "@/components/live-classes";
import { LegacyTeaser } from "@/components/legacy-teaser";
import { StoreTeaser } from "@/components/store-teaser";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";

export default function HomePage() {
  const brand = getBrand();
  const isRedOwl = brand.id === "red-owl";

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        {isRedOwl ? null : <ProofCounters />}
        <GymAtmosphere />
        {isRedOwl ? null : (
          <>
            <WhySection />
            <CascadeSection />
          </>
        )}
        <ProgramsSection />
        <LiveClasses />
        {isRedOwl ? null : <LegacyTeaser />}
        <StoreTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
