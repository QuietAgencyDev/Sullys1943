import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { getAllProgramSlugs, getProgram } from "@/lib/programs";
import styles from "../programs.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllProgramSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const brand = getBrand();
  const { slug } = await params;
  const program = getProgram(slug);
  const suffix =
    brand.id === "red-owl" ? "Red Owl Boxing" : "Sully's Boxing Gym";
  if (!program) return { title: `Program | ${suffix}` };
  return {
    title: `${program.name} | ${suffix}`,
    description: program.short,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const brand = getBrand();
  const isRedOwl = brand.id === "red-owl";
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Program</p>
        <h1 className={styles.title}>{program.name}</h1>
        <p className={styles.manifesto}>{program.lead}</p>
        <div className={styles.prose}>
          {program.body.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        <h2 className={styles.subhead}>What it builds</h2>
        <ul className={styles.outcomes}>
          {program.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <div className={styles.cta}>
          <Link href={isRedOwl ? "/join" : "/join"}>
            <Button type="button">
              {isRedOwl ? "Ask about joining" : "Start training"}
            </Button>
          </Link>
          <Link href="/programs">
            <Button type="button" variant="secondary">
              All programs
            </Button>
          </Link>
          {isRedOwl && slug.startsWith("smartbox") ? (
            <Link href="/smartbox">
              <Button type="button" variant="ghost">
                Smartbox overview
              </Button>
            </Link>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
