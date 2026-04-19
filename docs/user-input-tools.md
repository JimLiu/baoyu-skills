# User Input Tools

Skills in this repo are loaded by multiple agent runtimes (Claude Code, other agents, bare CLI). Each runtime exposes a different API for asking the user questions. This document defines the canonical **tool-selection rule** every skill follows so skills stay portable.

## Tool Selection (priority order)

1. **Prefer built-in user-input tools** if the current agent runtime exposes one — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback to plain text**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching rule**:
   - If the tool supports **multiple questions per call** (e.g., `AskUserQuestion`): **Combine all applicable questions into a single call. Do NOT split into separate calls.**
   - If the tool supports **only one question per call** (e.g., single-prompt `clarify`): ask **one question per call, in priority order**.

## How Skills Declare This

Each `SKILL.md` that uses interactive user input includes **exactly one** `## User Input Tools` section (typically near the top, right after the intro) that **inlines** this rule. Do NOT link here from a SKILL.md — skills are self-contained (see [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)). This document is the author-side canonical source; copy its body into each SKILL.md. The rule then governs every user-input interaction in that skill and its `references/` files.

Specific mentions of a concrete tool (e.g., `AskUserQuestion`) elsewhere in a skill are **concrete examples** — agents in other runtimes apply the rule above and substitute the local equivalent. Tool-specific parameters (e.g., `header:`, `multiSelect:`) are illustrative; runtimes without those knobs can omit them.
