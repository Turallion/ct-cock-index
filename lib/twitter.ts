import type { AnalyzedTweetInput, ProfileSignals } from "@/lib/types";

const TWITTER_API_BASE = "https://api.twitterapi.io/twitter";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type TwitterApiErrorPayload = {
  message?: string;
  error?: string;
  detail?: string;
};

type UserInfoResponse = {
  data?: {
    id?: string;
    profilePicture?: string;
    profile_image_url?: string;
    avatar?: string;
    description?: string;
    bio?: string;
    createdAt?: string;
    created_at?: string;
    verified?: boolean;
    isBlueVerified?: boolean;
    followersCount?: number;
    friendsCount?: number;
    followingCount?: number;
    user?: {
      id?: string;
      profilePicture?: string;
      profile_image_url?: string;
      avatar?: string;
      description?: string;
      bio?: string;
      createdAt?: string;
      created_at?: string;
      verified?: boolean;
      isBlueVerified?: boolean;
      followersCount?: number;
      friendsCount?: number;
      followingCount?: number;
    };
    data?: {
      id?: string;
      profilePicture?: string;
      profile_image_url?: string;
      avatar?: string;
      description?: string;
      bio?: string;
      createdAt?: string;
      created_at?: string;
      verified?: boolean;
      isBlueVerified?: boolean;
      followersCount?: number;
      friendsCount?: number;
      followingCount?: number;
    };
  };
  id?: string;
  profilePicture?: string;
  profile_image_url?: string;
  avatar?: string;
  description?: string;
  bio?: string;
  createdAt?: string;
  created_at?: string;
  verified?: boolean;
  isBlueVerified?: boolean;
  followersCount?: number;
  friendsCount?: number;
  followingCount?: number;
  user?: {
    id?: string;
    profilePicture?: string;
    profile_image_url?: string;
    avatar?: string;
    description?: string;
    bio?: string;
    createdAt?: string;
    created_at?: string;
    verified?: boolean;
    isBlueVerified?: boolean;
    followersCount?: number;
    friendsCount?: number;
    followingCount?: number;
  };
  error?: string;
  message?: string;
};

export type TwitterTimelineTweet = {
  id?: string;
  text?: string;
  fullText?: string;
  createdAt?: string;
  created_at?: string;
  likeCount?: number;
  likes?: number;
  favorite_count?: number;
  retweetCount?: number;
  retweets?: number;
  repost_count?: number;
  quoteCount?: number;
  quotes?: number;
  quote_count?: number;
  viewCount?: number;
  views?: number;
  view_count?: number;
  author?: {
    followers?: number;
  };
};

export type TwitterUserProfile = {
  id: string;
  profile: ProfileSignals;
};

type TimelineResponse = {
  tweets?: TwitterTimelineTweet[];
  data?: {
    tweets?: TwitterTimelineTweet[];
  };
  error?: string;
  message?: string;
};

function getApiKey() {
  const apiKey = process.env.TWITTER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TWITTER_API_KEY environment variable.");
  }

  return apiKey;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callTwitterApi<T>(path: string, query: Record<string, string>) {
  const apiKey = getApiKey();
  const url = new URL(`${TWITTER_API_BASE}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;

    try {
      const rawBody = await response.text();

      if (rawBody.trim()) {
        try {
          const payload = JSON.parse(rawBody) as TwitterApiErrorPayload;

          detail = payload.detail ?? payload.message ?? payload.error ?? rawBody;
        } catch {
          detail = rawBody;
        }
      }
    } catch {
      // Fall back to the HTTP status if the upstream body cannot be read.
    }

    throw new Error(`twitterapi.io request failed: ${detail}`);
  }

  return (await response.json()) as T;
}

async function getUserIdByUsername(username: string) {
  const cleaned = username.replace(/^@/, "").trim();

  if (!cleaned) {
    throw new Error("Enter an X username to analyze.");
  }

  const payload = await callTwitterApi<UserInfoResponse>("/user/info", {
    userName: cleaned,
  });

  const userId =
    payload.data?.data?.id ?? payload.data?.id ?? payload.id ?? payload.user?.id ?? payload.data?.user?.id;

  if (!userId) {
    throw new Error("User not found");
  }

  const profileImageUrl =
    payload.data?.data?.profilePicture ??
    payload.data?.data?.profile_image_url ??
    payload.data?.data?.avatar ??
    payload.data?.profilePicture ??
    payload.data?.profile_image_url ??
    payload.data?.avatar ??
    payload.profilePicture ??
    payload.profile_image_url ??
    payload.avatar ??
    payload.user?.profilePicture ??
    payload.user?.profile_image_url ??
    payload.user?.avatar ??
    payload.data?.user?.profilePicture ??
    payload.data?.user?.profile_image_url ??
    payload.data?.user?.avatar ??
    null;

  const bio =
    payload.data?.data?.bio ??
    payload.data?.data?.description ??
    payload.data?.bio ??
    payload.data?.description ??
    payload.bio ??
    payload.description ??
    payload.user?.bio ??
    payload.user?.description ??
    payload.data?.user?.bio ??
    payload.data?.user?.description ??
    "";

  const accountCreatedAt =
    payload.data?.data?.createdAt ??
    payload.data?.data?.created_at ??
    payload.data?.createdAt ??
    payload.data?.created_at ??
    payload.createdAt ??
    payload.created_at ??
    payload.user?.createdAt ??
    payload.user?.created_at ??
    payload.data?.user?.createdAt ??
    payload.data?.user?.created_at ??
    null;

  const followersCount =
    payload.data?.data?.followersCount ??
    payload.data?.data?.friendsCount ??
    payload.data?.followersCount ??
    payload.data?.friendsCount ??
    payload.followersCount ??
    payload.friendsCount ??
    payload.user?.followersCount ??
    payload.user?.friendsCount ??
    payload.data?.user?.followersCount ??
    payload.data?.user?.friendsCount ??
    0;

  const followingCount =
    payload.data?.data?.followingCount ??
    payload.data?.data?.friendsCount ??
    payload.data?.followingCount ??
    payload.data?.friendsCount ??
    payload.followingCount ??
    payload.friendsCount ??
    payload.user?.followingCount ??
    payload.user?.friendsCount ??
    payload.data?.user?.followingCount ??
    payload.data?.user?.friendsCount ??
    0;

  const verified = Boolean(
    payload.data?.data?.verified ??
      payload.data?.data?.isBlueVerified ??
      payload.data?.verified ??
      payload.data?.isBlueVerified ??
      payload.verified ??
      payload.isBlueVerified ??
      payload.user?.verified ??
      payload.user?.isBlueVerified ??
      payload.data?.user?.verified ??
      payload.data?.user?.isBlueVerified,
  );

  return {
    id: userId,
    profile: {
      profileImageUrl,
      followersCount,
      followingCount,
      verified,
      bio,
      accountCreatedAt,
    },
  };
}

export async function getTweetsByUsername(username: string) {
  const userProfile = await getUserIdByUsername(username);

  await sleep(5000);

  const payload = await callTwitterApi<TimelineResponse>("/user/tweet_timeline", {
    userId: userProfile.id,
    includeReplies: "false",
  });

  return {
    tweets: payload.data?.tweets ?? payload.tweets ?? [],
    profile: userProfile.profile,
  };
}

export async function getLast30DaysTweetsByUsername(username: string) {
  const { tweets, profile } = await getTweetsByUsername(username);

  const cutoff = Date.now() - THIRTY_DAYS_MS;

  const recentTweets = tweets.filter((tweet) => {
    const rawDate = tweet.createdAt ?? tweet.created_at;
    const createdAt = rawDate ? new Date(rawDate).getTime() : Number.NaN;
    return Number.isFinite(createdAt) && createdAt >= cutoff;
  });

  return {
    profile,
    tweets: recentTweets
      .map((tweet): AnalyzedTweetInput | null => {
        const text = (tweet.text ?? tweet.fullText ?? "").trim();
        const createdAt = tweet.createdAt ?? tweet.created_at ?? "";

        if (!text || !createdAt) {
          return null;
        }

        return {
          text,
          createdAt,
          likeCount: tweet.likeCount ?? tweet.likes ?? tweet.favorite_count ?? 0,
          retweetCount: tweet.retweetCount ?? tweet.retweets ?? tweet.repost_count ?? 0,
          quoteCount: tweet.quoteCount ?? tweet.quotes ?? tweet.quote_count ?? 0,
          viewCount: tweet.viewCount ?? tweet.views ?? tweet.view_count ?? 0,
        };
      })
      .filter((tweet): tweet is AnalyzedTweetInput => tweet !== null),
  };
}
