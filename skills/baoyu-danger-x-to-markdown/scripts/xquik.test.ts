import assert from "node:assert/strict";
import test from "node:test";

import { fetchXquikThread, type XquikTweetsClient } from "./xquik.js";

test("fetchXquikThread paginates, deduplicates, and orders same-author tweets", async () => {
  const queries: unknown[] = [];
  const client: XquikTweetsClient = {
    async retrieve() {
      return {
        tweet: {
          id: "2",
          text: "Middle",
          conversationId: "1",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
        author: { id: "user-1", name: "Example", username: "example" },
      };
    },
    async getThread(_tweetId, query) {
      queries.push(query);
      if (!query.cursor) {
        return {
          has_next_page: true,
          next_cursor: "next-page",
          tweets: [
            {
              id: "1",
              text: "First",
              conversationId: "1",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
            {
              id: "2",
              text: "Middle",
              conversationId: "1",
              createdAt: "2026-01-02T00:00:00.000Z",
            },
          ],
        };
      }
      return {
        has_next_page: false,
        next_cursor: "",
        tweets: [
          {
            id: "3",
            text: "Last",
            conversationId: "1",
            createdAt: "2026-01-03T00:00:00.000Z",
          },
          {
            id: "foreign",
            text: "Other conversation",
            conversationId: "other",
            createdAt: "2026-01-04T00:00:00.000Z",
          },
        ],
      };
    },
  };

  const thread = await fetchXquikThread("2", { client });

  assert.deepEqual(
    thread.tweets.map((tweet) => tweet.id),
    ["1", "2", "3"]
  );
  assert.equal(thread.rootId, "1");
  assert.equal(thread.totalTweets, 3);
  assert.equal(thread.user?.username, "example");
  assert.equal(thread.tweets[1]?.author?.username, "example");
  assert.deepEqual(queries, [
    {
      conversationId: "1",
      cursor: undefined,
      fromUser: "example",
      pageSize: 100,
    },
    {
      conversationId: "1",
      cursor: "next-page",
      fromUser: "example",
      pageSize: 100,
    },
  ]);
});

test("fetchXquikThread rejects repeated pagination cursors", async () => {
  const client: XquikTweetsClient = {
    async retrieve() {
      return { tweet: { id: "1", text: "Tweet" } };
    },
    async getThread() {
      return {
        has_next_page: true,
        next_cursor: "repeated",
        tweets: [],
      };
    },
  };

  await assert.rejects(
    fetchXquikThread("1", { client }),
    /invalid thread pagination cursor/
  );
});

test("fetchXquikThread requires an API key without an injected client", async () => {
  await assert.rejects(
    fetchXquikThread("1", { apiKey: "" }),
    /X_TWITTER_SCRAPER_API_KEY/
  );
});
