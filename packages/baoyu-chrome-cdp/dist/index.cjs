var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// src/index.ts
var exports_src = {};
__export(exports_src, {
  waitForChromeDebugPort: () => waitForChromeDebugPort,
  sleep: () => sleep,
  resolveSharedChromeProfileDir: () => resolveSharedChromeProfileDir,
  openPageSession: () => openPageSession,
  launchChrome: () => launchChrome,
  killChrome: () => killChrome,
  gracefulKillChrome: () => gracefulKillChrome,
  getFreePort: () => getFreePort,
  getDefaultChromeUserDataDirs: () => getDefaultChromeUserDataDirs,
  findExistingChromeDebugPort: () => findExistingChromeDebugPort,
  findChromeExecutable: () => findChromeExecutable,
  discoverRunningChromeDebugPort: () => discoverRunningChromeDebugPort,
  CdpConnection: () => CdpConnection
});
module.exports = __toCommonJS(exports_src);
var import_node_child_process = require("node:child_process");
var import_node_fs = __toESM(require("node:fs"));
var import_node_net = __toESM(require("node:net"));
var import_node_os = __toESM(require("node:os"));
var import_node_path = __toESM(require("node:path"));
var import_node_process = __toESM(require("node:process"));
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getFreePort(fixedEnvName) {
  const fixed = fixedEnvName ? Number.parseInt(import_node_process.default.env[fixedEnvName] ?? "", 10) : NaN;
  if (Number.isInteger(fixed) && fixed > 0)
    return fixed;
  return await new Promise((resolve, reject) => {
    const server = import_node_net.default.createServer();
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
    const override = import_node_process.default.env[envName]?.trim();
    if (override && import_node_fs.default.existsSync(override))
      return override;
  }
  const candidates = import_node_process.default.platform === "darwin" ? options.candidates.darwin ?? options.candidates.default : import_node_process.default.platform === "win32" ? options.candidates.win32 ?? options.candidates.default : options.candidates.default;
  for (const candidate of candidates) {
    if (import_node_fs.default.existsSync(candidate))
      return candidate;
  }
  return;
}
function resolveSharedChromeProfileDir(options = {}) {
  for (const envName of options.envNames ?? []) {
    const override = import_node_process.default.env[envName]?.trim();
    if (override)
      return import_node_path.default.resolve(override);
  }
  const appDataDirName = options.appDataDirName ?? "baoyu-skills";
  const profileDirName = options.profileDirName ?? "chrome-profile";
  if (options.wslWindowsHome) {
    return import_node_path.default.join(options.wslWindowsHome, ".local", "share", appDataDirName, profileDirName);
  }
  const base = import_node_process.default.platform === "darwin" ? import_node_path.default.join(import_node_os.default.homedir(), "Library", "Application Support") : import_node_process.default.platform === "win32" ? import_node_process.default.env.APPDATA ?? import_node_path.default.join(import_node_os.default.homedir(), "AppData", "Roaming") : import_node_process.default.env.XDG_DATA_HOME ?? import_node_path.default.join(import_node_os.default.homedir(), ".local", "share");
  return import_node_path.default.join(base, appDataDirName, profileDirName);
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
    const socket = new import_node_net.default.Socket;
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
    const content = import_node_fs.default.readFileSync(filePath, "utf-8");
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
  const parsed = parseDevToolsActivePort(import_node_path.default.join(options.profileDir, "DevToolsActivePort"));
  if (parsed && parsed.port > 0 && await isDebugPortReady(parsed.port, timeoutMs))
    return parsed.port;
  if (import_node_process.default.platform === "win32")
    return null;
  try {
    const result = import_node_child_process.spawnSync("ps", ["aux"], { encoding: "utf-8", timeout: 5000 });
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
  const home = import_node_os.default.homedir();
  const dirs = [];
  const channelDirs = {
    stable: {
      darwin: import_node_path.default.join(home, "Library", "Application Support", "Google", "Chrome"),
      linux: import_node_path.default.join(home, ".config", "google-chrome"),
      win32: import_node_path.default.join(import_node_process.default.env.LOCALAPPDATA ?? import_node_path.default.join(home, "AppData", "Local"), "Google", "Chrome", "User Data")
    },
    beta: {
      darwin: import_node_path.default.join(home, "Library", "Application Support", "Google", "Chrome Beta"),
      linux: import_node_path.default.join(home, ".config", "google-chrome-beta"),
      win32: import_node_path.default.join(import_node_process.default.env.LOCALAPPDATA ?? import_node_path.default.join(home, "AppData", "Local"), "Google", "Chrome Beta", "User Data")
    },
    canary: {
      darwin: import_node_path.default.join(home, "Library", "Application Support", "Google", "Chrome Canary"),
      linux: import_node_path.default.join(home, ".config", "google-chrome-canary"),
      win32: import_node_path.default.join(import_node_process.default.env.LOCALAPPDATA ?? import_node_path.default.join(home, "AppData", "Local"), "Google", "Chrome SxS", "User Data")
    },
    dev: {
      darwin: import_node_path.default.join(home, "Library", "Application Support", "Google", "Chrome Dev"),
      linux: import_node_path.default.join(home, ".config", "google-chrome-dev"),
      win32: import_node_path.default.join(import_node_process.default.env.LOCALAPPDATA ?? import_node_path.default.join(home, "AppData", "Local"), "Google", "Chrome Dev", "User Data")
    }
  };
  const platform = import_node_process.default.platform === "darwin" ? "darwin" : import_node_process.default.platform === "win32" ? "win32" : "linux";
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
  const userDataDirs = (options.userDataDirs ?? getDefaultChromeUserDataDirs(channels)).map((dir) => import_node_path.default.resolve(dir));
  for (const dir of userDataDirs) {
    const parsed = parseDevToolsActivePort(import_node_path.default.join(dir, "DevToolsActivePort"));
    if (!parsed)
      continue;
    if (await isPortListening(parsed.port, timeoutMs)) {
      return { port: parsed.port, wsUrl: `ws://127.0.0.1:${parsed.port}${parsed.wsPath}` };
    }
  }
  if (import_node_process.default.platform !== "win32") {
    try {
      const result = import_node_child_process.spawnSync("ps", ["aux"], { encoding: "utf-8", timeout: 5000 });
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
  await import_node_fs.default.promises.mkdir(options.profileDir, { recursive: true });
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
  return import_node_child_process.spawn(options.chromePath, args, { stdio: "ignore" });
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
