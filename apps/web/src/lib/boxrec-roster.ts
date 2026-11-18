/**
 * BoxRec IDs and records found for the current floor.
 * A person is listed only when a BoxRec page names them.
 * No record is filled in from another site.
 */

export type BoxRecPerson = {
  name: string;
  role: string;
  kind: "pro" | "amateur" | "trainer";
  id: string;
  href: string;
  record: string | null;
  detail: string;
  active: boolean;
};

export const BOXREC_COACHES: BoxRecPerson[] = [
  {
    name: "Tony Morrison",
    role: "Coach",
    kind: "pro",
    id: "1247",
    href: "https://boxrec.com/en/box-pro/1247",
    record: "17-12-1, 11 knockouts",
    detail: "Heavyweight. 30 bouts, 178 rounds. Career 1984–1990. Debut 5 June 1984. Birth name Anthony Delroy Morrison. Toronto. Status on BoxRec: inactive.",
    active: true,
  },
  {
    name: "Jonathan Bochner",
    role: "Coach",
    kind: "trainer",
    id: "883646",
    href: "https://boxrec.com/en/trainer/883646",
    record: null,
    detail: "Trainer page. Active. Canada, Ontario. Club listed as Sully's Boxing Gym. BoxRec does not publish his bout record on that page.",
    active: true,
  },
];

export const BOXREC_FIGHTERS: BoxRecPerson[] = [
  {
    name: "Karlson Taniform",
    role: "Fighter",
    kind: "amateur",
    id: "1306499",
    href: "https://boxrec.com/en/box-am/1306499",
    record: "11-3-0, 2 knockouts",
    detail: "Super welter. 14 bouts, 41 rounds. Career 2024–2026. Debut 30 November 2024. Toronto. Club: Sully's Boxing Gym. Trainers: Jonathan Bochner and Jacklyne Irvine.",
    active: true,
  },
  {
    name: "Daniel Lyons",
    role: "Fighter",
    kind: "amateur",
    id: "1425816",
    href: "https://boxrec.com/en/box-am/1425816",
    record: "3-1-0, 1 knockout",
    detail: "Welterweight. 4 bouts, 10 rounds. Debut 5 February 2026. Club: Sully's Gym, Toronto. Trainers: Jonathan Bochner and Jacklyne Irvine.",
    active: true,
  },
  {
    name: "John Patrick Jones",
    role: "Fighter",
    kind: "amateur",
    id: "1357126",
    href: "https://boxrec.com/en/box-am/1357126",
    record: "0-3-0",
    detail: "Super welter. BoxRec header is 0-3-0, with 3 knockout losses. The same page lists 4 bouts. Debut 5 July 2025. Toronto. Club: Sully's Gym, Toronto. Trainers: Jonathan Bochner and Jacklyne Irvine.",
    active: true,
  },
  {
    name: "Yevhenii Miroshnychenko",
    role: "Fighter",
    kind: "amateur",
    id: "1306512",
    href: "https://boxrec.com/en/box-am/1306512",
    record: "0-1-0",
    detail: "1 bout, 3 rounds. Debut 30 November 2024. Toronto. Club: Sully's Gym, Toronto. Trainers: Jonathan Bochner and Jacklyne Irvine. Status on BoxRec: inactive.",
    active: false,
  },
];

const ALL = [...BOXREC_COACHES, ...BOXREC_FIGHTERS];

export function boxrecForName(name: string): BoxRecPerson | null {
  const key = name.trim().toLowerCase();
  return ALL.find((person) => person.name.toLowerCase() === key) ?? null;
}
