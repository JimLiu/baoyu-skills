import assert from "node:assert/strict";
import test from "node:test";

import { tweetToMarkdown } from "./tweet-to-markdown.js";
import type { XquikTweetsClient } from "./xquik.js";

function createClient(article = false): XquikTweetsClient {
  return {
    async retrieve() {
      return {
        tweet: {
          id: "123",
          text: "A post from Xquik",
          conversationId: "123",
          createdAt: "2026-01-01T00:00:00.000Z",
          ...(article ? { article: { title: "Article" } } : {}),
        },
        author: { id: "user-1", name: "Example", username: "example" },
      };
    },
    async getThread() {
      return {
        has_next_page: false,
        next_cursor: "",
        tweets: [],
      };
    },
  };
}

test("tweetToMarkdown converts an Xquik response without loading cookies", async () => {
  const markdown = await tweetToMarkdown("https://x.com/example/status/123", {
    provider: "xquik",
    xquikClient: createClient(),
  });

  assert.match(markdown, /url: "https:\/\/x\.com\/example\/status\/123"/);
  assert.match(markdown, /author: "Example \(@example\)"/);
  assert.match(markdown, /tweetCount: 1/);
  assert.match(markdown, /A post from Xquik/);
});

test("tweetToMarkdown rejects article-backed tweets when Xquik lacks article content", async () => {
  await assert.rejects(
    tweetToMarkdown("https://x.com/example/status/123", {
      provider: "xquik",
      xquikClient: createClient(true),
    }),
    /Use --provider legacy for X Articles/
  );
});
