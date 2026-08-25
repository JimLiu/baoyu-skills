---
"baoyu-fetch": patch
---

Mark `jsdom` as external in the bundle. Bundling it inlined the build machine's absolute path to `xhr-sync-worker.js`, so the published CLI crashed on any other machine with `Cannot find module .../jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js`.
