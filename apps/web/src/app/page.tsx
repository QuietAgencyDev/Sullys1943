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

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProofCounters />
        <GymAtmosphere />
        <WhySection />
        <CascadeSection />
        <ProgramsSection />
        <LiveClasses />
        <LegacyTeaser />
        <StoreTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
