export type ShadowStance = "orthodox" | "southpaw";

export type ShadowCounts = {
  engine: string;
  stance: ShadowStance;
  durationSec: number;
  frames: number;
  visibleFrames: number;
  guardLowFrames: number;
  feetNarrowFrames: number;
  chinUpFrames: number;
  punches: number;
  jabs: number;
  crosses: number;
  hooks: number;
  uppercuts: number;
  shortStraights: number;
  missedReturns: number;
};

export type ShadowRead = {
  signal:
    | "unreadable"
    | "quiet"
    | "return"
    | "short"
    | "guard"
    | "feet"
    | "chin"
    | "clear";
  correction: string;
  drillTitle: string;
  drillSteps: string[];
};

function ratio(part: number, whole: number) {
  if (whole <= 0) return 0;
  return part / whole;
}

/** One correction. The phone can see shape and whether the hand came home. It cannot see force. */
export function judgeShadowRound(counts: ShadowCounts): ShadowRead {
  const visible = counts.visibleFrames;
  const seen = counts.frames > 0 && visible >= 12 && ratio(visible, counts.frames) >= 0.35;
  if (!seen || counts.engine === "timer-v1") {
    return {
      signal: "unreadable",
      correction:
        counts.engine === "timer-v1"
          ? "The form model did not load, so this round is the clock only."
          : "The camera never held your head, both gloves, and both shoes in the picture together.",
      drillTitle: "Set the phone, then the jab",
      drillSteps: [
        "Turn sideways. Prop the phone at chest height.",
        "Head, both gloves, and both shoes stay in frame.",
        "Throw the jab and touch the glove back to the cheek. Three sets of ten.",
      ],
    };
  }

  const straights = counts.jabs + counts.crosses;
  if (counts.punches < 2) {
    return {
      signal: "quiet",
      correction: "The camera saw you, but not two full punches with a start and a return.",
      drillTitle: "One jab, all the way home",
      drillSteps: [
        "Hands at the cheeks.",
        "Extend the lead hand in a straight line.",
        "Touch the glove back to the cheek before the next one. Three sets of ten.",
      ],
    };
  }
  if (ratio(counts.missedReturns, counts.punches) >= 0.45) {
    return {
      signal: "return",
      correction: "The hand is staying out after the punch. Bring the glove home to the cheek.",
      drillTitle: "Cheek-touch",
      drillSteps: [
        "Jab, then touch the lead glove to the cheek.",
        "Cross, then touch the rear glove to the cheek.",
        "Three sets of eight. The touch is the end of the punch.",
      ],
    };
  }
  if (straights >= 2 && ratio(counts.shortStraights, straights) >= 0.5) {
    return {
      signal: "short",
      correction: "The straight punches are stopping short. Reach through and then bring the hand home.",
      drillTitle: "Long jab",
      drillSteps: [
        "Stand side-on, lead shoulder toward the phone.",
        "Turn the lead shoulder as the jab extends.",
        "Bring the glove home. Three sets of eight.",
      ],
    };
  }
  if (ratio(counts.guardLowFrames, visible) >= 0.5) {
    return {
      signal: "guard",
      correction: "Between punches the gloves are living low. Park them on the cheeks.",
      drillTitle: "Gloves on the cheeks",
      drillSteps: [
        "Start with both gloves touching the cheeks.",
        "Throw one jab. Both gloves are home before the next punch.",
        "One minute, then rest.",
      ],
    };
  }
  if (ratio(counts.feetNarrowFrames, visible) >= 0.4) {
    return {
      signal: "feet",
      correction: "The feet come together. Keep a base about as wide as the shoulders.",
      drillTitle: "Shoulder-width base",
      drillSteps: [
        "Set the shoes about shoulder-width, lead foot toward the phone.",
        "Shadow the jab without the shoes touching.",
        "Three rounds of one minute.",
      ],
    };
  }
  if (ratio(counts.chinUpFrames, visible) >= 0.55) {
    return {
      signal: "chin",
      correction: "The chin is up. Tuck it and look through the eyebrows.",
      drillTitle: "Chin tucked jab",
      drillSteps: [
        "Touch the chin toward the chest and keep the eyes up.",
        "Throw the jab from there.",
        "Three sets of eight. The chin stays down between punches.",
      ],
    };
  }
  return {
    signal: "clear",
    correction: "Hands come home and the base is there. Next is the step with the jab.",
    drillTitle: "Step-jab",
    drillSteps: [
      "The lead foot moves with the jab.",
      "The rear foot slides after, base still wide.",
      "Three sets of eight, then the same with the cross.",
    ],
  };
}
