import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProgram, PROGRAMS } from "@/lib/programs";
import styles from "../programs.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return { title: "Program | Sully's" };
  return {
    title: `${program.name} | Sully's Boxing Gym`,
    description: program.short,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
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
          <Link href="/join">
            <Button type="button">Start training</Button>
          </Link>
          <Link href="/programs">
            <Button type="button" variant="secondary">
              All programs
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
