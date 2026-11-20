# Chinese Output Notes

Read when the summary is written in Chinese. These are the Chinese forms of the wording rules and length targets in SKILL.md; the rules themselves are unchanged.

## Length

| Part | Target |
|------|--------|
| Opening | 两三个短段，合计 300 字以内 |
| Whole summary, one-hour episode | 通常 1000 到 2500 字 |
| Closing run of minor points | 三四句话，不加小标题 |
| Direct quote | 十几个字以内 |

## Usage

- Match the reader's regional usage. Follow the variant the user writes in (Simplified with Mainland terms, or Traditional with Taiwan/Hong Kong terms); a loaded style guide or glossary decides when it covers the term.
- Keep a person's, company's, or product's name in its original spelling unless a Chinese name is the established one (谷歌、微软、英伟达、马斯克). Don't invent a transliteration.
- Direct quotes go in “” (「」 when writing Traditional Chinese). Use full-width punctuation.

## Wording

| Rule in SKILL.md | In Chinese |
|------------------|------------|
| Neutral reporting verbs | 用“他说”“他认为”“在他看来”。不用“坦言”“直言”这类替说话人加态度的词。 |
| Ordinary words, not figurative ones | 写“这些技能是从她自己的工作里总结出来的”，不写“长出来的”；写“这样迭代出来的技能”，不写“攒出来的”。同类的还有“啃下来”。 |
| No empty praise | 不用“知名专家”“行业大佬”“深耕多年”“见解独到”，写他具体做过的事。 |
| No evaluative connectives | “更妙的是”“反讽的是”都是评价，不用。 |
| Openers to avoid | “本期播客……”“这期节目请到了……” |
| Stock transitions to avoid | “顺便说一下”“下面我来总结一下” |
| Closers to avoid | “总之”“综上”“综上所述”“这期播客内容丰富”；“回到嘉宾的一句话”式的收尾；放到哪一期都成立的套话（“AI 是工具，关键在人”）。 |
| No verdict on the episode | 不写“其余部分聊得较散”这类话。 |
| No "my take" section | 不加“我的看法”“最后”这类小节，正文里不用“我”插话。 |

## Examples

Section title that states the conclusion: “瓶颈从写代码转到了审代码”. Topic labels to avoid: “关于代码审查”“技术选型”.

Noting a gap neutrally: “具体出什么题、复盘时看哪些地方，他在这段采访里没有讲。”

Plain words in place of a term: 不写“她用 lint 规则约束代码库”，写“她给代码库定了很多自动检查的规矩，不合规矩的代码提交不上去”。

Opening (the principle only; don't copy the sentence patterns):

> 不好：本期嘉宾 Alex 是 OpenAI Codex 团队的负责人，此前在多家公司做过开发者工具。这期节目里，他聊了 Codex 的诞生过程、技术选型、代码审查的变化，以及对未来编程的看法。

> 好：AI 写代码越来越快，团队的交付速度却没有同步变快，问题出在哪？负责 OpenAI Codex 的 Alex 说，卡住他们的是代码审查：内部代码产出涨了几倍，人却看不过来。他们的解法是让 AI 先审一遍、人只看 AI 拿不准的部分，而这又逼着他们改了另一件事，就是工程师写需求的方式。
