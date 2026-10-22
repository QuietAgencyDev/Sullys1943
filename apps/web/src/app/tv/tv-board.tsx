"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBrand } from "@/lib/brand";
import styles from "./tv.module.css";
import {
  TvRiveLayer,
  TvArtNote,
  hasArtPopup,
  readDemoCelebrate,
  readNoteFreeze,
  readPopupFreeze,
  readRiveEnabled,
  type FloorPopupMode,
} from "./tv-rive-layer";
import { dealFloorAdOrder, FLOOR_ADS } from "./tv-art-popup";
import { TvBoxerRig } from "./tv-boxer-rig";

const DEMO_MODES = [
  "achievement",
  "xp_bonus",
  "teams",
  "challenge",
  "leaderboard",
  "class_complete",
  "timer",
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function floorLabel(brandName: string) {
  return `${brandName} floor`;
}

type SessionCard = {
  id: string;
  title: string;
  program: string | null;
  coach: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  spotsLeft: number;
  phase: "upcoming" | "live" | "done";
  secondsToStart: number;
  secondsRemaining: number;
};

type CoachTimer = {
  sessionId: string;
  title: string;
  coach: string | null;
  status: string;
  phase: "work" | "rest" | string;
  round: number;
  totalRounds: number;
  workSec: number;
  restSec: number;
  secondsLeft: number;
  phaseEndsAt?: string | null;
  pausedRemainSec?: number | null;
  tvMode: string;
  tvMessage?: string | null;
  syncedToCoach: boolean;
  currentExercise?: { title: string; phase: string } | null;
  nextExercise?: { title: string; phase: string } | null;
  teams?: {
    rank: number;
    name: string;
    color: string;
    points: number;
    members: string[];
  }[];
  challenges?: {
    name: string;
    type: string;
    status: string;
    winnerLabel: string | null;
  }[];
};

type Board = {
  profile: "floor" | "reception";
  asOf: string;
  gym: { name: string; tagline: string; established: number };
  kpis: { checkInsToday: number; classesToday: number; spotsOpen: number };
  live: SessionCard | null;
  next: SessionCard | null;
  schedule: SessionCard[];
  calendar?: { label: string; sessions: SessionCard[] };
  leaderboard: {
    rank: number;
    displayName: string;
    xp: number;
    level: number;
    score?: number;
  }[];
  ticker: { name: string; at: string }[];
  manifesto: string[];
  refreshSeconds: number;
  coachTimer?: CoachTimer | null;
};

type FeedKind = "quote" | "trivia" | "system" | "checkin";
type FeedLine = { kind: FeedKind; text: string };

const FLOOR_QUOTES: FeedLine[] = [
  { kind: "quote", text: "Protect yourself at all times." },
  { kind: "quote", text: "Everyone has a plan until they get hit." },
  { kind: "quote", text: "Chin down. Hands up. Eyes open." },
  { kind: "quote", text: "The jab is the steering wheel." },
  { kind: "quote", text: "Don't count the rounds. Make the rounds count." },
  { kind: "quote", text: "Float like a butterfly. Sting like a bee." },
  { kind: "quote", text: "Champions are built on the quiet days." },
  { kind: "quote", text: "Slip the punch. Take the round." },
  { kind: "quote", text: "The bell doesn't lie." },
  { kind: "quote", text: "Work the body. The head will follow." },
];

const FLOOR_TRIVIA: FeedLine[] = [
  { kind: "trivia", text: "Trivia · Pro round: 3 minutes. Rest: 1." },
  { kind: "trivia", text: "Trivia · Orthodox left. Southpaw right." },
  { kind: "trivia", text: "Trivia · The jab is boxing's most thrown punch." },
  { kind: "trivia", text: "Trivia · Championship distance was 12 rounds." },
  { kind: "trivia", text: "Trivia · Sweet science — coined in 1813." },
  { kind: "trivia", text: "Trivia · A 10-count is mercy. Beat it." },
  { kind: "trivia", text: "Trivia · Ring is 16–20 ft. Nowhere to hide." },
  { kind: "trivia", text: "Trivia · Double-end = timing. Heavy bag = power." },
  { kind: "trivia", text: "Trivia · Weight classes. Heart decides." },
  { kind: "trivia", text: "Trivia · Knockdown: mandatory 8-count. Get up smart." },
  { kind: "trivia", text: "Trivia · Neutral corner after a knockdown." },
  { kind: "trivia", text: "Trivia · Liver shot ends fights upstairs can't." },
];

const FLOOR_SULLYS: FeedLine[] = [
  { kind: "trivia", text: "Sully's · Canada's oldest boxing club · EST 1943." },
  { kind: "trivia", text: "Earl “Sully” Sullivan · born Mimico, 1914." },
  { kind: "trivia", text: "Sully opened on Queen St before the Ossington chapter." },
  { kind: "trivia", text: "Deacon Allen's Athletic Club — the room Sully bought in 1964." },
  { kind: "trivia", text: "Sully bought the Athletic Club in 1964 · Ossington." },
  { kind: "trivia", text: "109 Ossington · Ali camp · Heritage Toronto plaque." },
  { kind: "trivia", text: "Sully's rule: no drugs, no swearing — show respect." },
  { kind: "trivia", text: "Sully trained youth free — character before the bell." },
  { kind: "trivia", text: "March 1966 · Ali trained at Sully's for Chuvalo." },
  { kind: "trivia", text: "Ali's Ossington speed-bag frame is still in this gym." },
  { kind: "trivia", text: "Chuvalo, Clyde Gray, and Lewis walked this Toronto floor." },
  { kind: "trivia", text: "Joe Azores · Sully's amateur · Canadian Golden Gloves, 1973." },
  { kind: "trivia", text: "Earl Sullivan passed in 1999. The gym kept the name and the rules." },
  { kind: "trivia", text: "Joe Manteiga kept Sully's doors open after Sully." },
  { kind: "trivia", text: "Danielle Manteiga · next generation · same gym, same mission." },
  { kind: "trivia", text: "Coaches Dupont and Wade held the floor through the Ossington years." },
  { kind: "trivia", text: "2019 · Sully's moved to 1554 Dundas St W · west-end chapter." },
  { kind: "trivia", text: "Sully's · about 2,000 square feet · bags, ring, and a packed floor." },
  { kind: "trivia", text: "Sully's · 1554 Dundas St W · same mission, new chapter." },
  { kind: "trivia", text: "Heritage Toronto marked 109 Ossington. The work moved west." },
];

const FLOOR_CHUVALO: FeedLine[] = [
  { kind: "trivia", text: "George Chuvalo · 1937–2026 · Toronto's heavyweight rests." },
  { kind: "trivia", text: "Chuvalo passed Feb 12, 2026. The chin that never went down." },
  { kind: "trivia", text: "Rest in peace, George Chuvalo · 93 fights · never knocked down." },
  { kind: "trivia", text: "Chuvalo · never knocked down in 93 pro fights." },
  { kind: "trivia", text: "March 29, 1966 · Chuvalo goes 15 with Ali at the Gardens." },
  { kind: "trivia", text: "Chuvalo · Toronto's chin that would not go down." },
  { kind: "trivia", text: "Chuvalo fought Ali, Frazier, and Foreman — still standing." },
  { kind: "trivia", text: "Chuvalo · Canadian heavyweight champion · Toronto legend." },
  { kind: "trivia", text: "Ali prepared for Chuvalo on Ossington. The city still talks." },
  { kind: "trivia", text: "Toronto remembers Chuvalo. Show up. Put in work. Stay standing." },
  { kind: "trivia", text: "George Chuvalo · wrap the hands. Protect the chin. Go the distance." },
  { kind: "trivia", text: "Chuvalo · Toronto born. Canadian heavyweight. Never hit the canvas." },
];

const FLOOR_CANADA: FeedLine[] = [
  { kind: "trivia", text: "Canada · George Dixon, 1890 — first Canadian-born world champ." },
  { kind: "trivia", text: "Canada · Tommy Burns, 1906 — first Canadian heavyweight world champ." },
  { kind: "trivia", text: "Canada · Bert Schneider — Olympic gold, Antwerp 1920." },
  { kind: "trivia", text: "Canada · Jimmy McLarnin — two-time welterweight world champ." },
  { kind: "trivia", text: "Lennox Lewis · Seoul gold 1988 · undisputed heavyweight champ." },
  { kind: "trivia", text: "Lewis · Canadian Olympic gold, then the world heavyweight crown." },
  { kind: "trivia", text: "Lennox Lewis · born London, raised in Kitchener · Canada's champ." },
  { kind: "trivia", text: "Lewis · the jab, the reach, the IQ — last undisputed of his era." },
  { kind: "trivia", text: "Lewis stopped Tyson in 2002. Eight rounds. The argument ended." },
  { kind: "trivia", text: "Lewis vs Holyfield, 1999 · two giants, one heavyweight crown." },
  { kind: "trivia", text: "Lennox Lewis · WBC, IBF, WBA · walked away a champion in 2003." },
  { kind: "trivia", text: "Lewis · Kitchener amateur halls to the top of the heavyweight world." },
  { kind: "trivia", text: "Razor Ruddock · Toronto heavyweight fire · two wars with Tyson." },
  { kind: "trivia", text: "Clyde Gray · Canadian welterweight great · names on these walls." },
  { kind: "trivia", text: "Arturo Gatti · Canadian warrior · Fight of the Year lore." },
  { kind: "trivia", text: "Canada · Jean Pascal and Adonis Stevenson — world champs." },
  { kind: "trivia", text: "Trevor Berbick · WBC heavyweight · last man to fight Ali." },
  { kind: "trivia", text: "Steve Molitor · Sarnia · two-time IBF super bantamweight champ." },
  { kind: "trivia", text: "Molitor · The Canadian Kid · Casino Rama title nights." },
  { kind: "trivia", text: "Molitor KO'd Michael Hunter for the IBF belt, 2006." },
  { kind: "trivia", text: "Donny Lalonde · The Golden Boy · light heavyweight world champ." },
  { kind: "trivia", text: "Yvon Durelle · The Fighting Fisherman · one round from the crown." },
  { kind: "trivia", text: "Matthew Hilton · Montreal · IBF light middleweight world champ." },
];

const FLOOR_VARGAS: FeedLine[] = [
  { kind: "trivia", text: "Sam Vargas · Brampton / Mississauga · Canadian welterweight champ." },
  { kind: "trivia", text: "Vargas · WBA-NABA welter champ · packed the Powerade Centre." },
  { kind: "trivia", text: "Vargas went 12 with Amir Khan. Stood up to Spence and Danny Garcia." },
  { kind: "trivia", text: "Sam Vargas · Colombian-born Canadian · GTA welterweight warrior." },
];

const FLOOR_HERON: FeedLine[] = [
  { kind: "trivia", text: "Kane Heron · Etobicoke · undefeated welterweight · 17-0-1." },
  { kind: "trivia", text: "Heron · NABA-WBA welter champ · Toronto's unbeaten 147." },
  { kind: "trivia", text: "Kane Heron · amateur national champ, then the pro unbeaten run." },
];

const FLOOR_MORRISON: FeedLine[] = [
  { kind: "trivia", text: "Tony “Kid” Morrison · Toronto · Canadian heavyweight champ." },
  { kind: "trivia", text: "Morrison · Jamaica to Lawrence Heights · Sully's trainer." },
  { kind: "trivia", text: "Kid Morrison stopped Leon Spinks in 33 seconds, 1988." },
  { kind: "trivia", text: "Morrison took the Canadian heavyweight belt in Mississauga, 1989." },
  { kind: "trivia", text: "Tony Morrison · Canadian light-heavy champ · 17-12-1, 11 KOs." },
  { kind: "trivia", text: "Morrison trained with Shawn O'Sullivan at Cabbagetown." },
  { kind: "trivia", text: "Kid Morrison still teaches on this floor. Ask him about the work." },
];

const FLOOR_EAST: FeedLine[] = [
  { kind: "trivia", text: "Shawn O'Sullivan · Cabbagetown Kid · Olympic silver, L.A. 1984." },
  { kind: "trivia", text: "O'Sullivan · amateur world champ 1981 · Toronto's 94-6 amateur run." },
  { kind: "trivia", text: "Egerton Marcus · Toronto · Olympic silver, Seoul 1988." },
  { kind: "trivia", text: "Marcus beat Sven Ottke on the way to that Olympic final." },
  { kind: "trivia", text: "Mark Leduc · Toronto · Olympic silver, Barcelona 1992." },
  { kind: "trivia", text: "Chris Johnson · Toronto · Olympic bronze, Barcelona 1992." },
  { kind: "trivia", text: "Frenchy Belanger · Cabbagetown · world flyweight champ, 1927." },
  { kind: "trivia", text: "Larry Gains · Toronto Terror · beat Schmeling and Carnera." },
  { kind: "trivia", text: "Gains · Cabbagetown · Canadian and British Empire heavyweight champ." },
  { kind: "trivia", text: "Otis “Magic” Grant · Montreal · WBO middleweight world champ." },
  { kind: "trivia", text: "Grant · first Black Quebecer to win a world title · 1997." },
  { kind: "trivia", text: "Otis Grant went 10 with Roy Jones Jr. after the middleweight crown." },
  { kind: "trivia", text: "Eric Lucas · Montreal · WBC super middleweight world champ." },
  { kind: "trivia", text: "David Lemieux · Montreal · IBF middleweight world champ." },
  { kind: "trivia", text: "Joachim Alcine · Montreal · WBA light-middleweight world champ." },
  { kind: "trivia", text: "Troy Amos-Ross · Brampton · two-time Olympic light heavyweight." },
];

const FLOOR_HISTORY: FeedLine[] = [
  { kind: "trivia", text: "George Dixon · Africville, Halifax · Little Chocolate · first Black world champ." },
  { kind: "trivia", text: "Dixon won bantamweight in 1890, then featherweight. Two-division pioneer." },
  { kind: "trivia", text: "George Dixon helped invent modern training — shadowboxing and the bag." },
  { kind: "trivia", text: "Sam Langford · Weymouth Falls, N.S. · one of the greatest never given a U.S. title shot." },
  { kind: "trivia", text: "Langford beat Joe Gans as a lightweight, then went 15 with Jack Johnson." },
  { kind: "trivia", text: "Langford held titles in Canada, England, Australia, and Mexico." },
  { kind: "trivia", text: "Tommy Burns · born Noah Brusso · Hanover, Ontario." },
  { kind: "trivia", text: "Burns · 5-foot-7 world heavyweight champ. Ten defences in 33 months." },
  { kind: "trivia", text: "Burns KO'd Ireland's Jem Roche in 88 seconds. Shortest title defence ever." },
  { kind: "trivia", text: "Christmas 1908 · Sydney · Burns vs Jack Johnson. The heavyweight world watched." },
  { kind: "trivia", text: "Jimmy McLarnin · Vancouver's Baby Face · beat Barney Ross for the welter crown." },
  { kind: "trivia", text: "Lou Brouillard · Quebec · world welterweight and middleweight champ in the '30s." },
  { kind: "trivia", text: "Jackie Callura · Hamilton · world featherweight champ, 1943." },
  { kind: "trivia", text: "Johnny Greco · Montreal welterweight · packed the Forum night after night." },
  { kind: "trivia", text: "Sammy Luftspring · Toronto · Canadian welter champ · Star of David on the trunks." },
  { kind: "trivia", text: "Luftspring boycotted Berlin 1936. Then won the Canadian welterweight belt." },
  { kind: "trivia", text: "Luftspring KO'd Frankie Genovese in 13 at Mutual Street Arena, 1938." },
  { kind: "trivia", text: "Lefty Gwynne · Toronto · Olympic bantamweight gold, Los Angeles 1932." },
  { kind: "trivia", text: "Bert Schneider · Montreal · Canada's first Olympic boxing gold, Antwerp 1920." },
  { kind: "trivia", text: "Antwerp 1920 · Canada's best Olympic boxing night. Five medals." },
  { kind: "trivia", text: "Horace “Lefty” Gwynne · the second Canadian Olympic boxing gold." },
  { kind: "trivia", text: "Canada has three Olympic boxing golds: Schneider, Gwynne, Lennox Lewis." },
  { kind: "trivia", text: "Yvon Durelle vs Archie Moore · Montreal Forum, 1958. Four knockdowns. Lore." },
  { kind: "trivia", text: "Durelle · Baie-Sainte-Anne's Fighting Fisherman · one night from the crown." },
  { kind: "trivia", text: "Maple Leaf Gardens · Ali vs Chuvalo · 15 rounds · March 29, 1966." },
  { kind: "trivia", text: "Championships used to go 15. Chuvalo went every round with Ali." },
  { kind: "trivia", text: "Clyde Gray · Toronto · two-time world-title challenger at welterweight." },
  { kind: "trivia", text: "Ruddock vs Tyson I and II · 1991. The Smash from Toronto." },
  { kind: "trivia", text: "Willie de Wit · Grande Prairie · Olympic heavyweight silver, L.A. 1984." },
  { kind: "trivia", text: "Dale Walters · Olympic bantamweight bronze, Los Angeles 1984." },
  { kind: "trivia", text: "Ray Downey · Halifax · Olympic bronze, Seoul 1988." },
  { kind: "trivia", text: "Seoul 1988 · Lewis gold, Marcus silver, Downey bronze. Canada's night." },
  { kind: "trivia", text: "Lewis stopped Riddick Bowe for Olympic gold in Seoul." },
  { kind: "trivia", text: "David Defiagbon · Olympic heavyweight silver, Atlanta 1996." },
  { kind: "trivia", text: "Wyatt Sanford · Paris 2024 bronze · first Canadian Olympic boxing medal in 28 years." },
  { kind: "trivia", text: "Mary Spencer · first Canadian woman in Olympic boxing, London 2012." },
  { kind: "trivia", text: "Women's Olympic boxing began in 2012. Canada was in that first draw." },
  { kind: "trivia", text: "Donny Lalonde · Winnipeg's Golden Boy · WBC light-heavy champ, 1987." },
  { kind: "trivia", text: "Lalonde fought Sugar Ray Leonard with two belts on the line." },
  { kind: "trivia", text: "Matthew Hilton · first Canadian world champ since Callura — 44 years later." },
  { kind: "trivia", text: "Arturo Gatti · born Montreal · three Fights of the Year with Micky Ward." },
  { kind: "trivia", text: "Gatti vs Ward I · Fight of the Year. A Canadian in a war." },
  { kind: "trivia", text: "Jean Pascal · Haitian-Canadian · light-heavy world champ out of Laval." },
  { kind: "trivia", text: "Pascal vs Hopkins · Bell Centre nights. Montreal on the world stage." },
  { kind: "trivia", text: "Adonis “Superman” Stevenson · KO'd Chad Dawson in 76 seconds for the WBC belt." },
  { kind: "trivia", text: "Stevenson · Haitian-Canadian southpaw · Knockout of the Year, 2013." },
  { kind: "trivia", text: "Scotty Olson · Edmonton's Bulldog · IBO flyweight world champ." },
  { kind: "trivia", text: "Leonard Dorin · Edmonton · IBF lightweight world champ." },
  { kind: "trivia", text: "Kirk Johnson · North Preston, N.S. · fought for the WBA heavyweight title." },
  { kind: "trivia", text: "Michael Olajide Jr. · Vancouver · a round from the WBA middleweight crown." },
  { kind: "trivia", text: "Arthur Biyarslanov · Toronto · Pan Am gold on home soil, 2015." },
  { kind: "trivia", text: "Ariane Fortin · Quebec · amateur world champion middleweight." },
  { kind: "trivia", text: "Tammara Thibeault · 2022 amateur world champ · Commonwealth gold too." },
  { kind: "trivia", text: "Amateur boxing in Canada runs through Boxing Canada. Nationals make teams." },
  { kind: "trivia", text: "The Canadian title is still a real belt. Earn it in a provincial ring." },
];

const FLOOR_OLYMPIANS: FeedLine[] = [
  { kind: "trivia", text: "Canadian boxing Olympians · 18 Olympic medals. Three of them gold." },
  { kind: "trivia", text: "Cliff Graham · Olympic bantamweight silver, Antwerp 1920." },
  { kind: "trivia", text: "Art Prud'homme · Olympic middleweight silver, Antwerp 1920." },
  { kind: "trivia", text: "Clarence Newton · Olympic lightweight bronze, Antwerp 1920." },
  { kind: "trivia", text: "Moe Herscovitch · Olympic middleweight bronze, Antwerp 1920." },
  { kind: "trivia", text: "Douglas Lewis · Olympic welterweight bronze, Paris 1924." },
  { kind: "trivia", text: "Raymond Smillie · Olympic welterweight bronze, Amsterdam 1928." },
  { kind: "trivia", text: "Jackie Callura · Hamilton · boxed at L.A. 1932, then won a world title." },
  { kind: "trivia", text: "Los Angeles 1984 · de Wit silver, O'Sullivan silver, Walters bronze." },
  { kind: "trivia", text: "Lennox Lewis boxed at L.A. 1984, then took gold in Seoul." },
  { kind: "trivia", text: "Scotty Olson · Edmonton · Olympic light-flyweight, Seoul 1988." },
  { kind: "trivia", text: "Howard Grant · Montreal · Olympic light-welterweight, Seoul 1988." },
  { kind: "trivia", text: "Barcelona 1992 · Leduc silver, Chris Johnson bronze. Two more on the podium." },
  { kind: "trivia", text: "Kirk Johnson · North Preston · Olympic heavyweight, Barcelona 1992." },
  { kind: "trivia", text: "Mike Strange · three-time Canadian boxing Olympian · 1992, 1996, 2000." },
  { kind: "trivia", text: "Domenic Figliomeni · Thunder Bay · Olympic flyweight, 1992 and 1996." },
  { kind: "trivia", text: "Billy Irwin · Sault Ste. Marie · Olympic lightweight, Barcelona 1992." },
  { kind: "trivia", text: "Andrew Kooner · Windsor · Olympic boxing, Sydney 2000 and Athens 2004." },
  { kind: "trivia", text: "Jean Pascal boxed for Canada at Athens 2004. Then the world titles." },
  { kind: "trivia", text: "Adam Trupish · Olympic welterweight · Athens 2004 and Beijing 2008." },
  { kind: "trivia", text: "Simon Kean · Olympic super heavyweight, London 2012." },
  { kind: "trivia", text: "Custio Clayton · Dartmouth · Olympic welterweight, London 2012." },
  { kind: "trivia", text: "Mary Spencer · Windsor · first Canadian woman in Olympic boxing, 2012." },
  { kind: "trivia", text: "Spencer reached the Olympic quarter-finals in London. Canada's first women's draw." },
  { kind: "trivia", text: "Arthur Biyarslanov · Toronto · boxed at Rio 2016 after Pan Am gold at home." },
  { kind: "trivia", text: "Ariane Fortin · Quebec · Olympic middleweight, Rio 2016." },
  { kind: "trivia", text: "Mandy Bujold · Kitchener · two-time Olympian · Rio 2016 and Tokyo 2020." },
  { kind: "trivia", text: "Bujold reached the Olympic flyweight quarter-finals in Rio." },
  { kind: "trivia", text: "Caroline Veyre · Olympic featherweight quarter-finals, Tokyo 2020." },
  { kind: "trivia", text: "Myriam Da Silva · Olympic welterweight, Tokyo 2020." },
  { kind: "trivia", text: "Tammara Thibeault · two-time Olympian · Tokyo quarter-finals, then Paris." },
  { kind: "trivia", text: "Wyatt Sanford · Kennetcook Kid · two-time Olympian · Paris 2024 bronze." },
  { kind: "trivia", text: "Sanford · Kennetcook, N.S. · Pan Am gold 2023, then the Olympic podium." },
  { kind: "trivia", text: "28 years between Defiagbon's Atlanta silver and Sanford's Paris bronze." },
  { kind: "trivia", text: "Canada won boxing medals at four Games in bunches: 1920, 1984, 1988, 1992." },
  { kind: "trivia", text: "Team Canada boxing · amateurs to Olympians. The same work you do here." },
];

const FLOOR_WOMEN: FeedLine[] = [
  { kind: "trivia", text: "Jelena Mrdjenovich · Edmonton · long-time world featherweight champ." },
  { kind: "trivia", text: "Mrdjenovich · Canada's queen of the featherweights — belt after belt." },
  { kind: "trivia", text: "Kim Clavel · La Petite Furie · Montreal super-flyweight world champ." },
  { kind: "trivia", text: "Marie-Eve Dicaire · IBF super welter champ · Montreal technician." },
  { kind: "trivia", text: "Mary Spencer · three-time amateur world champ · Windsor to the Olympics." },
  { kind: "trivia", text: "Mandy Bujold · flyweight · Commonwealth gold and Olympic ring." },
  { kind: "trivia", text: "Tammara Thibeault · amateur world middleweight champ · Team Canada." },
  { kind: "trivia", text: "Caroline Veyre · Canadian amateur standout · Olympic boxing." },
  { kind: "trivia", text: "Women's boxing is championship boxing. Canada keeps proving it." },
];

const FLOOR_CURRENT: FeedLine[] = [
  { kind: "trivia", text: "Artur Beterbiev · fights out of Montreal · undisputed light heavyweight." },
  { kind: "trivia", text: "Christian Mbilli · Montreal super middleweight · ranked and coming." },
  { kind: "trivia", text: "Erik Bazinyan · Montreal · undefeated super middleweight hunter." },
  { kind: "trivia", text: "Custio Clayton · Dartmouth · Olympic welter, title-fight nights." },
  { kind: "trivia", text: "Wyatt Sanford · Nova Scotia · Olympic and Commonwealth boxing." },
  { kind: "trivia", text: "Steve Claggett · Calgary · super lightweight who keeps crashing the party." },
  { kind: "trivia", text: "Arslanbek Makhmudov · Montreal heavyweight · the Lion out of Quebec." },
  { kind: "trivia", text: "Lucian Bute · former super middleweight world champ · Quebec ring lore." },
  { kind: "trivia", text: "Eleider Alvarez · Montreal · the night he dropped Kovalev." },
];

const FLOOR_TORONTO: FeedLine[] = [
  { kind: "trivia", text: "Toronto boxing · Chuvalo's chin, O'Sullivan's amateur run, Ruddock's smash, Morrison on this floor." },
  { kind: "trivia", text: "Parkdale raised this gym. Ossington made it famous. Dundas West kept the doors open." },
  { kind: "trivia", text: "Dundas and Dufferin · the current chapter. The rules did not move." },
  { kind: "trivia", text: "Earl Sullivan was Mimico-born. The west end never left the name." },
  { kind: "trivia", text: "Maple Leaf Gardens, March 29, 1966 · 15 rounds · the building still hums." },
  { kind: "trivia", text: "The Gardens is a grocery store and a university gym now. Chuvalo's night is still in it." },
  { kind: "trivia", text: "Charles “Spider” Jones · three-time Golden Gloves · Canadian Boxing Hall of Fame." },
  { kind: "trivia", text: "Spider Jones was 22, working at Sully's, the day Ali walked onto Ossington." },
  { kind: "trivia", text: "Ossington, 1966 · two dollars to watch Ali hit the bag. The street filled up anyway." },
  { kind: "trivia", text: "Jim Brown and Howard Cosell came through with Ali. Spider Jones never forgot the noise." },
  { kind: "trivia", text: "Spider Jones called it the most electrifying day Toronto ever saw. It happened at Sully's." },
  { kind: "trivia", text: "Joe Manteiga came in 1966 to see Ali. He never really left." },
  { kind: "trivia", text: "Manteiga · North American Golden Gloves, 1973 · then he stayed to teach." },
  { kind: "trivia", text: "Mike Tyson once came by Sully's at seven in the morning. The door was still locked." },
  { kind: "trivia", text: "Fern Bull · another name on this roll, with Chuvalo, Clyde Gray, and Lewis." },
  { kind: "trivia", text: "Donovan “Razor” Ruddock · Jamaica to Toronto · the leaping left they named the Smash." },
  { kind: "trivia", text: "Ruddock and Tyson, twice in 1991. Toronto had a heavyweight the world had to answer." },
  { kind: "trivia", text: "Clyde Gray · Jamaica to Toronto · welterweight nights this city still says out loud." },
  { kind: "trivia", text: "Los Angeles 1984 · O'Sullivan and Frank Tate · Toronto still replays that final." },
  { kind: "trivia", text: "Cabbagetown Boxing Club · O'Sullivan's neighbourhood · still on the same Ontario cards." },
  { kind: "trivia", text: "From Cabbagetown to Dundas West, Toronto amateur boxing is one city." },
  { kind: "trivia", text: "Mark Leduc · Olympic silver for Toronto · then the courage to live in the open." },
  { kind: "trivia", text: "Toronto 2015 · Pan Am boxing on home canvas. The hemisphere came here." },
  { kind: "trivia", text: "Arthur Biyarslanov · Pan Am gold in his own city, 2015 · then Rio with Team Canada." },
  { kind: "trivia", text: "Frenchy Belanger · Cabbagetown flyweight · world champion in 1927, when this city was the fight." },
  { kind: "trivia", text: "Sammy Luftspring left Berlin off the team sheet. He brought the Canadian welter belt home instead." },
  { kind: "trivia", text: "Mutual Street Arena, 1938 · Luftspring stops Frankie Genovese in 13. Toronto packed the house." },
  { kind: "trivia", text: "Even the nights Chuvalo lost, the canvas never got him." },
  { kind: "trivia", text: "Ali at the Gardens. Frazier in New York. Foreman in the lights. Chuvalo stayed upright." },
];

const FLOOR_STORIES: FeedLine[] = [
  { kind: "trivia", text: "Montreal Forum, 1958 · round 1 · Durelle drops Archie Moore three times." },
  { kind: "trivia", text: "Moore gets up. Round 11, Moore ends it. The greatest Canadian round was the first." },
  { kind: "trivia", text: "Boxing Day 1908 · Sydney · Tommy Burns and Jack Johnson. A Canadian heavyweight champ in the fight that changed the line." },
  { kind: "trivia", text: "Burns was 5-foot-7 and took the fights bigger men ducked. Hanover, Ontario, on the throne." },
  { kind: "trivia", text: "George Dixon · Africville · shadowboxing, the bag, and the modern gym. He built the homework." },
  { kind: "trivia", text: "Sam Langford never got the title shot his wins had already earned. Nova Scotia still knows." },
  { kind: "trivia", text: "Lennox Lewis vs Vitali Klitschko, 2003 · a cut stops the night · Lewis leaves as champion." },
  { kind: "trivia", text: "Lewis retired on his feet. Not every heavyweight gets to write the last line." },
  { kind: "trivia", text: "Gatti and Ward, three times. A Montreal-born fighter in the wars people still screen." },
  { kind: "trivia", text: "Adonis Stevenson · 76 seconds · Chad Dawson down · the WBC belt changes corners." },
  { kind: "trivia", text: "Beterbiev does not nick rounds. Montreal houses a light heavyweight who ends them." },
  { kind: "trivia", text: "Eleider Alvarez · Storm · the Montreal night Kovalev went down." },
  { kind: "trivia", text: "Lucian Bute's left hook had its own area code. The Bell Centre answered." },
  { kind: "trivia", text: "Jean Pascal and Bernard Hopkins · old lion, young lion · Montreal would not sit down." },
  { kind: "trivia", text: "Kim Clavel · La Petite Furie · Montreal champion, and a nurse when the gloves came off." },
  { kind: "trivia", text: "Mandy Bujold · Kitchener · fought a ranking rule after pregnancy to get back to the Olympics." },
  { kind: "trivia", text: "Mary Spencer · Windsor · three amateur world titles before the Olympic door even opened for women." },
  { kind: "trivia", text: "Tammara Thibeault · world champion, Commonwealth champion, two Olympic teams. The middleweight standard." },
  { kind: "trivia", text: "Wyatt Sanford · Kennetcook · Paris bronze. Twenty-eight years is a long wait. He ended it." },
  { kind: "trivia", text: "Tony Pep · Winnipeg featherweight · years of world-title nights, Canadian to the laces." },
  { kind: "trivia", text: "Kevin Bizier · Quebec's Gentleman · a welterweight night with Errol Spence on the other side." },
  { kind: "trivia", text: "Steve Molitor · Sarnia · Casino Rama · the Canadian Kid with the IBF belt in the building." },
  { kind: "trivia", text: "Donny Lalonde put two belts on the line with Sugar Ray Leonard. Winnipeg's Golden Boy did not blink first." },
  { kind: "trivia", text: "Yvon Durelle was a fisherman who almost stole the light-heavyweight crown in one round." },
  { kind: "trivia", text: "Seoul 1988 · Lewis gold, Egerton Marcus silver, Ray Downey bronze. Canada on one podium night." },
  { kind: "trivia", text: "Antwerp 1920 · five Canadian boxing medals. Schneider's gold was the first." },
  { kind: "trivia", text: "Lefty Gwynne · Toronto bantamweight · Olympic gold, Los Angeles 1932. The city already knew how." },
  { kind: "trivia", text: "Jimmy McLarnin · Vancouver's Baby Face · welterweight wars with Barney Ross that still teach the craft." },
  { kind: "trivia", text: "Arturo Gatti was born in Montreal. The Garden learned his name the hard way." },
  { kind: "trivia", text: "Trevor Berbick held the WBC heavyweight belt. Tyson was 20. It lasted two rounds." },
  { kind: "trivia", text: "Otis Grant · first Black Quebecer to win a world title · then ten rounds with Roy Jones." },
  { kind: "trivia", text: "David Lemieux · Montreal middleweight power · an IBF belt and a city that likes a finisher." },
  { kind: "trivia", text: "Marie-Eve Dicaire · technician · IBF super welterweight · Montreal again." },
  { kind: "trivia", text: "Jelena Mrdjenovich · Edmonton · featherweight champion so long the belt looked borrowed from nobody." },
];

const FLOOR_ONTARIO: FeedLine[] = [
  { kind: "trivia", text: "Boxing Ontario runs the provincial card. This floor is on it." },
  { kind: "trivia", text: "Brampton Cup · Boxing Ontario · the GTA's proving ground. Four rings. Four days." },
  { kind: "trivia", text: "Brampton Cup 2025 · January 30 to February 2 · hosted by Bramalea Boxing Club." },
  { kind: "trivia", text: "Over 700 boxers. Sully's sent 22. Nineteen came home with medals." },
  { kind: "trivia", text: "Sully's took the Brampton Cup team award. The west end travelled in a pack." },
  { kind: "trivia", text: "Viktoria Penney · gold · women's 80 kg · Brampton Cup 2025 · trained on this floor." },
  { kind: "trivia", text: "Penney calls Sully's a family inside a gym. The medal says the work was real." },
  { kind: "trivia", text: "From Dundas West to Brampton. Same hands. Bigger room." },
  { kind: "trivia", text: "Silver Gloves · Ontario's youth crucible. Sully's has brought them home." },
  { kind: "trivia", text: "Golden Gloves · Manteiga in 1973, Spider Jones three times. The standard is old." },
  { kind: "trivia", text: "1973 · Azores, Canadian Golden Gloves. Manteiga, North American Golden Gloves. Both from this gym." },
  { kind: "trivia", text: "Club show, then Boxing Ontario, then Boxing Canada nationals. That is the staircase." },
  { kind: "trivia", text: "A provincial title is still a real belt. Earn it in an Ontario ring." },
  { kind: "trivia", text: "Novice, then open. The card says so. So does the homework." },
  { kind: "trivia", text: "Development rounds grow up: three by one, then three by two, then the open distance." },
  { kind: "trivia", text: "A 3-0 scorecard is a sweep. A 2-1 is the fight they argue about on the ride home." },
  { kind: "trivia", text: "RSC means the referee stopped it. Both corners live with that walk back." },
  { kind: "trivia", text: "Headgear on the development card. The pros take it off. The work is the same." },
  { kind: "trivia", text: "Win the room on Dundas. Then go win a weekend in Brampton." },
  { kind: "trivia", text: "Toronto kept the heavyweights. Montreal kept a generation of titles. The country kept the stories." },
  { kind: "trivia", text: "Kitchener gave us Lewis and Bujold. Sarnia gave us Molitor. Windsor gave us Spencer. Toronto gave us the floor." },
  { kind: "trivia", text: "Hamilton had Jackie Callura. Halifax had Dixon's memory. Every Canadian room is in this ticker." },
  { kind: "trivia", text: "The Canadian title is not a rumour. It is a belt you can still fight for." },
  { kind: "trivia", text: "Olympic trials start as a Tuesday in a provincial gym. Nobody skips the Tuesday." },
];

const FLOOR_SYSTEM: FeedLine[] = [
  { kind: "system", text: "Sully XP for showing up. Levels for staying." },
  { kind: "system", text: "Passport stamps every class you finish." },
  { kind: "system", text: "Streaks pay bonus Sully XP. Miss a day, start over." },
  { kind: "system", text: "Book your spot. Last spots go fast." },
  { kind: "system", text: "Check in. Train. Earn Sully XP. Repeat." },
  { kind: "system", text: "Floor leaderboard is Sully XP — claim it today." },
  { kind: "system", text: "10-second clap — finish the round." },
  { kind: "system", text: "Character before the bell." },
  { kind: "system", text: "We don't lower standards. We raise people." },
  { kind: "system", text: "Family on the floor. Kids in the craft." },
  { kind: "system", text: "Youth boxing · kids 6–14 · ask the desk." },
  { kind: "system", text: "Coach Tony is off the floor, recovering. Scan In His Corner." },
  { kind: "system", text: "Shout out Viktoria Penney · she organised Coach Tony's fundraiser." },
  { kind: "system", text: "Earl's Fight Shop · 1385 Dundas St. W · (416) 531-1331 · Mon & Tue 12–3 · Wed–Sun 12–7." },
  { kind: "system", text: "Sully's exclusive merch and fight gear are on the way for 2027." },
  { kind: "system", text: "New Sully's kit · made for this floor · fight gear arriving 2027." },
  { kind: "system", text: "XP leaders in each weight class win prizes. Climb your division." },
  { kind: "system", text: "Flyweight to heavyweight · the Sully XP leader in your class takes the prize." },
  { kind: "system", text: "Same weight class. Same leaderboard. Prizes for the ones who stay on it." },
  { kind: "system", text: "Brampton Cup 2025 · 22 from this gym · 19 medals · Penney with the gold." },
  { kind: "system", text: "New Sully's boxing card and passport · your QR signs you in when you arrive." },
  { kind: "system", text: "Open your check-in card. Hold the QR at the desk. That's the sign-in." },
  { kind: "system", text: "Members · sign your waiver before you train. Parents · sign for the younger members." },
  { kind: "system", text: "Attendance earns Sully XP. XP earns rewards. Show up and it counts." },
  { kind: "system", text: "Passport stamps the classes you finish. The card gets you through the door." },
];

const TICKER_FIRST_MS = 14000;
const TICKER_SCROLL_MS = 48000;
const TICKER_HOLD_MS = 5200;
const TICKER_PX_PER_SEC = 56;

const FLOOR_DEMO_CLASSES = [
  { title: "Boxtech", coach: "Rico Mancini" },
  { title: "Fight Path 2", coach: "Rico Mancini" },
  { title: "On the floor", coach: "Tommy" },
  { title: "On the floor", coach: "Levi" },
  { title: "On the floor", coach: "Viktoria Penney" },
  { title: "Tony's House of Pain", coach: "Tony Morrison" },
  { title: "Body Shop", coach: "Jackie" },
  { title: "Sweet Science", coach: "Anthony" },
] as const;

const FLOOR_CLASS_PHOTO_POOLS: { match: RegExp; srcs: string[]; rig?: boolean }[] = [
  {
    match: /rico|boxtech/i,
    rig: false,
    srcs: ["/tv/cast/coach-rico.png?v=1"],
  },
  {
    match: /\btommy\b/i,
    rig: false,
    srcs: ["/tv/cast/coach-tommy.png?v=1"],
  },
  {
    match: /\blevi\b/i,
    rig: false,
    srcs: ["/tv/cast/coach-levi.png?v=1"],
  },
  {
    match: /viktoria|penney|\bvik\b/i,
    rig: false,
    srcs: [
      "/tv/cast/coach-viktoria.png?v=1",
      "/tv/cast/coach-viktoria-blue.png?v=1",
    ],
  },
  {
    match: /tony|morrison|house of pain/i,
    rig: false,
    srcs: [
      "/coaches/tony-morrison.png?v=1",
      "/tv/cast/coach-tony-jab.png?v=hd1",
    ],
  },
  {
    match: /open gym/i,
    srcs: [
      "/tv/cast/coach-5-jab.png?v=hd2",
      "/tv/cast/coach-6-celebrate.png?v=hd2",
    ],
  },
  {
    match: /jackie|body shop|jacklyne|irvine|women/i,
    rig: false,
    srcs: [
      "/tv/cast/coach-8-guard.png?v=hd2",
      "/tv/cast/coach-8-hook.png?v=hd3",
      "/tv/cast/coach-8-hook-2.png?v=hd3",
    ],
  },
  { match: /pads/i, srcs: ["/tv/cast/coach-1-pads.png"] },
  {
    match: /youth|teen/i,
    srcs: ["/tv/cast/kid-2-hook.png?v=hd3", "/tv/cast/teen-2-guard.png"],
  },
  {
    match: /kids|kid/i,
    srcs: [
      "/tv/cast/kid-4-uppercut.png?v=hd3",
      "/tv/cast/kid-7-jab.png?v=hd3",
      "/tv/cast/kid-8-jab.png?v=hd3",
    ],
  },
];

function isKidsBoxingTitle(title?: string | null) {
  return Boolean(title && /kids boxing/i.test(title));
}

function floorClassPhoto(
  title?: string | null,
  coach?: string | null,
  seed = 0,
) {
  const haystack = `${title ?? ""} ${coach ?? ""}`;
  const pool = FLOOR_CLASS_PHOTO_POOLS.find((row) => row.match.test(haystack));
  const stills = pool?.srcs ?? [];
  // null slot = live Coach 2 rig. Women's Boxing stays on the female coach stills.
  const slots: Array<string | null> =
    pool?.rig === false ? stills : [...stills, null];
  if (!slots.length) return null;
  return slots[Math.abs(seed) % slots.length] ?? null;
}

function jitter(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const CHECKIN_TEMPLATES = [
  (name: string) => `${name} · on the floor`,
  (name: string) => `Laced up · ${name}`,
  (name: string) => `${name} checked in`,
  (name: string) => `${name} · ready for the bell`,
  (name: string) => `In the house · ${name}`,
] as const;

function shuffleFeed<T>(items: T[], seed: number): T[] {
  const next = items.slice();
  let state = seed || 1;
  for (let i = next.length - 1; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    const swap = next[i];
    const other = next[j];
    if (swap === undefined || other === undefined) continue;
    next[i] = other;
    next[j] = swap;
  }
  return next;
}

function weaveFloorFeed(input: {
  checkIns: { name: string }[];
  liveTitle: string | null;
  roundLabel: string | null;
  leaderName: string | null;
  leaderXp: number | null;
  checkInsToday: number | null;
  spotsOpen: number | null;
  minute: number;
}): FeedLine[] {
  const knowledge = shuffleFeed(
    [
      ...FLOOR_QUOTES,
      ...FLOOR_SULLYS,
      ...FLOOR_CHUVALO,
      ...FLOOR_CANADA,
      ...FLOOR_VARGAS,
      ...FLOOR_HERON,
      ...FLOOR_MORRISON,
      ...FLOOR_EAST,
      ...FLOOR_HISTORY,
      ...FLOOR_OLYMPIANS,
      ...FLOOR_WOMEN,
      ...FLOOR_CURRENT,
      ...FLOOR_TORONTO,
      ...FLOOR_STORIES,
      ...FLOOR_ONTARIO,
      ...FLOOR_TRIVIA,
      ...FLOOR_SYSTEM,
    ].filter(
      (line, index, all) =>
        all.findIndex((other) => other.text === line.text) === index,
    ),
    input.minute,
  );

  const extras: FeedLine[] = [];
  if (input.roundLabel) {
    extras.push({ kind: "system", text: input.roundLabel });
  }
  if (input.liveTitle) {
    extras.push({ kind: "system", text: `Live now · ${input.liveTitle}` });
  }
  if (input.leaderName) {
    extras.push({
      kind: "system",
      text: `${input.leaderName} leads the floor${input.leaderXp != null ? ` · ${input.leaderXp} XP` : ""}`,
    });
  }
  if (input.checkInsToday != null && input.checkInsToday > 0) {
    extras.push({
      kind: "system",
      text: `${input.checkInsToday} check-ins on the board today`,
    });
  }
  if (input.spotsOpen != null && input.spotsOpen > 0) {
    extras.push({ kind: "system", text: `${input.spotsOpen} spots still open` });
  }
  input.checkIns.forEach((person, i) => {
    const template = CHECKIN_TEMPLATES[i % CHECKIN_TEMPLATES.length];
    if (!template) return;
    extras.push({
      kind: "checkin",
      text: template(person.name),
    });
  });

  const chuvaloPulse = shuffleFeed(FLOOR_CHUVALO, input.minute + 11);
  const out: FeedLine[] = [];
  const insertEvery = extras.length
    ? Math.max(2, Math.floor(knowledge.length / extras.length))
    : Number.POSITIVE_INFINITY;
  let extraIndex = 0;
  knowledge.forEach((line, i) => {
    out.push(line);
    if ((i + 1) % 4 === 0 && chuvaloPulse.length) {
      const pulse = chuvaloPulse[Math.floor(i / 4) % chuvaloPulse.length];
      if (pulse) out.push(pulse);
    }
    if (extraIndex < extras.length && (i + 1) % insertEvery === 0) {
      const extra = extras[extraIndex];
      if (extra) out.push(extra);
      extraIndex += 1;
    }
  });
  while (extraIndex < extras.length) {
    const extra = extras[extraIndex];
    if (extra) out.push(extra);
    extraIndex += 1;
  }
  if (input.minute % 4 === 0) {
    out.push({
      kind: "system",
      text: "This boxing system was developed by Quiet Agency for Sully's Gym.",
    });
  }
  return out;
}

type RoundPhase = "work" | "rest";

type RoundState = {
  phase: RoundPhase;
  round: number;
  totalRounds: number | null;
  secondsLeft: number;
  secondsInPhase: number;
  progress: number;
  syncedToClass: boolean;
};

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function readTimerConfig() {
  if (typeof window === "undefined") {
    return { workSec: 180, restSec: 60, rounds: 12 };
  }
  const params = new URLSearchParams(window.location.search);
  const workSec = Math.max(30, Number(params.get("work")) || 180);
  const restSec = Math.max(15, Number(params.get("rest")) || 60);
  const rounds = Math.max(1, Number(params.get("rounds")) || 12);
  return { workSec, restSec, rounds };
}

/** Boxing-style interval timer — syncs to live class start, else wall-clock cycle. */
function computeRoundState(
  now: Date,
  live: SessionCard | null,
  workSec: number,
  restSec: number,
  configuredRounds: number,
): RoundState {
  const cycle = workSec + restSec;

  if (live?.phase === "live") {
    const start = new Date(live.startsAt).getTime();
    const end = new Date(live.endsAt).getTime();
    const elapsedMs = Math.max(0, now.getTime() - start);
    const classDurationSec = Math.max(1, Math.floor((end - start) / 1000));
    const totalRounds = Math.max(
      1,
      Math.min(configuredRounds, Math.ceil(classDurationSec / cycle)),
    );
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const cycleIndex = Math.floor(elapsedSec / cycle);
    const round = Math.min(totalRounds, cycleIndex + 1);
    const intoCycle = elapsedSec % cycle;
    const inWork = intoCycle < workSec;
    const secondsInPhase = inWork ? workSec : restSec;
    const secondsLeft = inWork
      ? workSec - intoCycle
      : restSec - (intoCycle - workSec);

    return {
      phase: inWork ? "work" : "rest",
      round,
      totalRounds,
      secondsLeft: Math.max(0, secondsLeft),
      secondsInPhase,
      progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
      syncedToClass: true,
    };
  }

  // Open-gym / between classes: shared wall-clock sync (all screens match)
  const epochSec = Math.floor(now.getTime() / 1000);
  const intoCycle = epochSec % cycle;
  const inWork = intoCycle < workSec;
  const secondsInPhase = inWork ? workSec : restSec;
  const secondsLeft = inWork
    ? workSec - intoCycle
    : restSec - (intoCycle - workSec);
  const round = Math.floor(epochSec / cycle) % configuredRounds || configuredRounds;

  return {
    phase: inWork ? "work" : "rest",
    round,
    totalRounds: configuredRounds,
    secondsLeft: Math.max(0, secondsLeft),
    secondsInPhase,
    progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
    syncedToClass: false,
  };
}

const CACHE_PREFIX = "sullys.tv.board.";

function cacheKey(profile: string) {
  return `${CACHE_PREFIX}${profile}`;
}

function readCachedBoard(profile: string): Board | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(profile));
    if (!raw) return null;
    return JSON.parse(raw) as Board;
  } catch {
    return null;
  }
}

function writeCachedBoard(profile: string, data: Board) {
  try {
    localStorage.setItem(cacheKey(profile), JSON.stringify(data));
  } catch {
    // quota / private mode — ignore
  }
}

export function TvBoard({ profile }: { profile: "floor" | "reception" }) {
  const brand = getBrand();
  const floor = floorLabel(brand.copy.appName);
  const [board, setBoard] = useState<Board | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [offline, setOffline] = useState(false);
  const [riveEnabled, setRiveEnabled] = useState(true);
  const [demoCelebrate, setDemoCelebrate] = useState(false);
  const [popupFreeze, setPopupFreeze] = useState<FloorPopupMode | null>(null);
  const [noteFreeze, setNoteFreeze] = useState<string | null>(null);
  const [demoModeIndex, setDemoModeIndex] = useState(0);
  const [timerCfg, setTimerCfg] = useState({
    workSec: 180,
    restSec: 60,
    rounds: 12,
  });
  const [adIndex, setAdIndex] = useState(0);
  const [adOn, setAdOn] = useState(false);
  const [tickerHold, setTickerHold] = useState(false);
  const tickerTrackRef = useRef<HTMLDivElement>(null);
  const [marqueeSec, setMarqueeSec] = useState(480);
  const [infoIndex, setInfoIndex] = useState(0);
  const [demoClassIndex, setDemoClassIndex] = useState(0);
  const [poseTick, setPoseTick] = useState(0);
  const [demoOrder, setDemoOrder] = useState<number[]>(() =>
    FLOOR_DEMO_CLASSES.map((_, i) => i),
  );
  const [arrivalName, setArrivalName] = useState<string | null>(null);
  const lastArrivalRef = useRef<string | null>(null);
  const adDeckRef = useRef<number[]>([]);

  useEffect(() => {
    setTimerCfg(readTimerConfig());
    setRiveEnabled(readRiveEnabled());
    setDemoCelebrate(readDemoCelebrate());
    setPopupFreeze(readPopupFreeze());
    setNoteFreeze(readNoteFreeze());
    const cached = readCachedBoard(profile);
    if (cached) setBoard(cached);
    setDemoOrder(
      shuffleFeed(
        FLOOR_DEMO_CLASSES.map((_, i) => i),
        Date.now() % 2147483646 || 1,
      ),
    );
    setPoseTick(Math.floor(Math.random() * 12));
  }, [profile]);

  useEffect(() => {
    if (!demoCelebrate || popupFreeze || profile !== "floor") return;
    const cycle = setInterval(() => {
      setDemoModeIndex((i) => (i + 1) % DEMO_MODES.length);
    }, 4000);
    return () => clearInterval(cycle);
  }, [demoCelebrate, popupFreeze, profile]);

  useEffect(() => {
    if (profile !== "floor" || popupFreeze || demoCelebrate) {
      setAdOn(false);
      return;
    }
    const pin = new URLSearchParams(window.location.search).get("card");
    if (pin) {
      const needle = pin.toLowerCase();
      const idx = FLOOR_ADS.findIndex((ad) =>
        `${ad.h1} ${ad.h2} ${ad.msg}`.toLowerCase().includes(needle),
      );
      if (idx >= 0) {
        setAdIndex(idx);
        setAdOn(true);
        return;
      }
    }
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const drawAd = () => {
      if (!adDeckRef.current.length) {
        adDeckRef.current = dealFloorAdOrder(Date.now() % 2147483646 || 1);
      }
      const next = adDeckRef.current.pop();
      if (next != null) setAdIndex(next);
      return next;
    };
    const show = () => {
      if (cancelled) return;
      const next = drawAd();
      setAdOn(true);
      const gym = next != null && (FLOOR_ADS[next]?.hero ?? "").includes("sullys-ossington");
      const calendar = next != null && FLOOR_ADS[next]?.mode === "floor_calendar";
      timer = setTimeout(hide, calendar ? 18000 : gym ? 15000 : jitter(10000, 14000));
    };
    const hide = () => {
      if (cancelled) return;
      setAdOn(false);
      timer = setTimeout(show, jitter(12000, 18000));
    };
    timer = setTimeout(show, jitter(5000, 8000));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [demoCelebrate, popupFreeze, profile]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let holding = false;
    const tick = () => {
      holding = !holding;
      setTickerHold(holding);
      if (holding) setInfoIndex((i) => i + 1);
      timer = setTimeout(tick, holding ? TICKER_HOLD_MS : TICKER_SCROLL_MS);
    };
    timer = setTimeout(tick, TICKER_FIRST_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile !== "floor") return;
    const cycle = window.setInterval(() => {
      setDemoClassIndex((i) => (i + 1) % FLOOR_DEMO_CLASSES.length);
      setPoseTick((n) => n + 1);
    }, jitter(32000, 44000));
    return () => window.clearInterval(cycle);
  }, [profile]);

  const coachLive = Boolean(board?.coachTimer);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/tv/board?profile=${profile}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Board ${res.status}`);
        const data = (await res.json()) as Board;
        if (!cancelled) {
          setBoard(data);
          writeCachedBoard(profile, data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) {
          const cached = readCachedBoard(profile);
          if (cached) {
            setBoard(cached);
            setOffline(true);
          } else {
            setOffline(true);
          }
        }
      }
    }
    void load();
    // 500ms while coach live (tighter TV sync); else 3s floor / 15s reception
    const ms =
      profile === "floor" ? (coachLive || demoCelebrate ? 500 : 3_000) : 15_000;
    const poll = setInterval(load, ms);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [profile, coachLive, demoCelebrate]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(tick);
  }, []);

  const latestArrivalName = board?.ticker?.[0]?.name ?? null;
  const latestArrivalAt = board?.ticker?.[0]?.at ?? null;

  useEffect(() => {
    if (
      (profile !== "floor" && profile !== "reception") ||
      !latestArrivalName ||
      !latestArrivalAt
    )
      return;
    const arrivalKey = `${latestArrivalName}:${latestArrivalAt}`;
    if (lastArrivalRef.current === arrivalKey) return;
    lastArrivalRef.current = arrivalKey;
    const age = Date.now() - new Date(latestArrivalAt).getTime();
    if (age < 0 || age > 60_000) return;
    setArrivalName(latestArrivalName);
    const hide = window.setTimeout(() => setArrivalName(null), 7_000);
    return () => window.clearTimeout(hide);
  }, [latestArrivalAt, latestArrivalName, profile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen();
        } else {
          void document.exitFullscreen();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focus = board?.live ?? board?.next ?? null;
  const demoClass =
    FLOOR_DEMO_CLASSES[demoOrder[demoClassIndex % demoOrder.length] ?? 0] ??
    FLOOR_DEMO_CLASSES[0];
  const scheduledTitle = focus?.title ?? null;
  const timerTitle = board?.coachTimer?.title ?? null;
  const floorClassTitle =
    scheduledTitle && !isKidsBoxingTitle(scheduledTitle)
      ? scheduledTitle
      : timerTitle && !isKidsBoxingTitle(timerTitle)
        ? timerTitle
        : demoClass.title;
  const floorClassCoach =
    floorClassTitle === scheduledTitle && focus?.coach
      ? focus.coach
      : floorClassTitle === timerTitle && board?.coachTimer?.coach
        ? board.coachTimer.coach
        : demoClass.coach;
  const classPhoto = floorClassPhoto(
    floorClassTitle,
    floorClassCoach,
    poseTick + demoClassIndex,
  );

  const classCountdown = useMemo(() => {
    if (!focus) return null;
    const target =
      focus.phase === "live"
        ? new Date(focus.endsAt).getTime()
        : new Date(focus.startsAt).getTime();
    return Math.max(0, Math.floor((target - now.getTime()) / 1000));
  }, [focus, now]);
  const boardAgeSeconds = board?.asOf
    ? Math.max(0, Math.floor((now.getTime() - new Date(board.asOf).getTime()) / 1000))
    : null;
  const bookingPercent = focus?.capacity
    ? Math.min(100, Math.round((focus.booked / focus.capacity) * 100))
    : 0;

  const round = useMemo(() => {
    const ct = board?.coachTimer;
    if (ct?.syncedToCoach) {
      const secondsInPhase = ct.phase === "work" ? ct.workSec : ct.restSec;
      let secondsLeft = ct.secondsLeft;
      if (ct.status === "paused") {
        secondsLeft = ct.pausedRemainSec ?? ct.secondsLeft;
      } else if (ct.status === "running" && ct.phaseEndsAt) {
        secondsLeft = Math.max(
          0,
          Math.ceil((new Date(ct.phaseEndsAt).getTime() - now.getTime()) / 1000),
        );
      }
      return {
        phase: (ct.phase === "rest" ? "rest" : "work") as RoundPhase,
        round: ct.round,
        totalRounds: ct.totalRounds,
        secondsLeft,
        secondsInPhase,
        progress: 1 - secondsLeft / Math.max(1, secondsInPhase),
        syncedToClass: true,
        coachControlled: true,
        paused: ct.status === "paused",
      };
    }
    return {
      ...computeRoundState(
        now,
        board?.live ?? null,
        timerCfg.workSec,
        timerCfg.restSec,
        timerCfg.rounds,
      ),
      coachControlled: false,
      paused: false,
    };
  }, [now, board?.live, board?.coachTimer, timerCfg]);

  const floorFeed = useMemo(() => {
    const checkIns = board?.ticker?.length ? board.ticker : [];
    const liveTitle = board?.live?.title ?? board?.coachTimer?.title ?? null;
    const leader = board?.leaderboard?.[0] ?? null;
    return weaveFloorFeed({
      checkIns,
      liveTitle,
      roundLabel: `${round.phase === "work" ? "Work" : "Rest"} · round ${round.round}${round.totalRounds ? ` of ${round.totalRounds}` : ""}`,
      leaderName: leader?.displayName ?? null,
      leaderXp: leader?.xp ?? null,
      checkInsToday: board?.kpis.checkInsToday ?? null,
      spotsOpen: board?.kpis.spotsOpen ?? null,
      minute: Math.floor(now.getTime() / (10 * 60 * 1000)),
    });
  }, [
    board,
    round.phase,
    round.round,
    round.totalRounds,
    Math.floor(now.getTime() / (10 * 60 * 1000)),
  ]);

  useEffect(() => {
    const el = tickerTrackRef.current;
    if (!el) return;
    const measure = () => {
      const distance = el.scrollWidth / 2;
      if (distance > 0) setMarqueeSec(distance / TICKER_PX_PER_SEC);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [floorFeed]);

  const demoMode = DEMO_MODES[demoModeIndex] ?? "achievement";
  const coachMode = board?.coachTimer?.tvMode ?? "timer";
  const liveEvent =
    coachMode !== "timer" && hasArtPopup(coachMode) && !popupFreeze && !demoCelebrate;
  const infoFacts = useMemo(
    () => floorFeed.filter((line) => line.kind === "trivia"),
    [floorFeed],
  );
  const infoLine = infoFacts.length
    ? infoFacts[infoIndex % infoFacts.length]
    : null;
  const infoText = (infoLine?.text ?? "").replace(/^Trivia · /, "");
  const floorAd = adOn && profile === "floor" ? FLOOR_ADS[adIndex] : null;
  const calendarScreen = floorAd?.mode === "floor_calendar";
  const gymScreen = Boolean(floorAd?.hero?.includes("sullys-ossington"));
  const tvMode =
    popupFreeze && profile === "floor"
      ? popupFreeze
      : demoCelebrate && profile === "floor"
        ? demoMode
        : liveEvent
          ? coachMode
          : floorAd
            ? floorAd.mode
            : coachMode;
  const modeActive =
    profile === "floor" &&
    (Boolean(board?.coachTimer) ||
      demoCelebrate ||
      Boolean(popupFreeze) ||
      Boolean(floorAd));
  const showAnnouncement =
    modeActive &&
    tvMode === "announcement" &&
    (board?.coachTimer || demoCelebrate || Boolean(popupFreeze));
  const showLeaderboardHero =
    modeActive && tvMode === "leaderboard";
  const showTeamsHero = modeActive && tvMode === "teams";
  const showChallengeHero =
    modeActive && (tvMode === "challenge" || tvMode === "achievement");
  const showClassComplete = modeActive && tvMode === "class_complete";
  const showXpBonusHero = modeActive && tvMode === "xp_bonus";
  const showRoundHero =
    !showAnnouncement &&
    !showLeaderboardHero &&
    !showTeamsHero &&
    !showChallengeHero &&
    !showClassComplete &&
    !showXpBonusHero &&
    (profile === "floor" || board?.live?.phase === "live");
  const riveActive =
    profile === "floor" &&
    !calendarScreen &&
    (Boolean(board?.coachTimer) ||
      demoCelebrate ||
      Boolean(popupFreeze) ||
      Boolean(floorAd));
  const showArtPopup =
    riveActive &&
    !gymScreen &&
    hasArtPopup(tvMode) &&
    (tvMode !== "timer" || Boolean(popupFreeze) || demoCelebrate || Boolean(floorAd));
  const sceneKey = `${tvMode}:${round.phase}:${round.round}:${
    board?.coachTimer?.currentExercise?.title ?? ""
  }:${board?.coachTimer?.tvMessage ?? ""}`;

  const topName = board?.leaderboard?.[0]?.displayName ?? null;
  const riveXp =
    tvMode === "class_complete"
      ? 25
      : tvMode === "achievement" || tvMode === "xp_bonus"
        ? 50
        : tvMode === "leaderboard" && board?.leaderboard?.[0]?.xp
          ? Math.min(99, board.leaderboard[0].xp % 100 || 10)
          : null;
  const riveBonusLabel =
    tvMode === "xp_bonus"
      ? "STREAK ×2"
      : tvMode === "achievement"
        ? "FIRST BELL"
        : tvMode === "class_complete"
          ? "CLASS BONUS"
          : tvMode === "leaderboard"
            ? "BOARD KING"
            : null;

  return (
    <div
      className={`${styles.shell} ${
        round.phase === "work" ? styles.phaseWork : styles.phaseRest
      } ${showArtPopup ? styles.shellArt : ""} ${gymScreen ? styles.shellGym : ""}`}
      data-profile={profile}
    >
      {gymScreen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.gymStill}
          src="/tv/sullys-ossington.jpg"
          alt=""
          draggable={false}
        />
      ) : null}
      {(profile === "floor" || profile === "reception") && arrivalName ? (
        <div className={styles.arrivalMoment} role="status" aria-live="polite">
          <div className={styles.arrivalMark} aria-hidden>
            S
          </div>
          <div>
            <p>Welcome to Sully&apos;s</p>
            <strong>{arrivalName}</strong>
            <span>Checked in · ready for the bell</span>
          </div>
        </div>
      ) : null}
      {offline ? (
        <div className={styles.offlineBanner} role="status">
          Offline · last good board · timer running
        </div>
      ) : null}
      <header className={styles.top}>
        <div className={styles.brand}>
          <Image
            src={brand.assets.logoPrimary}
            alt={brand.assets.logoAlt}
            width={132}
            height={170}
            className={styles.logo}
            priority
          />
          <div className={styles.brandText}>
            <p className={styles.brandName}>{brand.copy.appName}</p>
            <p className={styles.brandSub}>
              {/\bEST\b/i.test(brand.copy.brandSub)
                ? brand.copy.brandSub
                : `${brand.copy.brandSub} · EST ${
                    board?.gym.established ?? brand.copy.established
                  }`}
            </p>
            <p className={styles.profile}>
              {profile === "floor" ? "Training floor" : "Reception"}
            </p>
            {profile === "reception" ? (
              <p className={styles.deskStatus}>
                <span aria-hidden />
                {offline
                  ? "Saved board"
                  : boardAgeSeconds == null
                    ? "Connecting"
                    : `Live desk · ${boardAgeSeconds}s`}
              </p>
            ) : null}
          </div>
        </div>
        <div className={styles.clockBlock}>
          <p className={styles.clock}>{formatClock(now)}</p>
          <p className={styles.date}>
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className={`${styles.main} ${showArtPopup ? styles.mainArt : ""}`}>
        {calendarScreen ? (
          <div className={styles.floorCalendar} role="region" aria-label="Class calendar">
            <div className={styles.calHead}>
              <p className={styles.calKicker}>Class calendar</p>
              <h2 className={styles.calTitle}>{board?.calendar?.label ?? "Today"}</h2>
            </div>
            <ul className={styles.calGrid}>
              {(board?.calendar?.sessions ?? []).map((session) => (
                <li
                  key={session.id}
                  className={`${styles.calRow} ${session.phase === "done" ? styles.calDone : ""} ${session.phase === "live" ? styles.calLive : ""}`}
                >
                  <span className={styles.calTime}>
                    {new Date(session.startsAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={styles.calName}>{session.title}</span>
                  <span className={styles.calCoach}>
                    {session.coach ?? ""}
                    {session.phase === "live"
                      ? " · live"
                      : session.spotsLeft === 0
                        ? " · full"
                        : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <section
          className={`${styles.hero} ${showArtPopup ? styles.heroArt : ""}`}
          aria-live="polite"
        >
          <TvRiveLayer
            active={riveActive}
            enabled={riveEnabled}
            tvMode={tvMode}
            phase={round.phase === "rest" ? "rest" : "work"}
            xpBonus={riveXp}
            bonusLabel={riveBonusLabel}
            artCover={showArtPopup}
            roundClock={formatCountdown(round.secondsLeft)}
            roundLabel={`${round.phase === "rest" ? "REST" : "WORK"}  •  ROUND ${round.round}${round.totalRounds ? ` / ${round.totalRounds}` : ""}`}
            rankLabel={board?.leaderboard?.[0] ? String(board.leaderboard[0].rank).padStart(2, "0") : null}
            scoreLabel={
              board?.leaderboard?.[0]
                ? `${board.leaderboard[0].xp} XP  •  LEVEL ${board.leaderboard[0].level}`
                : null
            }
            teamA={
              board?.coachTimer?.teams?.[0]
                ? {
                    name: board.coachTimer.teams[0].name,
                    points: board.coachTimer.teams[0].points,
                  }
                : demoCelebrate
                  ? { name: "Red Corner", points: 120 }
                  : null
            }
            teamB={
              board?.coachTimer?.teams?.[1]
                ? {
                    name: board.coachTimer.teams[1].name,
                    points: board.coachTimer.teams[1].points,
                  }
                : demoCelebrate
                  ? { name: "Blue Corner", points: 110 }
                  : null
            }
            highlightName={
              tvMode === "leaderboard" || tvMode === "xp_bonus"
                ? topName ?? (demoCelebrate ? "Gavin S" : null)
                : tvMode === "achievement"
                  ? (demoCelebrate ? "Gavin S" : topName)
                  : topName
            }
            heroSrc={popupFreeze ? null : floorAd?.hero ?? null}
            headline1={popupFreeze ? null : floorAd?.h1 ?? null}
            headline2={popupFreeze ? null : floorAd?.h2 ?? null}
            message={
              popupFreeze
                ? board?.coachTimer?.tvMessage
                : floorAd?.msg ?? board?.coachTimer?.tvMessage
            }
          />
          {profile === "floor" && riveEnabled && !showArtPopup && !classPhoto ? (
            <TvBoxerRig motion={round.phase === "rest" ? "rest" : "work"} />
          ) : null}
          {profile === "floor" && classPhoto && !showArtPopup ? (
            <div className={styles.classFigure} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={classPhoto}
                src={classPhoto}
                alt=""
                draggable={false}
              />
            </div>
          ) : null}
          {profile === "floor" && noteFreeze && !showArtPopup ? (
            <TvArtNote
              mode={noteFreeze}
              title={
                noteFreeze === "nameplate" || noteFreeze === "birthday"
                  ? topName
                  : null
              }
            />
          ) : null}
          {showRoundHero && !showArtPopup ? (
            <div className={styles.phaseCurtain} key={`curtain-${sceneKey}`}>
              <span>{round.phase === "work" ? "WORK" : "REST"}</span>
              <strong>ROUND {String(round.round).padStart(2, "0")}</strong>
            </div>
          ) : null}
          {showArtPopup ? null : (
          <div
            key={sceneKey}
            className={`${styles.heroContent} ${
              showRoundHero ? styles.sceneRound : styles.sceneCelebration
            }`}
          >
          {showXpBonusHero ? (
            <>
              <p className={styles.phase}>XP bonus</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage || "+50 XP"}
              </h1>
              <p className={styles.meta}>
                {topName ?? (demoCelebrate ? "Gavin S" : "Floor athlete")}
                {" · keep swinging"}
              </p>
            </>
          ) : null}
          {showAnnouncement ? (
            <>
              <p className={styles.phase}>Coach announcement</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage || "Eyes up — listen in"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.title}
                {board?.coachTimer?.coach
                  ? ` · Coach ${board.coachTimer.coach}`
                  : ""}
              </p>
            </>
          ) : null}
          {showClassComplete ? (
            <>
              <p className={styles.phase}>Class complete</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ??
                  (demoCelebrate ? "Demo class complete" : "Session done")}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.tvMessage || "XP awarded · see you next bell"}
              </p>
            </>
          ) : null}
          {showTeamsHero ? (
            <>
              <p className={styles.phase}>Team battle</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? (demoCelebrate ? "Red vs Gold" : "Teams")}
              </h1>
              <ul className={styles.boardList} style={{ marginTop: "1.25rem" }}>
                {(board?.coachTimer?.teams ??
                  (demoCelebrate
                    ? [
                        {
                          rank: 1,
                          name: "Red Corner",
                          color: "#c82026",
                          points: 42,
                          members: [],
                        },
                        {
                          rank: 2,
                          name: "Gold Corner",
                          color: "#c4a06a",
                          points: 38,
                          members: [],
                        },
                      ]
                    : [])
                ).map((t) => (
                  <li key={t.name}>
                    <span>
                      #{t.rank} {t.name}
                    </span>
                    <strong>{t.points}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {showChallengeHero ? (
            <>
              <p className={styles.phase}>
                {tvMode === "achievement" ? "Achievement" : "Challenge"}
              </p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage ||
                  board?.coachTimer?.challenges?.[0]?.name ||
                  (demoCelebrate
                    ? tvMode === "achievement"
                      ? "First bell of the day"
                      : "30 clean jabs"
                    : "Eyes on the prize")}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.title ??
                  (demoCelebrate ? "Celebration preview" : "")}
                {board?.coachTimer?.currentExercise
                  ? ` · ${board.coachTimer.currentExercise.title}`
                  : ""}
              </p>
            </>
          ) : null}
          {showLeaderboardHero ? (
            <>
              <p className={styles.phase}>Floor leaderboard</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? "Claim the board"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.coach
                  ? `Coach ${board.coachTimer.coach}`
                  : floor}
                {" · coach controlled"}
              </p>
              <ul className={styles.boardList} style={{ marginTop: "1.25rem" }}>
                {(board?.leaderboard ?? []).slice(0, 6).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {showRoundHero ? (
            <>
              <p className={styles.phase}>
                {round.phase === "work" ? "Work" : "Rest"}
                {" · "}
                Round {String(round.round).padStart(2, "0")}
                {round.totalRounds
                  ? ` / ${String(round.totalRounds).padStart(2, "0")}`
                  : ""}
              </p>
              <h1 className={styles.classTitle}>
                {floorClassTitle}
              </h1>
              <p className={styles.meta}>
                {floorClassCoach
                  ? `Coach ${floorClassCoach}`
                  : floor}
                {board?.coachTimer?.nextExercise
                  ? ` · Next: ${board.coachTimer.nextExercise.title}`
                  : ""}
                {focus && !board?.coachTimer
                  ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                  : ""}
                {round.paused ? " · PAUSED" : ""}
                {classCountdown !== null && focus?.phase === "live" && !board?.coachTimer
                  ? ` · class ${formatCountdown(classCountdown)}`
                  : focus?.phase === "upcoming" && classCountdown !== null
                    ? ` · starts ${formatCountdown(classCountdown)}`
                    : ""}
              </p>
              <p className={styles.timerLabel}>
                {round.phase === "work" ? "Round clock" : "Rest clock"}
                {round.coachControlled
                  ? " · coach controlled"
                  : round.syncedToClass
                    ? " · synced to class"
                    : " · open gym sync"}
              </p>
              <p className={styles.timer}>
                {formatCountdown(round.secondsLeft)}
              </p>
              <div
                className={styles.roundBar}
                role="progressbar"
                aria-valuenow={Math.round(round.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={styles.roundBarFill}
                  style={{ width: `${Math.min(100, round.progress * 100)}%` }}
                />
              </div>
              <p className={styles.roundMeta}>
                {Math.floor(timerCfg.workSec / 60)}:
                {String(timerCfg.workSec % 60).padStart(2, "0")} work
                {" · "}
                {Math.floor(timerCfg.restSec / 60)}:
                {String(timerCfg.restSec % 60).padStart(2, "0")} rest
              </p>
            </>
          ) : !modeActive ? (
            profile === "reception" ? (
              <>
                <div className={styles.receptionStatus}>
                  <span aria-hidden />
                  {focus?.phase === "live"
                    ? "Class in progress"
                    : focus
                      ? "Next on the floor"
                      : "Open gym"}
                </div>
                <p className={styles.phase}>
                  {focus?.program ?? "Today at Sully's"}
                </p>
                <h1 className={styles.classTitle}>
                  {focus?.title ?? "Welcome to the gym"}
                </h1>
                <p className={styles.meta}>
                  {focus?.coach ? `Coach ${focus.coach}` : "Front desk ready"}
                  {focus
                    ? ` · ${new Date(focus.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : " · Come in and say hello"}
                </p>
                {classCountdown !== null ? (
                  <div className={styles.receptionCountdown}>
                    <div>
                      <span>
                        {focus?.phase === "live" ? "Time left" : "Starts in"}
                      </span>
                      <strong>{formatCountdown(classCountdown)}</strong>
                    </div>
                    <div className={styles.capacityStatus}>
                      <span>
                        {focus?.booked ?? 0} of {focus?.capacity ?? 0} booked
                      </span>
                      <div aria-hidden>
                        <i style={{ width: `${bookingPercent}%` }} />
                      </div>
                      <strong>
                        {focus?.spotsLeft
                          ? `${focus.spotsLeft} spots available`
                          : "Class is full"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className={styles.receptionWelcome}>
                    Lace up · show respect · build character
                  </p>
                )}
              </>
            ) : (
              <>
                <p className={styles.phase}>
                  {focus?.phase === "live"
                    ? "Live now"
                    : focus
                      ? "Up next"
                      : "Open gym"}
                </p>
                <h1 className={styles.classTitle}>
                  {focus?.title ?? "Train with purpose"}
                </h1>
                <p className={styles.meta}>
                  {focus?.coach ? `Coach ${focus.coach}` : "Sully's floor"}
                  {focus
                    ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                    : ""}
                </p>
                {classCountdown !== null ? (
                  <>
                    <p className={styles.timerLabel}>
                      {focus?.phase === "live"
                        ? "Class time remaining"
                        : "Starts in"}
                    </p>
                    <p className={styles.timer}>
                      {formatCountdown(classCountdown)}
                    </p>
                  </>
                ) : (
                  <p className={styles.meta}>Character before the bell.</p>
                )}
              </>
            )
          ) : null}
          </div>
          )}
        </section>

        <aside className={styles.side}>
          {profile === "floor" ? (
            <div className={`${styles.panel} ${styles.roundPanel}`}>
              <p className={styles.panelTitle}>Round status</p>
              <p className={styles.roundStatusBig}>
                {round.phase === "work" ? "WORK" : "REST"}
              </p>
              <p className={styles.meta}>
                Round {round.round}
                {round.totalRounds ? ` of ${round.totalRounds}` : ""}
                {" · "}
                {formatCountdown(round.secondsLeft)} left
              </p>
            </div>
          ) : null}

          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.checkInsToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Check-ins</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.classesToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Classes</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.spotsOpen ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Spots open</p>
            </div>
          </div>

          {profile === "floor" ? (
            <div className={`${styles.panel} ${styles.sideFill}`}>
              <p className={styles.panelTitle}>Floor leaderboard</p>
              <ul className={styles.boardList}>
                {(board?.leaderboard ?? []).slice(0, 5).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
                {!board?.leaderboard?.length ? (
                  <li className={styles.boardRow}>
                    <span>Train today — claim the board</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className={`${styles.panel} ${styles.sideFill}`}>
              <p className={styles.panelTitle}>Today&apos;s schedule</p>
              <ul className={styles.boardList}>
                {(board?.schedule ?? []).slice(0, 6).map((s) => (
                  <li key={s.id} className={styles.boardRow}>
                    <span>
                      <strong>{s.title}</strong>
                    </span>
                    <span>
                      {new Date(s.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {s.spotsLeft} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>
      </div>

      <footer className={styles.bottom}>
        <div
          className={`${styles.ticker} ${tickerHold && infoText ? styles.isHold : ""}`}
          aria-label="Canadian boxing news"
        >
          <span className={styles.tickerFlag} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tv/icons/canada-flag.png" alt="" draggable={false} />
          </span>
          <div className={styles.tickerStage}>
          {tickerHold && infoText ? (
            <div className={styles.tickerInfo} aria-live="polite">
              <span className={styles.tickerInfoMark}>INFO</span>
              <p className={styles.tickerInfoCopy}>{infoText}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/tv/icons/info.png"
                alt=""
                className={styles.tickerInfoIcon}
                draggable={false}
              />
            </div>
          ) : null}
          <div className={styles.tickerCrawl}>
            <div
              ref={tickerTrackRef}
              className={styles.tickerTrack}
              style={{ animationDuration: `${marqueeSec}s` }}
            >
            {[0, 1].map((copy) => (
              <div
                className={styles.tickerCopy}
                key={copy}
                aria-hidden={copy === 1}
              >
                {floorFeed.map((line, i) => (
                  <span
                    key={`${copy}-${line.kind}-${i}`}
                    className={
                      line.kind === "quote"
                        ? styles.tickerQuote
                        : line.kind === "trivia"
                          ? styles.tickerTrivia
                          : line.kind === "checkin"
                            ? styles.tickerCheckin
                            : styles.tickerSystem
                    }
                    data-kind={line.kind}
                  >
                    {line.text}
                  </span>
                ))}
              </div>
            ))}
            </div>
          </div>
          </div>
        </div>
        <p className={styles.hint}>
          Press F for fullscreen
          {profile === "floor" ? "" : " · Auto-refreshes"}
        </p>
      </footer>
    </div>
  );
}
