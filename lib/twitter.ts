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
    user?: {
      id?: string;
      profilePicture?: string;
      profile_image_url?: string;
      avatar?: string;
    };
    data?: {
      id?: string;
      profilePicture?: string;
      profile_image_url?: string;
      avatar?: string;
    };
  };
  id?: string;
  profilePicture?: string;
  profile_image_url?: string;
  avatar?: string;
  user?: {
    id?: string;
    profilePicture?: string;
    profile_image_url?: string;
    avatar?: string;
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
};

export type TwitterUserProfile = {
  id: string;
  profileImageUrl: string | null;
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

  return {
    id: userId,
    profileImageUrl,
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
    profileImageUrl: userProfile.profileImageUrl,
  };
}

export async function getLast30DaysTweetsByUsername(username: string) {
  const { tweets, profileImageUrl } = await getTweetsByUsername(username);

  const cutoff = Date.now() - THIRTY_DAYS_MS;

  const recentTweets = tweets.filter((tweet) => {
    const rawDate = tweet.createdAt ?? tweet.created_at;
    const createdAt = rawDate ? new Date(rawDate).getTime() : Number.NaN;
    return Number.isFinite(createdAt) && createdAt >= cutoff;
  });

  return {
    profileImageUrl,
    tweets: recentTweets
      .map((tweet) => tweet.text ?? tweet.fullText ?? "")
      .map((text) => text.trim())
      .filter(Boolean),
  };
}
