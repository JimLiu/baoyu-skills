import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { sleep } from 'baoyu-chrome-cdp';

// ---------- cross-invocation profile lock ----------
//
// The Chrome profile used for gemini.google.com is single-instance: two
// processes driving it concurrently will each discover (or spawn) the same
// browser, and the first one's cleanup kills it out from under the second.
// Every profile user — gemini-webui.ts invocations, main.ts cookie refresh,
// anything that spawns or attaches to this Chrome — must serialize here, so
// the lock is keyed by the canonical profile directory (not by a data dir or
// caller-specific path) and lives in the shared OS temp dir.

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readHolderPid(file: string): number | null {
  try {
    const pid = Number(fs.readFileSync(file, 'utf8').trim());
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

export function profileInvokeLockFile(profileDir: string): string {
  // Canonical path so symlinks and trailing-slash spellings of the same
  // profile map to one lock; an unresolvable path (profile not created yet)
  // falls back to the absolute spelling.
  let canonical = path.resolve(profileDir);
  try {
    canonical = fs.realpathSync(profileDir);
  } catch {}
  const digest = createHash('sha256').update(canonical, 'utf8').digest('hex').slice(0, 24);
  return path.join(os.tmpdir(), 'baoyu-gemini-web-locks', `profile-${digest}.lock`);
}

// Serialize invocations on one Chrome profile. Invocations queue on a lock
// file; a crashed run leaves a stale pid that the next run detects and
// breaks.
//
// Stale takeover is rename-based: with a plain read-then-rmSync, two waiters
// can both see the dead pid and both unlink — the second delete then removes
// the FIRST waiter's freshly created lock and both enter the browser section.
// renameSync moves the stale file atomically, so exactly one waiter wins the
// takeover; the losers re-loop and find the winner's live pid. The winner
// re-reads the pid inside the renamed file to confirm it moved the stale lock
// it read, not a fresh one that appeared in between.
async function acquireInvokeLock(file: string, timeoutMs: number): Promise<void> {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    let fd: number | undefined;
    try {
      fd = fs.openSync(file, 'wx', 0o600);
      fs.writeFileSync(fd, String(process.pid));
      fs.closeSync(fd);
      return;
    } catch {
      if (fd !== undefined) {
        try {
          fs.closeSync(fd);
        } catch {}
      }
      const stalePid = readHolderPid(file);
      if (stalePid !== null && !processExists(stalePid)) {
        const trash = `${file}.${process.pid}.${stalePid}.stale`;
        try {
          fs.renameSync(file, trash);
        } catch {
          continue; // holder just released, or another waiter already took it
        }
        if (readHolderPid(trash) === stalePid) {
          try {
            fs.rmSync(trash, { force: true });
          } catch {}
          continue; // recreate on the next iteration
        }
        // The file we moved holds a different (live) pid — a fresh lock that
        // appeared between our read and our rename. Put it back so its owner
        // stays protected; if that fails, drop it and queue behind whoever
        // holds the lock now.
        try {
          fs.renameSync(trash, file);
        } catch {
          try {
            fs.rmSync(trash, { force: true });
          } catch {}
        }
      }
      if (Date.now() > deadline) {
        throw new Error(
          `Another gemini-webui invocation is holding ${file}. Wait for it to finish, or remove the stale lock file.`,
        );
      }
      await sleep(250);
    }
  }
}

// Acquire the profile-keyed lock and return a release function that only
// removes the lock if we still own it (a lock we were renamed out of must
// not clobber whoever legitimately acquired after us).
export async function acquireProfileInvokeLock(
  profileDir: string,
  timeoutMs: number,
): Promise<() => void> {
  const file = profileInvokeLockFile(profileDir);
  await acquireInvokeLock(file, timeoutMs);
  return () => {
    try {
      if (readHolderPid(file) === process.pid) {
        fs.rmSync(file, { force: true });
      }
    } catch {}
  };
}
