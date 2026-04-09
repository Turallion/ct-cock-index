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
