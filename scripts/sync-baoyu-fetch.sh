#!/bin/bash
# Sync packages/baoyu-fetch/src (excluding __tests__) into
# skills/baoyu-url-to-markdown/scripts/lib/ so the vendored runtime
# never drifts from the package.
#
# Usage:
#   bash scripts/sync-baoyu-fetch.sh          # copy changes
#   bash scripts/sync-baoyu-fetch.sh --check  # exit 1 if the copies differ

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/packages/baoyu-fetch/src"
DST_DIR="$REPO_ROOT/skills/baoyu-url-to-markdown/scripts/lib"
CHECK=0
[[ "${1:-}" == "--check" ]] && CHECK=1

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: source dir missing: $SRC_DIR" >&2
  exit 1
fi

if [[ "$CHECK" -eq 1 ]]; then
  if diff -r -x __tests__ "$SRC_DIR" "$DST_DIR" >/dev/null; then
    echo "baoyu-fetch vendor: in sync"
    exit 0
  fi
  echo "Error: skills/baoyu-url-to-markdown/scripts/lib differs from packages/baoyu-fetch/src." >&2
  diff -r -q -x __tests__ "$SRC_DIR" "$DST_DIR" >&2 || true
  echo "Run: bash scripts/sync-baoyu-fetch.sh" >&2
  exit 1
fi

mkdir -p "$DST_DIR"
changed=0

while IFS= read -r -d '' src; do
  rel="${src#"$SRC_DIR"/}"
  dst="$DST_DIR/$rel"
  if [[ ! -f "$dst" ]] || ! cmp -s "$src" "$dst"; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    echo "synced: $rel"
    changed=$((changed + 1))
  fi
done < <(find "$SRC_DIR" -type f -not -path "$SRC_DIR/__tests__/*" -print0)

while IFS= read -r -d '' dst; do
  rel="${dst#"$DST_DIR"/}"
  if [[ ! -f "$SRC_DIR/$rel" ]]; then
    rm -f "$dst"
    echo "removed stale: $rel"
    changed=$((changed + 1))
  fi
done < <(find "$DST_DIR" -type f -print0)

if [[ "$changed" -eq 0 ]]; then
  echo "baoyu-fetch vendor: up to date"
else
  echo "baoyu-fetch vendor: $changed file(s) updated"
fi
