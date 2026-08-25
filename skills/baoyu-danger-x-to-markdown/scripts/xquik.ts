import XTwitterScraper from "x-twitter-scraper";

type XquikAuthor = {
  id: string;
  name: string;
  username: string;
};

type XquikTweet = {
  id: string;
  text: string;
  article?: { title?: string };
  author?: XquikAuthor;
  conversationId?: string;
  createdAt?: string;
};

type XquikTweetResponse = {
  tweet: XquikTweet;
  author?: XquikAuthor;
};

type XquikThreadPage = {
  has_next_page: boolean;
  next_cursor: string;
  tweets: XquikTweet[];
};

type XquikThreadQuery = {
  conversationId?: string;
  cursor?: string;
  fromUser?: string;
  pageSize: number;
};

export type XquikTweetsClient = {
  retrieve(tweetId: string): Promise<XquikTweetResponse>;
  getThread(tweetId: string, query: XquikThreadQuery): Promise<XquikThreadPage>;
};

export type XquikThreadResult = {
  requestedId: string;
  rootId: string;
  tweets: XquikTweet[];
  totalTweets: number;
  user?: XquikAuthor;
};

type FetchXquikThreadOptions = {
  apiKey?: string;
  client?: XquikTweetsClient;
  maxPages?: number;
};

function createClient(apiKey: string | undefined): XquikTweetsClient {
  if (!apiKey?.trim()) {
    throw new Error(
      "Xquik requires X_TWITTER_SCRAPER_API_KEY. Set it or use --provider legacy."
    );
  }

  return new XTwitterScraper({ apiKey }).x.tweets;
}

function sortTweets(tweets: XquikTweet[]): XquikTweet[] {
  return tweets
    .map((tweet, index) => ({ tweet, index }))
    .sort((left, right) => {
      const leftTime = left.tweet.createdAt ? Date.parse(left.tweet.createdAt) : Number.NaN;
      const rightTime = right.tweet.createdAt ? Date.parse(right.tweet.createdAt) : Number.NaN;
      if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
        return left.index - right.index;
      }
      if (Number.isNaN(leftTime)) return 1;
      if (Number.isNaN(rightTime)) return -1;
      if (leftTime === rightTime) return left.index - right.index;
      return leftTime - rightTime;
    })
    .map(({ tweet }) => tweet);
}

export async function fetchXquikThread(
  tweetId: string,
  options: FetchXquikThreadOptions = {}
): Promise<XquikThreadResult> {
  const client = options.client ?? createClient(options.apiKey);
  const maxPages = options.maxPages ?? 100;
  const rootResponse = await client.retrieve(tweetId);
  const rootTweet = {
    ...rootResponse.tweet,
    author: rootResponse.tweet.author ?? rootResponse.author,
  };
  const tweets = new Map<string, XquikTweet>([[rootTweet.id, rootTweet]]);
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
    const page = await client.getThread(tweetId, {
      conversationId: rootTweet.conversationId,
      cursor,
      fromUser: rootTweet.author?.username,
      pageSize: 100,
    });

    for (const tweet of page.tweets) {
      if (tweet.id === rootTweet.id) {
        continue;
      }
      if (
        rootTweet.author?.username &&
        tweet.author?.username &&
        tweet.author.username !== rootTweet.author.username
      ) {
        continue;
      }
      if (
        rootTweet.conversationId &&
        tweet.conversationId &&
        tweet.conversationId !== rootTweet.conversationId
      ) {
        continue;
      }
      tweets.set(tweet.id, tweet);
    }

    if (!page.has_next_page) {
      const sortedTweets = sortTweets([...tweets.values()]);
      const rootId =
        sortedTweets.find((tweet) => tweet.id === rootTweet.conversationId)?.id ??
        sortedTweets[0]?.id ??
        rootTweet.id;
      return {
        requestedId: tweetId,
        rootId,
        tweets: sortedTweets,
        totalTweets: sortedTweets.length,
        user: rootTweet.author,
      };
    }

    const nextCursor = page.next_cursor.trim();
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error("Xquik returned an invalid thread pagination cursor.");
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  throw new Error(`Xquik thread exceeded the ${maxPages}-page safety limit.`);
}
