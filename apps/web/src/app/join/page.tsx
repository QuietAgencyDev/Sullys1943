import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JoinForm } from "./join-form";

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <JoinForm />
      <SiteFooter />
    </>
  );
}
