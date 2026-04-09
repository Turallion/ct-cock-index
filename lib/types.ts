export type AnalyzedTweetInput = {
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  quoteCount: number;
  viewCount: number;
};

export type ProfileSignals = {
  profileImageUrl: string | null;
  followersCount: number;
  followingCount: number;
  verified: boolean;
  bio: string;
  accountCreatedAt: string | null;
};

export type AnalysisResponse = {
  username: string;
  profileImageUrl: string | null;
  score: number;
  rawScore: number;
  adjustedScore: number;
  bullishHits: number;
  bearishHits: number;
  tweetCount: number;
  level: number;
  centimeters: number;
  label: string;
  comment: string;
  confidenceNote: string;
};
