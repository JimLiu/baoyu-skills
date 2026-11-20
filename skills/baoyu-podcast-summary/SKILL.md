---
name: baoyu-podcast-summary
description: Summarizes podcasts, interviews, panels, and other conversation transcripts into an objective, reader-first summary written in the user's preferred language. Leads with the few takeaways worth keeping, retells them faithfully with clear speaker attribution, and adds no opinions of its own. Accepts a pasted transcript, a transcript file, or a YouTube URL (transcript fetched through baoyu-youtube-transcript), infers unnamed speakers from context, and uses web search to verify names and supply background. Use when the user provides a transcript or a podcast/interview link and asks to "summarize this podcast", "podcast summary", "interview summary", "key takeaways", "总结播客", "播客总结", "访谈总结", "总结一下这期播客", "总结这个访谈", or shares a YouTube interview and wants a written summary rather than the raw transcript.
version: 2.5.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-podcast-summary
---

# Podcast Summary

Turns a conversation (podcast, interview, panel, fireside chat, meeting recording) into a summary that saves the reader the listening time and reads clearly. A solo talk works too; skip the host/guest handling.

The reader is here because they don't have an hour for the episode. They want to know one thing: what in this episode is worth taking away? So the summary is not a shortened episode. It doesn't have to cover every topic or keep the original order. It picks the two or three most valuable things, starts from a question the reader cares about, explains those things properly, and says little or nothing about the rest.

The usual way this goes wrong is the running log: open with the guest's bio, then summarize chapter after chapter at about equal length. All the information is there, but the reader has to read every line to find the one that matters. The filtering has been handed back to them.

## Preferences (EXTEND.md)

First one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-podcast-summary/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-podcast-summary/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-podcast-summary/EXTEND.md` | User home |

None found → use defaults. There is no first-time setup; never block on preferences.

| Key | Values | Default |
|-----|--------|---------|
| `language` | Language name or code (`zh-CN`, `en`, `ja`, …) | Resolved per **Output Language** |
| `audience` | Free text describing the reader | Curious outsider to the field (see **Reader**) |
| `writing_style` | Path to a style guide, a skill name, or `none` | Auto-detect (see **Writing Style**) |
| Other | Free-form notes: preferred terms, things to always or never do | — |

## Output Language

Write the summary in the language the user prefers, whatever language the conversation was in. Resolve in order:

1. A language named in the request ("summarize in English", "用中文总结").
2. `language` in EXTEND.md.
3. The language the user is writing to you in.
4. No signal in the request (a bare link or file) → the language of the user's earlier messages; failing that, the transcript's language.

Summarize from the original transcript and write directly in the output language; don't translate the transcript first. Keep the names of people, companies, and products in the form readers of that language actually use, which often means the original spelling. Don't coin a translation for a name that has no established one.

Chinese output → read [references/output-zh.md](references/output-zh.md) before writing. It holds the Chinese forms of the wording rules and length targets below.

## Writing Style (optional)

The voice of the summary can follow the user's own style guide if they have one. Many users don't, and the skill works without it. Resolve in order:

1. The user supplies one in this request: a file, a skill, pasted rules, or a sample to match.
2. `writing_style` in EXTEND.md: a file path or skill name to load, or `none` to skip the lookup.
3. A writing-style skill is available in the current runtime (one named `writing-style`, or any skill described as the user's writing voice or house style) → load it, including any glossary it ships.
4. None of these → write by this skill's own rules. Don't ask for a style guide and don't mention that there isn't one.

A style guide governs language: wording, tone, terminology, regional usage, how unfamiliar names are introduced. This skill governs selection, structure, format, and objectivity, and wins where the two conflict. A guide that allows bullet lists, or that writes in the first person with the author's opinions, doesn't change the rules here. The whole summary is retelling, so a guide's rules about relaying someone's words without embellishment apply to all of it, the opening included.

## Input

| Input | Getting the transcript |
|-------|------------------------|
| Pasted transcript, or a transcript file (`.txt`, `.md`, `.srt`, `.vtt`, …) | Read all of it. Read a long file in slices to the end; never summarize from a partial read. |
| YouTube URL or video ID | Fetch it with the `baoyu-youtube-transcript` skill (below). |
| Other URL (episode page, article carrying a transcript) | Fetch with whatever URL-reading tool the runtime has. If the page has no transcript, say so and ask for one; show notes alone are not enough to summarize. |
| Audio or video file | Transcribe if the runtime has a transcription tool; otherwise ask for a transcript. |

**YouTube**: load the `baoyu-youtube-transcript` skill and follow its instructions. Don't scrape the page yourself or write from what you remember about the video.

- Get the transcript in the language actually spoken, preferring a manually created track over an auto-generated one. Don't use its translate option: the summary is written straight from the original.
- Request chapters and speaker identification, and run that skill's speaker-labelling pass. If the pass can't run in this runtime, take the unlabelled transcript and identify speakers yourself in step 2.
- The saved transcript file is the transcript. Its metadata (title, channel, description, chapters, date) is evidence for who is speaking and when the conversation took place.
- Skill not installed → use another transcript tool if the runtime has one; otherwise ask the user to paste the transcript.

Alongside the transcript the user may give:

- **Extra material**: a tweet thread, an article link, their notes. These are good clues to what readers care about, but the transcript stays the authority: a view found in the extra material and not in the transcript is not something the guest said. Exception: biographical facts from the show notes, the episode description, or the guest's own page may be used to introduce the guest.
- **Their own take**: thoughts after listening, points they want stressed, even two or three sentences. Use it to choose the highlights and the angle of the opening. The user's opinions don't go into the text as commentary unless they explicitly ask.
- **Instructions**: an angle, a theme, a target reader. A focus the user names is the highlight. Open with it and make it the longest, most complete section (keep the chain of reasoning, the cases and details, representative quotes), and compress everything else to fit.

## Objective Retelling

The summary reports what the guests and hosts said. It carries none of the summarizer's own views, reflections, advice, or experiences: no "my take" section, no first-person asides.

Its value lies in what it selects and how it explains: choosing the two or three things most worth keeping, entering from a question the reader cares about, supplying the background the reader lacks. So a summary has two parts:

- **Opening**: within a few sentences the reader knows what this episode said and how it concerns them.
- **Body**: faithful retelling built around the highlights. The reader can always tell which words are the guest's and which are the host's.

Where the conversation leaves out something the reader will naturally ask (how exactly it's done, where a number comes from), say so neutrally at that spot, e.g. "He didn't say in this interview which questions he sets or what he looks for in the review." State only that it wasn't covered. Don't fill the gap on the guest's behalf, and don't use it as an opening for comment.

Every opening has to come out of this one episode and be impossible to write about another. When several summaries open from the same mould, readers spot the formula quickly.

## Reader

Default: a curious, educated outsider to the episode's field. They follow it from the outside (read the news, use the mainstream products, know the big names) but have never worked in it and don't speak its jargon. For a tech podcast that is an enthusiast who uses ChatGPT but has never written code; for an investing podcast, someone who reads market news but has never sat on a trading desk. `audience` in EXTEND.md or the user's request overrides this.

This reader is smart and simply hasn't studied the field. Don't talk down to them and don't start everything from zero; just don't let jargon stop them. The choice of reader drives three things below: what counts as a highlight, how terms are handled, and how far each idea is unpacked.

## Before Writing

Work through these steps before drafting. None of this working appears in the output.

1. **Read the whole transcript.** Note the episode's date if you can find it; "last month" in the conversation needs an anchor.

2. **Work out who is speaking.** Use the transcript's speaker labels and names when it has them. When it doesn't (auto-captions, a wall of text, `Speaker 1` / `Speaker 2`), infer both the names and who said what:
   - **Names** come from the episode title, show or channel name, description, show notes, and chapter titles; from the host's introduction ("my guest today is…"), self-introductions, and how the speakers address each other. Machine transcripts garble names, so confirm identity and spelling in step 3.
   - **Turns** come from who asks and who answers, who welcomes and who thanks, and first-person references that fit only one person's history ("when we shipped X", "at my last company"). With generic labels, map each label to a person and check that the mapping holds to the end; diarization sometimes swaps labels midway.
   - **Use a name only when two signals agree** (metadata plus the conversation, or the conversation plus a search result). A name you only heard and couldn't confirm → refer to the person by role ("the host", "the second guest") instead of printing a guess.
   - **A line you can't pin on one speaker** is attributed only as far as you're sure ("one of the guests said"), or left out if the point depends on who said it. Never hand it to whoever seems likeliest.

3. **Research online: verify and supplement.** When the runtime can search or fetch the web, do it before writing; don't skip this. What you remember may be out of date (companies get acquired or renamed, people change jobs, products move a generation on) and podcasts tend to discuss the last few months. Background written from memory reads smoothly, and nobody can see when it's wrong, which is exactly why it has to be checked. Look up:
   - The guests and hosts: where they are now, what they do, and the work or experience that bears on this episode's topic.
   - The episode itself: its official page or show notes, for guest names, date, and links.
   - Companies, products, projects, and events that will appear in the summary, above all ones you don't recognize, recent ones, and ones the transcript describes in a way that surprises you ("company A is now company B").
   - Names whose spelling you aren't sure of.
   - Background the speakers took for granted and the reader needs to follow a highlight: what the product is, what happened in the event they allude to.

   About five searches is usually enough. The aim is correct background, not a research project. What you find is used to introduce people and supply background, in neutral narration and never in a speaker's mouth; what the guest said comes from the transcript alone. If a source contradicts the transcript, keep the transcript's account and note the difference in one sentence if it matters. With no web access, or nothing found, write only what the transcript supports. Don't fill in from a name, a tone of voice, or an impression.

4. **Pick the highlights.** This is the step everything else depends on. Ask: if you could tell a friend only two or three things from this episode, which would they be?

   Highlights are usually a new or counterintuitive judgment, inside detail only someone who was there could give, a practice the reader can put to use, and the strong cases and numbers that back these up. Common knowledge, pleasantries, vague outlooks, and views already worn out elsewhere don't count, however long they ran. Airtime in the episode has nothing to do with whether something is worth writing.

   Choose from the target reader's seat, not an insider's. For an interview with an AI lab researcher, a practitioner may care most about business models and regulatory maneuvering; an enthusiast wants to know how capable AI really is now, what the next few years hold, and what it means for their work and choices. Material only insiders care about goes late or into the closing few sentences, however good it is.

   Two or three highlights is normal; four is the ceiling. If you can't choose and every topic looks equally important, you haven't understood the episode yet. Read it again.

5. **Work out why the reader would care.** For each highlight, find the reader's question it answers. What were they curious about, torn over, or taking for granted? The reader assumed A and the guest's own experience shows B; or the reader is stuck on something and the guest happens to offer a way through. That connection is the way into the opening and the lead-in for each section.

6. **Understand who each side is.** The reader probably doesn't know the guest. The question isn't "what is on their résumé" but **which experience gives them a view on this topic that others lack**. On AI coding, someone who wrote compilers for twenty years and someone who just built a million-user product with AI are credible for different reasons. Evidence: the transcript's introductions, the guest's own account, offhand details ("back when we were building X"), plus what step 3 turned up.

   With several guests, sort out how their vantage points differ (practitioner, researcher, investor; complementary or opposed).

   Understand the host as well. Many hosts carry weight in the field themselves, and who they are decides what kind of conversation this is: peers comparing notes, an outsider asking an expert, or a skeptic pressing. If the host makes something comparable to the guest's own work, "I borrowed that method from you" means something. If the host is an investor or speaks for a position, their questions come from there. Give this one sentence so the reader can follow the exchange. A host who only moderates and has no stake in the topic needs no introduction.

   This is material held in reserve. Use a sentence of it where a claim needs weight or the reader needs to know who is asking and who is answering.

7. **Note what the conversation left out.** Questions a reader will naturally ask after a point and the conversation never answers (how exactly, by what standard, from what data). Mention each neutrally where it comes up, per **Objective Retelling**. If there are none, write nothing.

8. **Triage the rest.** Material that supports a highlight (argument, case, background) goes into that highlight's section. Material unrelated to the highlights that a reader may still want goes into a few sentences at the end. Everything else is dropped. The test: if this were cut, what would the reader lose? If you can't say, cut it.

9. **Mark where the reader will get stuck.** Only in what you plan to write. Host and guest are insiders and pass over companies, events, analogies, and terms in a phrase. For each one ask whether the target reader would know what is meant. If not, handle it per **Readable for outsiders**.

## Writing

### Structure

Opening, then body. When the last section is done, stop; there is no separate conclusion. Introductions of the people go in the opening or wherever in the body they fit. This is an order and not a template: how each part is written, how long it runs, and whether it needs titles all depend on the episode.

### Opening

The reader decides within a few sentences whether to go on. The opening has to be down to earth and worth continuing, and it has to show quickly what the episode said and how it concerns the reader. Put the most valuable thing first. A reader who stops after the opening should still leave with the core.

How to enter depends on the best material this episode offers. There is no fixed ranking:

- A concrete scene or story from the episode that carries the core point. Telling it straight is often the strongest way in.
- A judgment from the guest that runs against what most people think. Set the common belief beside it.
- A question the reader is torn over or curious about, which this episode answers.
- A surprising number or fact.

"How it concerns the reader" has to land in the reader's own life and work: what the products they use will turn into, whether what they're working hard to learn will still be worth it, whether they should do something. Be specific; "this matters to everyone" says nothing. If the episode has no direct bearing on an ordinary reader, say plainly what it covered and why that is worth knowing, and don't force a connection.

Keep it light: two or three short paragraphs, about 200 English words in total (scale for other languages). If it won't fit, too many points are being packed in. Keep the most important one and its one or two closest supports, and leave the rest to the body. The points have to connect (because, so, but) instead of piling up as unrelated items. Avoid terms that need explaining.

An illustration (the principle only; don't copy the sentence patterns):

> Weak: This episode's guest, Alex, leads the Codex team at OpenAI and previously built developer tools at several companies. In the episode he talks about how Codex came about, its technical choices, changes to code review, and his view of the future of programming.

> Strong: AI writes code faster and faster, yet teams aren't shipping faster to match. Where is the hold-up? Alex, who runs OpenAI's Codex, says what stalled them was code review: the code produced inside the company multiplied several times over, and people couldn't keep up with reading it. Their fix was to have AI review everything first and leave humans only the parts the AI is unsure about. That in turn forced a second change, to the way engineers write requirements.

After the first, the reader knows only that an episode exists. After the second, the reader already has the conclusion and knows what is worth reading on for.

Two limits. Don't tease: once a question is raised or a story told, the answer follows within two or three sentences. Don't inflate: report the guest's claim at the strength they gave it. Don't open with "In this episode…" or "This episode features…".

**No formula.** The example above, summaries you wrote before, and samples the user gives all show the principle; none is a sentence template. Test the finished opening: swap out the guest's name and the product names, and could the paragraph run unchanged on another episode? If so it is formula and used nothing particular to this episode. Rewrite it. If earlier summaries are visible in the conversation, enter differently and use different sentence patterns this time.

### Introducing the people

Who the guest and host are, why they are worth hearing, and what kind of conversation this is must be made clear. Where and how is not fixed: a phrase in the opening, a short paragraph after it, or a clause the first time each appears. Never a résumé.

Don't introduce them with the same stock line every time ("by the way…"), and don't add a transition like "here is my summary" by default. Section titles and "he said" already tell the reader that what follows is retelling. Add a transition only where the text really does read abruptly without one.

### Body

Take the highlights one at a time, one section each, ordered by value with the most important first and no regard for the order in the conversation. Merge what was said about one topic at different points in the episode.

Each section explains its highlight fully: the guest's conclusion, what it rests on (argument, first-hand experience, cases, numbers), and whatever practice the reader can take away. Length follows value. The top section may run four or five paragraphs and a lesser one two. Sections need not match in length.

Give each section a **bold title** on its own line (not a Markdown `##` heading). The title states the section's conclusion, so a reader who only scans titles still gets something: "The bottleneck moved from writing code to reviewing it", and not a topic label such as "On code review" or "Technical choices". Very short content (a single highlight) needs no titles.

Inside a section write ordinary paragraphs with a blank line between them. No lists.

The body is retelling with no evaluation mixed in. Relevance to the reader comes from the choice of material and the angle of entry. It does not come from drawing conclusions for the guest or adding the summarizer's own confirmation or experience.

### Readable for outsiders

Specialist podcasts are dense with terms. Carried over as they are, they stop the reader at every sentence; glossed one by one in parentheses, they break the text into fragments. For each term and proper noun, first ask whether the reader needs it to grasp the point, then choose one of three treatments:

- **Not needed → leave it out.** Most tools, frameworks, commands, and technical details a guest mentions in passing fall here. What the reader should keep is "she gave the agent a checking tool that opens the program by itself and clicks through it the way a user would". Which library the tool calls underneath only gets in the way.
- **Say what it means in plain words, without the term.** Not "she constrains the codebase with lint rules" but "she set a lot of automatic checks on the codebase, and code that breaks them can't be submitted".
- **Needed → keep it and explain it on first use.** Core concepts there is no way around, words the reader will keep meeting, words the whole summary turns on. Explain in one sentence the reader can picture: what it is and why it matters here. Don't explain a term with another term.

More than two or three new words needing explanation in one paragraph means the writing is too close to the original wording. Step back, say what the thing is and why it matters, then decide which details earn a place.

The guest's own analogies are usually the best explanation available, because that is the guest explaining to an outsider. Use a good one in the body to carry the point it belongs to. Don't park it at the end as a curiosity.

Companies, products, people, and events get the same treatment. Unfamiliar and unimportant → replace with a generic description. Important → say in one sentence what it is the first time it appears, using what step 3 verified.

Background has a limit: enough for the reader to follow this point. One sentence for a company name. Several paragraphs for a story that needs them and really is part of a highlight. Don't let it grow into an explainer. A passage that works for listeners in one breath works because they already have the background; at the same density the reader won't follow.

### Guests and hosts

- **Mention credentials where they are used.** When a judgment comes from first-hand experience, name the source in passing ("in the first two weeks after the internal launch", "on the team he runs"). That gives the sentence more weight than a title does. Keep only the item that bears on the current claim. Don't list a career, and don't reintroduce the guest every paragraph.
- **Keep the host's words separate.** A challenge the host raised, a figure the host supplied, an analogy the host drew: say it was the host. Don't fold it into the guest's views. A host's own substantial view or practice can go in when it bears on a highlight.
- **Keep the speaker's voice.** Give important views in indirect speech with neutral reporting verbs ("he said", "she thinks", "in his view"), and avoid verbs that add an attitude for the speaker ("admitted", "confessed", "bluntly said"). Quote directly only a short line that loses its flavor in paraphrase (about a dozen words), in quotation marks. When the transcript is in another language, the quote is a faithful translation.

### Ending

When the last section is done, stop. No views, reflections, or advice from the summarizer, no recap paragraph, no "My take" or "Finally" section. Don't close with "In short" or "Overall", and don't circle back to a line from the guest.

Use ordinary words throughout. Write "she worked these skills out from her own job", not "these skills grew out of her own job"; "skills refined through iteration", not "skills forged through iteration". The test: is this the word people most often use for this thing? If not, switch to the one that is.

Material unrelated to the highlights that a reader may still want gets three or four sentences at the very end, with no title and no verdict on the episode ("the rest wandered"). If you want more than three or four sentences, filter again. If there is nothing, write nothing.

### Avoid

- Following the episode's order and chapters, or trying to cover every topic.
- Opening with a guest introduction, or writing the introduction as a résumé.
- Writing background on people, companies, or products from memory when it can be looked up.
- Carrying over every tool name, framework name, and technical detail the guest mentioned.
- Giving every topic about the same space.
- Bullet points or numbered sections in the body.
- Openings that look alike from one summary to the next: same way in, same transition.
- Forcing a link between the episode and the reader, or forcing a conclusion.
- Starting every paragraph with the guest's name.
- Empty praise ("renowned expert", "industry veteran", "deep expertise", "unique insight"). Say what the person actually did.
- "In short", "To sum up", "This episode covers a lot of ground", and the like.
- Inventing anything the transcript doesn't contain. A guest's title, education, history, and achievements above all must never be completed by inference.
- Evaluation mixed into the retelling. Connectives such as "better still" and "ironically" are evaluation too.
- The summarizer's views, reflections, advice, or experiences, or a "my take" section.
- Figurative verbs chosen for a conversational feel, where the ordinary one says the same thing.
- A closing paragraph that restates the body, or a line that would fit any episode ("AI is a tool; what matters is the person using it").
- Clickbait, teasing, or overstating what the guest said in order to pull readers in.

## Output

Output the summary directly in the conversation. Create a file only when the user asks; for a transcript fetched from YouTube, `summary.md` beside the saved transcript is the natural place.

Plain text: bold section titles and nothing else from Markdown, unless the user asks for another format.

Length follows the weight of the highlights and not the running time. A one-hour episode usually comes to 600–1,500 English words (scale for other languages). If the same content can be shorter, make it shorter; every extra paragraph should give the reader something. Explaining a thing clearly to an outsider takes more words, and those words are paid for by the specialist detail that was cut.

After the summary, add one separate line for the user if anything was inferred and not confirmed: a name's spelling, which guest said a particular thing, a fact that could not be checked. Leave the line out when there is nothing to report.

## Self-Check

- Does it read clearly and smoothly, or like a machine digest?
- Swap out the guest and product names: could the opening run unchanged on another episode? If so, rewrite. Is the way in, or the transition, the same as in earlier summaries?
- Is there a forced connection in the opening? Any view, advice, or recap paragraph from the summarizer at the end? Remove it.
- Does the summarizer's opinion, experience, or stance appear anywhere, or a first-person aside? Remove it.
- Has evaluation slipped into the retelling? Can the reader tell the guest's words from the host's?
- Is every name printed backed by two signals, and every attributed line pinned to the right speaker? Was anything assigned to "whoever seemed likeliest"?
- Where the conversation left a gap, was it noted neutrally, or filled in for the guest?
- Search the text for figurative verbs and adjectives. For each: does the plainest wording change the meaning? If not, use the plainest.
- Read it from the top as the target reader. Is there a sentence where you would have to stop and look something up? A paragraph you couldn't restate after reading?
- Are the highlights what this reader most wants to know, or what an insider would?
- From the opening alone, can the reader name the two or three things most worth keeping? Is the opening within its length and free of terms that need explaining?
- From the opening alone, does the reader know how the episode concerns them? Or does it open with who the guest is and what was discussed?
- Do the opening's points read as a connected paragraph, or as a list in disguise?
- Are sections ordered by value, or has the episode's own order crept back?
- For each section: what would the reader lose if it were cut? If nothing, cut it or fold it into the closing sentences.
- Is the most important highlight the most fully written part? If the user named a focus, is it the way in and the longest section?
- Scanning only the bold titles, can you read off each section's conclusion?
- Would a reader who has never heard of the guest know, at each key claim, why to believe them? If the host's identity helps in following the conversation, was it given?
- Is every piece of background on a person, company, or product either in the transcript or verified by this run's searches? Was anything written from impression?
- Was anything the transcript doesn't say added as a "reasonable inference"? Was any claim made fuller than the guest made it?
- Is every remaining term, company, name, and event necessary, and explained on first use? Could any be dropped or put in plain words?
- Can each story be restated as "because…, so…"?
- Is the closing run of minor points within three or four sentences, with no title?
- Is the whole summary in the resolved output language, with names in the form its readers use?
- If a style guide was loaded and has a checklist or banned-word list, was the text run against it?

## Extension Support

Custom configuration via EXTEND.md. See **Preferences (EXTEND.md)** for paths and supported keys.
