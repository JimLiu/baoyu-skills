# @bot requests — extraction, misfire filtering, answer source

Read from SKILL.md Step 3.9 when at least one message in the batch matches a `bot_aliases` trigger.

**Extract** into an internal worklist `== @bot 请求清单 ==` (working memory only — never written to the final digest):

- Asker's real name — after Step 3.6 resolution; substitute `self_display` for the `self_wxid` user.
- Request body — the text after stripping the `@<alias>` prefix. If the message is a reply (per Step 3.5's quote/reply fields), include the quoted message as context.
- Anchor `local_id` for back-reference.

**Misfire filtering**: if a real member's nickname happens to equal an alias, judge by context. Keep only messages genuinely aimed at the digest bot (a question or request for it); skip clear person-to-person talk — a reply to that real person, or banter teasing them. (Choosing a `bot_aliases` value no real member uses avoids this at the source; the filter is a backstop.) Pure greetings/banter (`@bot 在吗`) may be kept with a brief reply.

**Answer-source constraint** (honored when rendering the section per [output-formats.md](output-formats.md)): answer from the group chat context plus your own knowledge only — **no web access**. For any request needing real-time or external information you can't verify, say so honestly (`这个我查不到实时数据，需要联网确认`) rather than fabricating.
