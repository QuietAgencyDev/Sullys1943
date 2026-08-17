/**
 * Red Owl / Scarborough Smartbox programs — sourced from
 * https://scarboroughsmartbox.ca/program-details/
 * https://scarboroughsmartbox.ca/about-us/
 * https://www.redowlboxing.com/pages/scarborough-members
 */
import type { Program } from "./programs";

export const RED_OWL_PROGRAMS: Program[] = [
  {
    slug: "scarborough-smartbox",
    name: "Scarborough Smartbox",
    short:
      "Free 12-week youth cohort — boxing, mentorship, tutoring, counselling, and meals.",
    lead: "Strength. Structure. Support.",
    body: [
      "Scarborough Smartbox is a structured youth development program that combines boxing, mentorship, academic support, counselling, and nutrition in a safe and disciplined environment. Each participant joins a 12-week cohort designed to improve confidence, school engagement, and physical fitness while building strong relationships with coaches, tutors, and mentors.",
      "The program serves youth ages 11 to 18 living or attending school in Scarborough. Youth participate in coached boxing sessions, weekly tutoring, mentorship meetings, counselling access, and a healthy meal at every visit. Cohorts run directly after school to match student schedules and create a consistent routine built around structure, discipline, and support.",
      "Powered by Red Owl Boxing, Smartbox was created to give young people a safe after-school space where they can grow physically, emotionally, and academically.",
    ],
    outcomes: [
      "Stronger routines and school engagement",
      "Relationships with coaches, mentors, and peers",
      "1-year Red Owl Boxing membership after completion",
    ],
  },
  {
    slug: "smartbox-boxing",
    name: "Boxing (Smartbox)",
    short:
      "Certified coaches — technique, movement, conditioning, and self-control.",
    lead:
      "Boxing is the core discipline of Smartbox — a powerful outlet for focus, resilience, and positive identity.",
    body: [
      "Boxing is delivered by certified coaches who focus on technique, movement, conditioning, and self-control. Training is adapted to all skill levels and helps youth build focus, determination, and respect as they progress through the program.",
      "Boxing provides a powerful physical outlet that supports emotional regulation, stress relief, and the development of positive identity in a safe, disciplined environment.",
    ],
    outcomes: [
      "Safe technique and conditioning",
      "Focus and emotional regulation",
      "Respect and self-control",
    ],
  },
  {
    slug: "smartbox-mentorship",
    name: "Mentorship",
    short:
      "Weekly guidance on communication, discipline, leadership, and goals.",
    lead:
      "Mentorship is integrated into every week — supportive adults who check in, reflect, and hold youth accountable.",
    body: [
      "Mentorship gives participants consistent access to supportive adults who guide them through communication skills, discipline, leadership, and goal setting.",
      "Coaches and mentors check in with youth regularly, help them reflect on progress, and hold them accountable to personal commitments. Youth learn how to build healthy routines, manage challenges, and improve their relationships at school and at home.",
    ],
    outcomes: [
      "Reliable adult presence",
      "Goal setting and accountability",
      "Healthier school and home relationships",
    ],
  },
  {
    slug: "smartbox-academic-support",
    name: "Academic Support",
    short:
      "Weekly tutoring for homework, literacy, numeracy, and organization.",
    lead:
      "Academic support strengthens school engagement and positive study habits.",
    body: [
      "Smartbox includes weekly academic support where students work with tutors on homework, literacy, numeracy, and organization. Sessions are designed to strengthen school engagement, build positive study habits, and support youth who benefit from additional guidance.",
      "Tutors include community volunteers and post-secondary students who help participants stay on track with school expectations.",
    ],
    outcomes: [
      "Homework and study habits",
      "Literacy and numeracy support",
      "Stronger school engagement",
    ],
  },
  {
    slug: "smartbox-emotional-support",
    name: "Emotional Support",
    short:
      "Up to six confidential counselling sessions per cohort.",
    lead:
      "A trained counsellor supports emotional regulation, confidence, and personal challenges.",
    body: [
      "Participants have access to a trained counsellor who offers up to six confidential one-on-one sessions during each cohort. Counselling focuses on emotional regulation, confidence building, stress management, communication, and personal challenges that may affect school or home life.",
      "Sessions are arranged based on individual needs to ensure every youth receives appropriate support. Staff and mentors use trauma-informed, youth-centered practices.",
    ],
    outcomes: [
      "Confidential counselling access",
      "Tools for stress and communication",
      "Stronger sense of belonging",
    ],
  },
  {
    slug: "smartbox-nutrition",
    name: "Nutrition & Meals",
    short:
      "A healthy meal every session — partnership with 5N2 — plus nutrition workshops.",
    lead:
      "Nutrition removes barriers so youth can show up ready to train and learn.",
    body: [
      "Youth receive a healthy meal at every session through a partnership with 5N2, ensuring basic nutritional needs are met while reducing food-insecurity barriers that may impact participation or school performance.",
      "Each cohort includes a nutrition workshop that teaches simple habits for healthier daily living.",
    ],
    outcomes: [
      "Meal at every session",
      "Reduced barriers to participation",
      "Practical nutrition habits",
    ],
  },
  {
    slug: "smartbox-career-pathways",
    name: "Career Pathways",
    short:
      "Resume, interview, and job-readiness coaching with Arrow Group for older youth.",
    lead:
      "Older youth get targeted career coaching and pathways to paid work.",
    body: [
      "Older youth receive targeted career coaching through Arrow Group, including help with resumes, interviewing, communication skills, and preparation for entry-level employment.",
      "The program aims to place at least ten youth in paid positions each year, creating meaningful pathways to independence.",
    ],
    outcomes: [
      "Resume and interview skills",
      "Entry-level job readiness",
      "Paid placement pathway goal",
    ],
  },
  {
    slug: "red-owl-boxing-classes",
    name: "Red Owl Boxing Classes",
    short:
      "Beginner, amateur, and competitive levels at 2206 Eglinton Ave E.",
    lead: "Train like a fighter. Think like a champion.",
    body: [
      "Red Owl Boxing Scarborough — powered by Scarberian Boxing Club — offers boxing classes for beginner, amateur, and competitive levels in a next-level training space built for fighters, athletes, and anyone ready to push beyond average.",
      "Gold membership includes community access across Scarberian and Red Owl. Hours: Mon–Fri 5:00 PM–10:00 PM (Saturday coming soon).",
    ],
    outcomes: [
      "Classes for all levels",
      "Dual-gym community access",
      "Pro-camp energy in Scarborough",
    ],
  },
  {
    slug: "red-owl-open-gym",
    name: "Open Gym & Weight Room",
    short:
      "Full racks, dumbbells, cardio, bags, change rooms, and showers.",
    lead: "Your all-access pass to a fighter’s lifestyle.",
    body: [
      "Beyond classes, members get open gym and weight-room access — full racks, dumbbells, cardio equipment, heavy bags, private showers, and lockers.",
      "An expanded schedule means more classes, more open hours, and more flexibility to train around work and school.",
    ],
    outcomes: [
      "Strength and conditioning access",
      "Flexible open-gym hours",
      "Train, clean up, and head out",
    ],
  },
];

export const RED_OWL_TEAM = [
  {
    id: "boxing-coaches",
    name: "Boxing Coaches",
    title: "Certified floor coaches",
    bio: "Certified coaches deliver Smartbox and Red Owl boxing with a focus on safe technique, movement, conditioning, and self-control — adapted to every skill level.",
    photoUrl: null as string | null,
  },
  {
    id: "mentors",
    name: "Mentors",
    title: "Weekly mentorship",
    bio: "Supportive adults who guide communication, discipline, leadership, and goal setting. Regular check-ins help youth reflect on progress and stay accountable.",
    photoUrl: null,
  },
  {
    id: "tutors",
    name: "Academic Tutors",
    title: "Homework & school support",
    bio: "Community volunteers and post-secondary students support homework, literacy, numeracy, and organization so participants stay on track with school expectations.",
    photoUrl: null,
  },
  {
    id: "counsellor",
    name: "Program Counsellor",
    title: "Emotional support",
    bio: "A trained counsellor offers up to six confidential one-on-one sessions per cohort — emotional regulation, confidence, stress management, and personal challenges.",
    photoUrl: null,
  },
  {
    id: "arrow-group",
    name: "Arrow Group",
    title: "Career pathways partner",
    bio: "Career coaching for older youth — resumes, interviewing, communication skills, and preparation for entry-level employment, with a goal of paid placements each year.",
    photoUrl: null,
  },
  {
    id: "5n2",
    name: "5N2",
    title: "Nutrition partner",
    bio: "Healthy meals at every Smartbox session so nutritional needs are met and food-insecurity barriers don’t stop youth from showing up.",
    photoUrl: null,
  },
  {
    id: "scarberian",
    name: "Scarberian Boxing Club",
    title: "Gym partnership",
    bio: "Red Owl Scarborough is powered by Scarberian Boxing Club — two forces, one mission. Gold membership includes access to both gyms.",
    photoUrl: null,
  },
] as const;
