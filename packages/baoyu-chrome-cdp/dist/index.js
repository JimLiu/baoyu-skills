// src/index.ts
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getFreePort(fixedEnvName) {
  const fixed = fixedEnvName ? Number.parseInt(process.env[fixedEnvName] ?? "", 10) : NaN;
  if (Number.isInteger(fixed) && fixed > 0)
    return fixed;
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Unable to allocate a free TCP port.")));
        return;
      }
      const port = address.port;
      server.close((err) => {
        if (err)
          reject(err);
        else
          resolve(port);
      });
    });
  });
}
function findChromeExecutable(options) {
  for (const envName of options.envNames ?? []) {
    const override = process.env[envName]?.trim();
    if (override && fs.existsSync(override))
      return override;
  }
  const candidates = process.platform === "darwin" ? options.candidates.darwin ?? options.candidates.default : process.platform === "win32" ? options.candidates.win32 ?? options.candidates.default : options.candidates.default;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate))
      return candidate;
  }
  return;
}
function resolveSharedChromeProfileDir(options = {}) {
  for (const envName of options.envNames ?? []) {
    const override = process.env[envName]?.trim();
    if (override)
      return path.resolve(override);
  }
  const appDataDirName = options.appDataDirName ?? "baoyu-skills";
  const profileDirName = options.profileDirName ?? "chrome-profile";
  if (options.wslWindowsHome) {
    return path.join(options.wslWindowsHome, ".local", "share", appDataDirName, profileDirName);
  }
  const base = process.platform === "darwin" ? path.join(os.homedir(), "Library", "Application Support") : process.platform === "win32" ? process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming") : process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share");
  return path.join(base, appDataDirName, profileDirName);
}
async function fetchWithTimeout(url, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0)
    return await fetch(url, { redirect: "follow" });
  const ctl = new AbortController;
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, { redirect: "follow", signal: ctl.signal });
  } finally {
    clearTimeout(timer);
  }
}
async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, options.timeoutMs);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
async function isDebugPortReady(port, timeoutMs = 3000) {
  try {
    const version = await fetchJson(`http://127.0.0.1:${port}/json/version`, { timeoutMs });
    return !!version.webSocketDebuggerUrl;
  } catch {
    return false;
  }
}
function isPortListening(port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket;
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}
function parseDevToolsActivePort(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const port = Number.parseInt(lines[0]?.trim() ?? "", 10);
    const wsPath = lines[1]?.trim();
    if (port > 0 && wsPath)
      return { port, wsPath };
  } catch {}
  return null;
}
async function findExistingChromeDebugPort(options) {
  const timeoutMs = options.timeoutMs ?? 3000;
  const parsed = parseDevToolsActivePort(path.join(options.profileDir, "DevToolsActivePort"));
  if (parsed && parsed.port > 0 && await isDebugPortReady(parsed.port, timeoutMs))
    return parsed.port;
  if (process.platform === "win32")
    return null;
  try {
    const result = spawnSync("ps", ["aux"], { encoding: "utf-8", timeout: 5000 });
    if (result.status !== 0 || !result.stdout)
      return null;
    const lines = result.stdout.split(`
`).filter((line) => line.includes(options.profileDir) && line.includes("--remote-debugging-port="));
    for (const line of lines) {
      const portMatch = line.match(/--remote-debugging-port=(\d+)/);
      const port = Number.parseInt(portMatch?.[1] ?? "", 10);
      if (port > 0 && await isDebugPortReady(port, timeoutMs))
        return port;
    }
  } catch {}
  return null;
}
function getDefaultChromeUserDataDirs(channels = ["stable"]) {
  const home = os.homedir();
  const dirs = [];
  const channelDirs = {
    stable: {
      darwin: path.join(home, "Library", "Application Support", "Google", "Chrome"),
      linux: path.join(home, ".config", "google-chrome"),
      win32: path.join(process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local"), "Google", "Chrome", "User Data")
    },
    beta: {
      darwin: path.join(home, "Library", "Application Support", "Google", "Chrome Beta"),
      linux: path.join(home, ".config", "google-chrome-beta"),
      win32: path.join(process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local"), "Google", "Chrome Beta", "User Data")
    },
    canary: {
      darwin: path.join(home, "Library", "Application Support", "Google", "Chrome Canary"),
      linux: path.join(home, ".config", "google-chrome-canary"),
      win32: path.join(process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local"), "Google", "Chrome SxS", "User Data")
    },
    dev: {
      darwin: path.join(home, "Library", "Application Support", "Google", "Chrome Dev"),
      linux: path.join(home, ".config", "google-chrome-dev"),
      win32: path.join(process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local"), "Google", "Chrome Dev", "User Data")
    }
  };
  const platform = process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux";
  for (const ch of channels) {
    const entry = channelDirs[ch];
    if (entry)
      dirs.push(entry[platform]);
  }
  return dirs;
}
async function discoverRunningChromeDebugPort(options = {}) {
  const channels = options.channels ?? ["stable", "beta", "canary", "dev"];
  const timeoutMs = options.timeoutMs ?? 3000;
  const userDataDirs = (options.userDataDirs ?? getDefaultChromeUserDataDirs(channels)).map((dir) => path.resolve(dir));
  for (const dir of userDataDirs) {
    const parsed = parseDevToolsActivePort(path.join(dir, "DevToolsActivePort"));
    if (!parsed)
      continue;
    if (await isPortListening(parsed.port, timeoutMs)) {
      return { port: parsed.port, wsUrl: `ws://127.0.0.1:${parsed.port}${parsed.wsPath}` };
    }
  }
  if (process.platform !== "win32") {
    try {
      const result = spawnSync("ps", ["aux"], { encoding: "utf-8", timeout: 5000 });
      if (result.status === 0 && result.stdout) {
        const lines = result.stdout.split(`
`).filter((line) => line.includes("--remote-debugging-port=") && userDataDirs.some((dir) => line.includes(dir)));
        for (const line of lines) {
          const portMatch = line.match(/--remote-debugging-port=(\d+)/);
          const port = Number.parseInt(portMatch?.[1] ?? "", 10);
          if (port > 0 && await isDebugPortReady(port, timeoutMs)) {
            try {
              const version = await fetchJson(`http://127.0.0.1:${port}/json/version`, { timeoutMs });
              if (version.webSocketDebuggerUrl)
                return { port, wsUrl: version.webSocketDebuggerUrl };
            } catch {}
          }
        }
      }
    } catch {}
  }
  return null;
}
async function waitForChromeDebugPort(port, timeoutMs, options) {
  const start = Date.now();
  let lastError = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${port}/json/version`, { timeoutMs: 5000 });
      if (version.webSocketDebuggerUrl)
        return version.webSocketDebuggerUrl;
      lastError = new Error("Missing webSocketDebuggerUrl");
    } catch (error) {
      lastError = error;
    }
    await sleep(200);
  }
  if (options?.includeLastError && lastError) {
    throw new Error(`Chrome debug port not ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }
  throw new Error("Chrome debug port not ready");
}

class CdpConnection {
  ws;
  nextId = 0;
  pending = new Map;
  eventHandlers = new Map;
  defaultTimeoutMs;
  constructor(ws, defaultTimeoutMs = 15000) {
    this.ws = ws;
    this.defaultTimeoutMs = defaultTimeoutMs;
    this.ws.addEventListener("message", (event) => {
      try {
        const data = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
        const msg = JSON.parse(data);
        if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method);
          if (handlers) {
            handlers.forEach((handler) => handler(msg.params));
          }
        }
        if (msg.id) {
          const pending = this.pending.get(msg.id);
          if (pending) {
            this.pending.delete(msg.id);
            if (pending.timer)
              clearTimeout(pending.timer);
            if (msg.error?.message)
              pending.reject(new Error(msg.error.message));
            else
              pending.resolve(msg.result);
          }
        }
      } catch {}
    });
    this.ws.addEventListener("close", () => {
      for (const [id, pending] of this.pending.entries()) {
        this.pending.delete(id);
        if (pending.timer)
          clearTimeout(pending.timer);
        pending.reject(new Error("CDP connection closed."));
      }
    });
  }
  static async connect(url, timeoutMs, options) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP connection timeout.")), timeoutMs);
      ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      });
      ws.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("CDP connection failed."));
      });
    });
    return new CdpConnection(ws, options?.defaultTimeoutMs ?? 15000);
  }
  on(method, handler) {
    if (!this.eventHandlers.has(method)) {
      this.eventHandlers.set(method, new Set);
    }
    this.eventHandlers.get(method)?.add(handler);
  }
  off(method, handler) {
    this.eventHandlers.get(method)?.delete(handler);
  }
  async send(method, params, options) {
    const id = ++this.nextId;
    const message = { id, method };
    if (params)
      message.params = params;
    if (options?.sessionId)
      message.sessionId = options.sessionId;
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    const result = await new Promise((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, timeoutMs) : null;
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify(message));
    });
    return result;
  }
  close() {
    try {
      this.ws.close();
    } catch {}
  }
}
async function launchChrome(options) {
  await fs.promises.mkdir(options.profileDir, { recursive: true });
  const args = [
    `--remote-debugging-port=${options.port}`,
    `--user-data-dir=${options.profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    ...options.extraArgs ?? []
  ];
  if (options.headless)
    args.push("--headless=new");
  if (options.url)
    args.push(options.url);
  return spawn(options.chromePath, args, { stdio: "ignore" });
}
function killChrome(chrome) {
  try {
    chrome.kill("SIGTERM");
  } catch {}
  setTimeout(() => {
    if (chrome.exitCode === null && chrome.signalCode === null) {
      try {
        chrome.kill("SIGKILL");
      } catch {}
    }
  }, 2000).unref?.();
}
async function gracefulKillChrome(chrome, port, timeoutMs = 6000) {
  if (chrome.exitCode !== null || chrome.signalCode !== null)
    return;
  const exitPromise = new Promise((resolve) => {
    chrome.once("exit", () => resolve());
  });
  killChrome(chrome);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (chrome.exitCode !== null || chrome.signalCode !== null)
      return;
    if (port !== undefined && !await isPortListening(port, 250))
      return;
    const exited = await Promise.race([
      exitPromise.then(() => true),
      sleep(100).then(() => false)
    ]);
    if (exited)
      return;
  }
  await Promise.race([
    exitPromise,
    sleep(250)
  ]);
}
async function openPageSession(options) {
  let targetId;
  let createdTarget = false;
  if (options.reusing) {
    const created = await options.cdp.send("Target.createTarget", { url: options.url });
    targetId = created.targetId;
    createdTarget = true;
  } else {
    const targets = await options.cdp.send("Target.getTargets");
    const existing = targets.targetInfos.find(options.matchTarget);
    if (existing) {
      targetId = existing.targetId;
    } else {
      const created = await options.cdp.send("Target.createTarget", { url: options.url });
      targetId = created.targetId;
      createdTarget = true;
    }
  }
  const { sessionId } = await options.cdp.send("Target.attachToTarget", { targetId, flatten: true });
  if (options.activateTarget ?? true) {
    await options.cdp.send("Target.activateTarget", { targetId });
  }
  if (options.enablePage)
    await options.cdp.send("Page.enable", {}, { sessionId });
  if (options.enableRuntime)
    await options.cdp.send("Runtime.enable", {}, { sessionId });
  if (options.enableDom)
    await options.cdp.send("DOM.enable", {}, { sessionId });
  if (options.enableNetwork)
    await options.cdp.send("Network.enable", {}, { sessionId });
  return { sessionId, targetId, createdTarget };
}
export {
  waitForChromeDebugPort,
  sleep,
  resolveSharedChromeProfileDir,
  openPageSession,
  launchChrome,
  killChrome,
  gracefulKillChrome,
  getFreePort,
  getDefaultChromeUserDataDirs,
  findExistingChromeDebugPort,
  findChromeExecutable,
  discoverRunningChromeDebugPort,
  CdpConnection
};
