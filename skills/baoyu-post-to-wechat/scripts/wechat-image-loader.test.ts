import assert from "node:assert/strict";
import test from "node:test";

import { getTagAttribute } from "./wechat-image-loader.ts";

test("getTagAttribute decodes the entities an HTML writer escapes", () => {
  const tag = '<img src="Q&amp;A.png" data-local-path="/posts/Q&amp;A.png" alt="a">';
  assert.equal(getTagAttribute(tag, "src"), "Q&A.png");
  assert.equal(getTagAttribute(tag, "data-local-path"), "/posts/Q&A.png");
});

test("getTagAttribute keeps a quote of the other kind inside the value", () => {
  assert.equal(getTagAttribute(`<img src="it's.png">`, "src"), "it's.png");
  assert.equal(getTagAttribute(`<img src='say "hi".png'>`, "src"), 'say "hi".png');
});

test("getTagAttribute matches the whole attribute name", () => {
  const tag = '<img data-src="lazy.png" src="real.png">';
  assert.equal(getTagAttribute(tag, "src"), "real.png");
  assert.equal(getTagAttribute('<img src="a.png">', "data-local-path"), undefined);
});
