import { NextRequest, NextResponse } from "next/server";
import { scoreTweets } from "@/lib/scoring";
import { getLast30DaysTweetsByUsername } from "@/lib/twitter";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string };
    const username = body.username?.replace(/^@/, "").trim();

    if (!username) {
      return NextResponse.json({ error: "Enter an X username to analyze." }, { status: 400 });
    }

    const { tweets, profile } = await getLast30DaysTweetsByUsername(username);

    if (tweets.length === 0) {
      return NextResponse.json(
        { error: "No tweets found in the last 30 days after filtering replies." },
        { status: 404 },
      );
    }

    return NextResponse.json(scoreTweets(username, tweets, profile));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while analyzing account.";
    const normalized = message.toLowerCase();
    const status =
      normalized.includes("not found")
        ? 404
        : normalized.includes("no tweets")
          ? 404
          : normalized.includes("missing twitter_api_key")
            ? 500
            : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
