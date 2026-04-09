import type { AnalysisResponse } from "@/lib/types";

type LevelInfo = {
  level: number;
  centimeters: number;
  label: string;
  comments: [string, string, string];
  confidenceNotes: [string, string, string];
};

const bullishWords = [
  "bullish",
  "sending",
  "moon",
  "breakout",
  "accumulate",
  "buying",
  "bid",
  "pump",
  "altseason",
  "long",
  "giga",
  "strong",
  "reversal",
  "up only",
  "we're so back",
  "we’re so back",
];

const bearishWords = [
  "bearish",
  "dump",
  "crash",
  "sell",
  "bottom not in",
  "dead",
  "exit liquidity",
  "ngmi",
  "short",
  "rug",
  "scam",
  "over",
  "pain",
  "cooked",
  "it's over",
  "it’s over",
];

const bullishPhrases = ["i'm buying", "i’m buying", "altseason coming", "we're so back", "we’re so back"];
const bearishPhrases = ["it's over", "it’s over", "going lower", "dead cat bounce"];

const levels: LevelInfo[] = [
  {
    level: 0,
    centimeters: 1,
    label: "Pussy",
    comments: [
      "The chart saw this account coming and chose self-defense.",
      "Pure fear posting. The timeline shrank on contact.",
      "A masterpiece of anti-conviction with catastrophic aura.",
    ],
    confidenceNotes: [
      "Confidence low but the damage is obvious.",
      "Confidence medium. Even the crumbs looked scared.",
      "Confidence suspiciously high for something this tiny.",
    ],
  },
  {
    level: 1,
    centimeters: 2,
    label: "LEGO Man",
    comments: [
      "Small build, oversized confidence, classic CT starter pack.",
      "Strong opinions packed into a deeply limited frame.",
      "Miniature conviction with maximum screenshot potential.",
    ],
    confidenceNotes: [
      "Confidence moderate. The plastic was molded correctly.",
      "Confidence decent. Enough posting to confirm the silhouette.",
      "Confidence medium-high. Tiny, but consistently tiny.",
    ],
  },
  {
    level: 2,
    centimeters: 3,
    label: "Lighter",
    comments: [
      "Some heat, not enough to start a proper mania.",
      "Flammable posting with budget-sized ambition.",
      "Just enough spark to scare the curtains.",
    ],
    confidenceNotes: [
      "Confidence medium. The flame flickered but stayed alive.",
      "Confidence decent. Plenty of smoke in the sample.",
      "Confidence medium-high. This one definitely carries heat.",
    ],
  },
  {
    level: 3,
    centimeters: 5,
    label: "Bank Card",
    comments: [
      "Swipeable levels of conviction, no premium benefits included.",
      "Stable dimensions for a professional bullposter in training.",
      "Looks normal until the posting history gets involved.",
    ],
    confidenceNotes: [
      "Confidence solid. The dimensions cleared basic compliance.",
      "Confidence decent. Transaction history checks out.",
      "Confidence medium-high. The sample posted with regularity.",
    ],
  },
  {
    level: 4,
    centimeters: 7,
    label: "Energy Drink",
    comments: [
      "A twitchy mid-cap of pure timeline caffeine.",
      "The posting is loud, charged, and legally concerning.",
      "Fully carbonated conviction with neon chart energy.",
    ],
    confidenceNotes: [
      "Confidence high enough to hear the can crack.",
      "Confidence solid. The stimulation levels were measurable.",
      "Confidence strong. This account definitely posts before bed.",
    ],
  },
  {
    level: 5,
    centimeters: 10,
    label: "School Ruler",
    comments: [
      "Now we are in measurable territory with classroom authority.",
      "A clean, disciplined size backed by repeated bullish behavior.",
      "Big enough to teach lessons, small enough to stay humble.",
    ],
    confidenceNotes: [
      "Confidence high. The lab finally found straight edges.",
      "Confidence strong. Repeated signals support the reading.",
      "Confidence high. Multiple tweets lined up perfectly.",
    ],
  },
  {
    level: 6,
    centimeters: 14,
    label: "Wine Bottle",
    comments: [
      "Elegant size with a finish that lingers on the timeline.",
      "This account posts like it owns a private cellar and a thesis.",
      "Rich body, bullish nose, and dangerous aftertaste.",
    ],
    confidenceNotes: [
      "Confidence strong. The bouquet of conviction was undeniable.",
      "Confidence high. Barrel-aged posting leaves traces.",
      "Confidence very good. A mature sample with depth.",
    ],
  },
  {
    level: 7,
    centimeters: 18,
    label: "Baseball Bat",
    comments: [
      "Blunt-force conviction with home-run aspirations.",
      "This is not posting anymore. This is extra-base damage.",
      "A loud, hardwood statement to the entire timeline.",
    ],
    confidenceNotes: [
      "Confidence high. Impact marks were visible everywhere.",
      "Confidence very high. The sample made contact repeatedly.",
      "Confidence strong. This one swings through every candle.",
    ],
  },
  {
    level: 8,
    centimeters: 24,
    label: "Katana",
    comments: [
      "Sharply forged conviction with elite timeline discipline.",
      "Precision bullposting. Clean cuts, no wasted motion.",
      "A refined weapon built for slicing through weak sentiment.",
    ],
    confidenceNotes: [
      "Confidence very high. The edge quality is exceptional.",
      "Confidence strong. Every signal arrived polished and lethal.",
      "Confidence elite. The sample was absurdly clean.",
    ],
  },
  {
    level: 9,
    centimeters: 30,
    label: "CT God",
    comments: [
      "This account doesn’t post takes. It writes commandments.",
      "Top-shelf conviction with apocalyptic engagement energy.",
      "An endgame specimen of fully weaponized CT presence.",
    ],
    confidenceNotes: [
      "Confidence divine. The reading practically announced itself.",
      "Confidence off the charts. The timeline bowed respectfully.",
      "Confidence absolute. This is folklore with timestamps.",
    ],
  },
];

function escapeForRegex(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(text: string, terms: string[]) {
  return terms.reduce((count, term) => {
    const regex = new RegExp(escapeForRegex(term), "g");
    const matches = text.match(regex);
    return count + (matches?.length ?? 0);
  }, 0);
}

function getLevel(score: number): LevelInfo {
  if (score <= 1) {
    return levels[0];
  }
  if (score <= 3) {
    return levels[1];
  }
  if (score <= 5) {
    return levels[2];
  }
  if (score <= 7) {
    return levels[3];
  }
  if (score <= 9) {
    return levels[4];
  }
  if (score <= 11) {
    return levels[5];
  }
  if (score <= 13) {
    return levels[6];
  }
  if (score <= 15) {
    return levels[7];
  }
  if (score <= 17) {
    return levels[8];
  }
  return levels[9];
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function scoreTweets(
  username: string,
  tweets: string[],
  profileImageUrl: string | null = null,
): AnalysisResponse {
  const normalizedTweets = tweets.map((tweet) => tweet.toLowerCase());
  const combinedText = normalizedTweets.join("\n");

  const bullishWordHits = countMatches(combinedText, bullishWords);
  const bearishWordHits = countMatches(combinedText, bearishWords);
  const bullishPhraseHits = countMatches(combinedText, bullishPhrases);
  const bearishPhraseHits = countMatches(combinedText, bearishPhrases);

  const bullishHits = bullishWordHits + bullishPhraseHits;
  const bearishHits = bearishWordHits + bearishPhraseHits;
  const rawScore = bullishHits * 2.3 - bearishHits * 1.2;
  const variance = Math.random() * 1.5 - 0.5;
  const adjustedScore = rawScore + 6 + variance;
  const score = Number(adjustedScore.toFixed(2));
  const levelInfo = getLevel(adjustedScore);

  return {
    username,
    profileImageUrl,
    score,
    rawScore: Number(rawScore.toFixed(2)),
    adjustedScore: Number(adjustedScore.toFixed(2)),
    bullishHits,
    bearishHits,
    tweetCount: tweets.length,
    level: levelInfo.level,
    centimeters: levelInfo.centimeters,
    label: levelInfo.label,
    comment: pickRandom(levelInfo.comments),
    confidenceNote: pickRandom(levelInfo.confidenceNotes),
  };
}
