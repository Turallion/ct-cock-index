import type { AnalysisResponse, AnalyzedTweetInput, ProfileSignals } from "@/lib/types";

type ConfidenceTier = "low" | "medium" | "high" | "elite";

type LevelInfo = {
  level: number;
  label: string;
  sizeRange: {
    min: number;
    max: number;
  };
  comments: [string, string, string];
};

type TweetAnalysis = {
  bullishHits: number;
  bearishHits: number;
  bullishPhraseHits: number;
  bearishPhraseHits: number;
  convictionPositiveHits: number;
  convictionNegativeHits: number;
  engagementTotal: number;
  engagementRichTweets: number;
  consistentTweets: number;
  inconsistentTweets: number;
  averageSentiment: number;
  toneConsistency: number;
  postingSpanDays: number;
};

type ScoreComponents = {
  sentimentComponent: number;
  convictionComponent: number;
  engagementComponent: number;
  activityComponent: number;
  profileComponent: number;
  noiseComponent: number;
  rawScore: number;
  adjustedScore: number;
};

type LevelMappingResult = {
  level: number;
  levelProgress: number;
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

const bullishPhrases = [
  "i'm buying",
  "i’m buying",
  "altseason coming",
  "we're so back",
  "we’re so back",
  "send it",
  "all in",
];

const bearishPhrases = ["it's over", "it’s over", "going lower", "dead cat bounce", "sell everything"];

const convictionPositiveTerms = [
  "i'm buying",
  "i’m buying",
  "buying",
  "loading",
  "conviction",
  "send it",
  "all in",
  "we are so back",
  "we're so back",
  "we’re so back",
  "bullish",
  "up only",
];

const convictionNegativeTerms = [
  "it's over",
  "it’s over",
  "over",
  "ngmi",
  "cooked",
  "bearish",
  "going lower",
  "dead",
  "exit liquidity",
  "sell everything",
];

const confidenceNotesByTier: Record<ConfidenceTier, [string, string, string]> = {
  low: [
    "Confidence low. The timeline delivered mostly static and bad posture.",
    "Confidence low. Sample quality was flimsy and heavily vibes-based.",
    "Confidence low. We found enough signal to joke, not enough to testify.",
  ],
  medium: [
    "Confidence medium. The account posted enough to sketch the outline.",
    "Confidence medium. There is signal here, but some chaos in the sample.",
    "Confidence medium. Reasonable evidence, still a little slippery.",
  ],
  high: [
    "Confidence high. The posting style kept repeating the same confession.",
    "Confidence high. Stronger signal, cleaner timeline, less guesswork.",
    "Confidence high. Multiple tweets corroborated the scene.",
  ],
  elite: [
    "Confidence elite. The evidence practically narrated itself.",
    "Confidence elite. Clean signal, strong engagement, no forensic doubts.",
    "Confidence elite. This timeline left fingerprints on every surface.",
  ],
};

const levels: LevelInfo[] = [
  {
    level: 0,
    label: "Sheet of Paper",
    sizeRange: { min: 0.1, max: 1.0 },
    comments: [
      "Technically exists. Barely measurable.",
      "A legal formality with almost no physical presence.",
      "Visible only to the brave and the extremely patient.",
    ],
  },
  {
    level: 1,
    label: "LEGO Man",
    sizeRange: { min: 1.0, max: 3.0 },
    comments: [
      "Small build, oversized confidence, classic CT starter pack.",
      "Strong opinions packed into a deeply limited frame.",
      "Miniature conviction with maximum screenshot potential.",
    ],
  },
  {
    level: 2,
    label: "Lighter",
    sizeRange: { min: 3.0, max: 6.0 },
    comments: [
      "Some heat, not enough to start a proper mania.",
      "Flammable posting with budget-sized ambition.",
      "Just enough spark to scare the curtains.",
    ],
  },
  {
    level: 3,
    label: "Bank Card",
    sizeRange: { min: 6.0, max: 10.0 },
    comments: [
      "Swipeable levels of conviction, no premium benefits included.",
      "Stable dimensions for a professional bullposter in training.",
      "Looks normal until the posting history gets involved.",
    ],
  },
  {
    level: 4,
    label: "Energy Drink",
    sizeRange: { min: 10.0, max: 14.0 },
    comments: [
      "A twitchy mid-cap of pure timeline caffeine.",
      "The posting is loud, charged, and legally concerning.",
      "Fully carbonated conviction with neon chart energy.",
    ],
  },
  {
    level: 5,
    label: "School Ruler",
    sizeRange: { min: 14.0, max: 18.0 },
    comments: [
      "Now we are in measurable territory with classroom authority.",
      "A clean, disciplined size backed by repeated bullish behavior.",
      "Big enough to teach lessons, small enough to stay humble.",
    ],
  },
  {
    level: 6,
    label: "Wine Bottle",
    sizeRange: { min: 18.0, max: 22.0 },
    comments: [
      "Elegant size with a finish that lingers on the timeline.",
      "This account posts like it owns a private cellar and a thesis.",
      "Rich body, bullish nose, and dangerous aftertaste.",
    ],
  },
  {
    level: 7,
    label: "Baseball Bat",
    sizeRange: { min: 22.0, max: 26.0 },
    comments: [
      "Blunt-force conviction with home-run aspirations.",
      "This is not posting anymore. This is extra-base damage.",
      "A loud, hardwood statement to the entire timeline.",
    ],
  },
  {
    level: 8,
    label: "Katana",
    sizeRange: { min: 26.0, max: 30.0 },
    comments: [
      "Sharply forged conviction with elite timeline discipline.",
      "Precision bullposting. Clean cuts, no wasted motion.",
      "A refined weapon built for slicing through weak sentiment.",
    ],
  },
  {
    level: 9,
    label: "CT God",
    sizeRange: { min: 30.0, max: 35.0 },
    comments: [
      "This account doesn’t post takes. It writes commandments.",
      "Top-shelf conviction with apocalyptic engagement energy.",
      "An endgame specimen of fully weaponized CT presence.",
    ],
  },
];

const thresholds = [1, 3, 5, 7, 9, 11, 13, 15, 17];
const bucketStarts = [-1, 1, 3, 5, 7, 9, 11, 13, 15, 17];
const bucketEnds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 20];

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeLogMetric(value: number, divisor: number) {
  if (value <= 0) {
    return 0;
  }

  return clamp(Math.log10(value + 1) / divisor, 0, 1.6);
}

function getTweetEngagement(tweet: AnalyzedTweetInput) {
  const like = normalizeLogMetric(tweet.likeCount, 2.6);
  const retweet = normalizeLogMetric(tweet.retweetCount, 2.2);
  const quote = normalizeLogMetric(tweet.quoteCount, 1.8);
  const views = normalizeLogMetric(tweet.viewCount, 3.2);
  return like + retweet + quote + views;
}

function analyzeTweets(tweets: AnalyzedTweetInput[]): TweetAnalysis {
  if (tweets.length === 0) {
    return {
      bullishHits: 0,
      bearishHits: 0,
      bullishPhraseHits: 0,
      bearishPhraseHits: 0,
      convictionPositiveHits: 0,
      convictionNegativeHits: 0,
      engagementTotal: 0,
      engagementRichTweets: 0,
      consistentTweets: 0,
      inconsistentTweets: 0,
      averageSentiment: 0,
      toneConsistency: 0,
      postingSpanDays: 0,
    };
  }

  let bullishHits = 0;
  let bearishHits = 0;
  let bullishPhraseHits = 0;
  let bearishPhraseHits = 0;
  let convictionPositiveHits = 0;
  let convictionNegativeHits = 0;
  let engagementTotal = 0;
  let engagementRichTweets = 0;
  let sentimentAccumulator = 0;
  let consistentTweets = 0;
  let inconsistentTweets = 0;

  const timestamps = tweets.map((tweet) => new Date(tweet.createdAt).getTime()).filter(Number.isFinite);

  for (const tweet of tweets) {
    const text = tweet.text.toLowerCase();
    const tweetBullishWords = countMatches(text, bullishWords);
    const tweetBearishWords = countMatches(text, bearishWords);
    const tweetBullishPhrases = countMatches(text, bullishPhrases);
    const tweetBearishPhrases = countMatches(text, bearishPhrases);
    const tweetConvictionPositive = countMatches(text, convictionPositiveTerms);
    const tweetConvictionNegative = countMatches(text, convictionNegativeTerms);
    const engagementWeight = 1 + getTweetEngagement(tweet) * 0.35;

    bullishHits += tweetBullishWords;
    bearishHits += tweetBearishWords;
    bullishPhraseHits += tweetBullishPhrases;
    bearishPhraseHits += tweetBearishPhrases;
    convictionPositiveHits += tweetConvictionPositive;
    convictionNegativeHits += tweetConvictionNegative;

    const tweetSentiment =
      (tweetBullishWords * 1.1 +
        tweetBullishPhrases * 2.2 +
        tweetConvictionPositive * 1.4 -
        tweetBearishWords * 1.1 -
        tweetBearishPhrases * 2.2 -
        tweetConvictionNegative * 1.4) *
      engagementWeight;

    sentimentAccumulator += tweetSentiment;
    engagementTotal += getTweetEngagement(tweet);

    if (getTweetEngagement(tweet) > 0.65) {
      engagementRichTweets += 1;
    }

    if (tweetSentiment > 0.75 || tweetSentiment < -0.75) {
      consistentTweets += 1;
    } else {
      inconsistentTweets += 1;
    }
  }

  const averageSentiment = sentimentAccumulator / tweets.length;
  const toneConsistency = clamp((Math.abs(averageSentiment) + consistentTweets * 0.2 - inconsistentTweets * 0.1) / 3, 0, 1);
  const postingSpanDays =
    timestamps.length > 1 ? clamp((Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24), 0, 30) : 0;

  return {
    bullishHits,
    bearishHits,
    bullishPhraseHits,
    bearishPhraseHits,
    convictionPositiveHits,
    convictionNegativeHits,
    engagementTotal,
    engagementRichTweets,
    consistentTweets,
    inconsistentTweets,
    averageSentiment,
    toneConsistency,
    postingSpanDays,
  };
}

function analyzeProfile(profile: ProfileSignals) {
  const followerSignal = normalizeLogMetric(profile.followersCount, 3);
  const ratioSignal =
    profile.followersCount > 0
      ? clamp(Math.log10((profile.followersCount + 10) / (profile.followingCount + 10)), -1, 1)
      : 0;
  const bioSignal = clamp((profile.bio.trim().length > 0 ? Math.min(profile.bio.trim().length / 120, 1) : 0) * 0.8, 0, 1);
  const verifiedSignal = profile.verified ? 0.5 : 0;

  let ageSignal = 0;
  if (profile.accountCreatedAt) {
    const ageMs = Date.now() - new Date(profile.accountCreatedAt).getTime();
    if (Number.isFinite(ageMs) && ageMs > 0) {
      ageSignal = clamp(ageMs / (1000 * 60 * 60 * 24 * 365 * 4), 0, 1);
    }
  }

  return {
    followerSignal,
    ratioSignal,
    bioSignal,
    verifiedSignal,
    ageSignal,
  };
}

function computeScore(tweetAnalysis: TweetAnalysis, profile: ProfileSignals): ScoreComponents {
  const profileAnalysis = analyzeProfile(profile);
  const sentimentBase =
    tweetAnalysis.bullishHits * 0.7 +
    tweetAnalysis.bullishPhraseHits * 1.3 -
    tweetAnalysis.bearishHits * 0.65 -
    tweetAnalysis.bearishPhraseHits * 1.25;
  const convictionBase = tweetAnalysis.convictionPositiveHits * 0.95 - tweetAnalysis.convictionNegativeHits * 0.9;
  const engagementComponent = clamp(
    tweetAnalysis.engagementTotal / Math.max(tweetAnalysis.consistentTweets + tweetAnalysis.inconsistentTweets, 1) +
      tweetAnalysis.engagementRichTweets * 0.08,
    -0.5,
    2.8,
  );
  const activityComponent = clamp(
    (Math.min(tweetAnalysis.consistentTweets + tweetAnalysis.inconsistentTweets, 20) / 6 - 1.1) +
      tweetAnalysis.postingSpanDays / 20,
    -1.4,
    2.2,
  );
  const profileComponent = clamp(
    profileAnalysis.followerSignal * 0.7 +
      profileAnalysis.ratioSignal * 0.35 +
      profileAnalysis.bioSignal * 0.35 +
      profileAnalysis.verifiedSignal +
      profileAnalysis.ageSignal * 0.25,
    -0.5,
    2.2,
  );
  const sentimentComponent = clamp(sentimentBase / 3.2 + tweetAnalysis.averageSentiment * 0.08, -4.5, 4.5);
  const convictionComponent = clamp(
    convictionBase / 2.4 + tweetAnalysis.toneConsistency * Math.sign(tweetAnalysis.averageSentiment || 1) * 0.4,
    -4,
    4,
  );
  const noiseComponent = Math.random() * 1.1 - 0.55;
  const rawScore =
    sentimentComponent * 1.8 +
    convictionComponent * 2.2 +
    engagementComponent * 0.9 +
    activityComponent * 0.8 +
    profileComponent * 0.6 +
    noiseComponent;
  const adjustedScore = rawScore + 6.8;

  return {
    sentimentComponent,
    convictionComponent,
    engagementComponent,
    activityComponent,
    profileComponent,
    noiseComponent,
    rawScore,
    adjustedScore,
  };
}

function mapScoreToLevel(score: number): LevelMappingResult {
  const level = thresholds.findIndex((threshold) => score <= threshold);
  const resolvedLevel = level === -1 ? 9 : level;
  const bucketStart = bucketStarts[resolvedLevel];
  const bucketEnd = bucketEnds[resolvedLevel];
  const levelProgress = clamp((score - bucketStart) / (bucketEnd - bucketStart || 1), 0, 1);

  return {
    level: resolvedLevel,
    levelProgress,
  };
}

function getSizeForLevel(level: number, adjustedScore: number, levelProgress: number) {
  const range = levels[level].sizeRange;
  const scoreBias = clamp((adjustedScore - 9) / 12, -0.25, 0.25);
  const noise = Math.random() * 0.18 - 0.09;
  const progress = clamp(levelProgress + scoreBias + noise, 0, 1);
  const value = range.min + (range.max - range.min) * progress;
  return Number(value.toFixed(1));
}

function getConfidenceTier(tweetAnalysis: TweetAnalysis, tweetCount: number): ConfidenceTier {
  const engagementCoverage = tweetCount > 0 ? tweetAnalysis.engagementRichTweets / tweetCount : 0;
  const consistencyScore = tweetAnalysis.toneConsistency;

  if (tweetCount >= 12 && consistencyScore > 0.8 && engagementCoverage > 0.45) {
    return "elite";
  }

  if (tweetCount >= 8 && consistencyScore > 0.55) {
    return "high";
  }

  if (tweetCount >= 4 && consistencyScore > 0.25) {
    return "medium";
  }

  return "low";
}

export function scoreTweets(
  username: string,
  tweets: AnalyzedTweetInput[],
  profile: ProfileSignals,
): AnalysisResponse {
  const tweetAnalysis = analyzeTweets(tweets);
  const scoreComponents = computeScore(tweetAnalysis, profile);
  const levelMapping = mapScoreToLevel(scoreComponents.adjustedScore);
  const levelInfo = levels[levelMapping.level];
  const centimeters = getSizeForLevel(levelInfo.level, scoreComponents.adjustedScore, levelMapping.levelProgress);
  const confidenceTier = getConfidenceTier(tweetAnalysis, tweets.length);

  return {
    username,
    profileImageUrl: profile.profileImageUrl,
    score: Number(scoreComponents.adjustedScore.toFixed(1)),
    rawScore: Number(scoreComponents.rawScore.toFixed(2)),
    adjustedScore: Number(scoreComponents.adjustedScore.toFixed(2)),
    bullishHits: tweetAnalysis.bullishHits + tweetAnalysis.bullishPhraseHits + tweetAnalysis.convictionPositiveHits,
    bearishHits: tweetAnalysis.bearishHits + tweetAnalysis.bearishPhraseHits + tweetAnalysis.convictionNegativeHits,
    tweetCount: tweets.length,
    level: levelInfo.level,
    centimeters,
    label: levelInfo.label,
    comment: pickRandom(levelInfo.comments),
    confidenceNote: pickRandom(confidenceNotesByTier[confidenceTier]),
  };
}
