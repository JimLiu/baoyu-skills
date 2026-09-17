---
name: orcarouter
description: OrcaRouter provider for baoyu-image-gen — API-key and OAuth 2.0 + PKCE login, live model catalog
---

# OrcaRouter

[OrcaRouter](https://www.orcarouter.ai) is an OpenAI-compatible AI gateway. The inference and model
catalog live at `https://api.orcarouter.ai/v1`; account authorization lives at
`https://www.orcarouter.ai`.

## Two ways to connect

Both paths produce the same thing — a normal `sk-orca-…` API key that belongs to the user, is billed to
their account, and can be revoked by them at any time.

| Choice | How | Where the credential goes |
|--------|-----|---------------------------|
| API key | `ORCAROUTER_API_KEY=sk-orca-…` in `.baoyu-skills/.env`, or `--orcarouter-key sk-orca-…` | The repo's existing `.env` store |
| Account login | `--orcarouter-login` (OAuth 2.0 + PKCE, out-of-band code) | The same `.env` store |

Neither path needs a client secret or a pre-registered redirect URI.

### API key

Create a key at <https://www.orcarouter.ai/console/token>, then either export it or save it:

```bash
# Save into the project store (<cwd>/.baoyu-skills/.env) or the user store (~/.baoyu-skills/.env)
{bun} {baseDir}/scripts/main.ts --orcarouter-key sk-orca-...

# Or just export it for one command
ORCAROUTER_API_KEY=sk-orca-... {bun} {baseDir}/scripts/main.ts --provider orcarouter --prompt "A cat" --image cat.png
```

The value is masked (`sk-***abcd`) everywhere it is echoed. It never appears in a URL, log line, error
message, telemetry event, or test fixture.

### Account login (OAuth 2.0 + PKCE)

```bash
{bun} {baseDir}/scripts/main.ts --orcarouter-login
```

This prints an authorization URL and waits. Open it on any device, approve, and paste the code shown on
the consent screen back into the terminal:

```bash
# Non-interactive equivalent, if you already have the code from the consent screen
{bun} {baseDir}/scripts/main.ts --orcarouter-login-code <code>
```

OrcaRouter can also show the code on the consent screen even when a callback URL was given, so this
client always sends `S256` — never `plain`. The verifier is generated fresh from a cryptographic RNG for
every attempt, never leaves the process, and is never logged or placed in a URL. The returned `scope` is
read back and must satisfy the `api` grant this client asks for; a narrower grant is refused instead of
assumed.

The authorization code is single-use with a 10-minute lifetime. If it is expired, already redeemed, or
the state does not match, the login ends with an actionable message and nothing is stored.

## Credential lifetime

The PKCE flow returns a **durable API key, not a refresh token**. There is no refresh grant and this
client never attempts one.

- The stored key is reused until OrcaRouter revokes it. There is a cap of 10 PKCE-issued keys per user
  per 24 hours, so the client must not re-authorize on every run.
- A `401` from the relay is terminal for that credential: the exact account and credential *generation*
  that made the rejected request is marked `needsReauth` and stays unusable until a new login succeeds.
  The stored secret is **not** deleted, so a misclassified failure cannot destroy a working account.
- A late failure from an older generation can never mark a newly reauthorized credential as broken.
- Revoke access any time at <https://www.orcarouter.ai/console/authorized-apps>; that deletes every key
  issued to this app at once.

## Origins

| Purpose | Default | Override |
|---------|---------|----------|
| Auth + code exchange | `https://www.orcarouter.ai` (`/auth`, `/api/v1/auth/keys`) | `ORCA_AUTH_BASE_URL` |
| Inference + model catalog | `https://api.orcarouter.ai/v1` | `ORCA_API_BASE_URL` |
| One-origin self-hosted deployment | — | `ORCA_BASE_URL` (used for both) |

`ORCA_AUTH_BASE_URL` / `ORCA_API_BASE_URL` win over `ORCA_BASE_URL`. The auth origin is **never** derived
from the inference origin by replacing a hostname or appending `/v1`: the auth endpoints live at
`/api/v1/auth/keys` on the auth host, and `https://api.orcarouter.ai/v1/auth/keys` is a 404. Non-loopback
origins must use HTTPS; plain HTTP is accepted only for `localhost`, `127.0.0.1`, and `[::1]`.

## Model discovery

The model list is always discovered, never hand-written:

```bash
{bun} {baseDir}/scripts/main.ts --list-models
{bun} {baseDir}/scripts/main.ts --list-models --json
```

`GET {api_base}/models?capability=image`, sent with the user's credential, is the single source of truth
for the model control. Requests are bounded (8 s timeout, 512 KiB response cap, 400 item cap) and each
record is shape-validated; unknown endpoint types fail closed.

Image capability is decided from catalog metadata, never from the model name:

- an `image-generation` endpoint type routes to `/images/generations`; or
- an `image` output modality (Gemini image models) routes to `/chat/completions` with
  `modalities: ["image", "text"]`.

If live discovery succeeds it is authoritative. If it fails or returns nothing usable, the provider falls
back to the last known-good catalog, then to a small verified seed, and the run is labelled degraded:

```
OrcaRouter image models (catalog: seed, degraded: live catalog returned no image-capable models)
```

A model that is not in the live catalog is refused rather than sent, so a stale `--model` value cannot
silently hit a route the credential cannot speak.

> **Credential scope.** OrcaRouter API keys can be scoped to a subset of models. A scoped key sees only
> its own models from `GET /v1/models`, so `?capability=image` can legitimately return nothing even
> though the public catalog lists image models. In that case the provider degrades to the verified seed
> and a generation attempt is answered by the relay with `model_access_denied` — grant the key access to
> the image models in the OrcaRouter console, or use a key that has it.

## Usage

```bash
# Default Gemini image model
{bun} {baseDir}/scripts/main.ts --provider orcarouter --prompt "A cat" --image cat.png

# Explicit model from the discovered catalog
{bun} {baseDir}/scripts/main.ts --provider orcarouter --model google/gemini-3.1-flash-image-preview \
  --prompt "A cat" --image cat.png --ar 16:9

# Reference images (Gemini image models route through chat/completions)
{bun} {baseDir}/scripts/main.ts --provider orcarouter --prompt "Make it blue" --image out.png \
  --ref source.png

# Pin OrcaRouter as the default provider in EXTEND.md
# default_provider: orcarouter
# default_model:
#   orcarouter: google/gemini-3.1-flash-image-preview
```

`image-generation`-endpoint models (`openai/gpt-image-1*`) are text-to-image only in this skill: the
endpoint does not accept reference images, aspect ratios, or image sizes, so those flags are refused with
a fix hint instead of being dropped silently.
