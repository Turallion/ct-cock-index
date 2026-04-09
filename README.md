# CT Cock Index

Bullish tweets. Bigger results.

CT Cock Index is a meme Next.js app that analyzes an X account's last 30 days of tweets, scores the posting tone with bullish and bearish keyword dictionaries, and returns a completely unserious size rating.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- `twitterapi.io` via a server-side API route

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example and add your `twitterapi.io` API key:

   ```bash
   cp .env.example .env.local
   ```

3. Set `TWITTER_API_KEY` in `.env.local`.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```bash
TWITTER_API_KEY=your_api_key_here
```

## How it works

1. The frontend posts a username to `/api/analyze`.
2. The backend resolves the username with `twitterapi.io` using `/twitter/user/info?userName=<username>`.
3. The backend waits 5 seconds to respect the free-tier rate limit.
4. The backend fetches tweets from `/twitter/user/tweet_timeline?userId=<userId>&includeReplies=false`.
5. The returned tweets are filtered to the last 30 days using each tweet's `createdAt`.
6. The remaining text is scored with bullish and bearish keywords plus phrase bonuses.
7. The API returns score details and a meme level for the result card.

## Notes

- The app handles missing users, empty recent tweet history, missing tokens, and upstream API errors gracefully.
- The API key is only used server-side in [`lib/twitter.ts`](/Users/turaljalilov/Documents/CT%20cock%20index/lib/twitter.ts).
- The result card is designed to be screenshot-friendly for sharing.
- Disclaimer: Powered by advanced sentiment analysis and absolutely no science.
