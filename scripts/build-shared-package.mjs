#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const packageDir = path.resolve(options.packageDir);
  const entryPath = path.resolve(packageDir, options.entry);
  const outDir = path.resolve(packageDir, options.outDir);

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const bun = resolveBunRuntime();
  runBuild(bun, {
    entryPath,
    external: options.external,
    format: "esm",
    outfile: path.join(outDir, "index.js"),
  });
  const cjsOutfile = path.join(outDir, "index.cjs");
  runBuild(bun, {
    entryPath,
    external: options.external,
    format: "cjs",
    outfile: cjsOutfile,
  });
  await scrubCommonJsSourceFileUrls(cjsOutfile, packageDir);

  for (const asset of options.assets) {
    const source = path.resolve(packageDir, asset.source);
    const target = path.resolve(outDir, asset.target);
    await fs.cp(source, target, { recursive: true });
  }
}

function parseArgs(argv) {
  const options = {
    packageDir: process.cwd(),
    entry: "src/index.ts",
    outDir: "dist",
    external: [],
    assets: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package-dir") {
      options.packageDir = readArgValue(argv, ++index, arg);
      continue;
    }
    if (arg === "--entry") {
      options.entry = readArgValue(argv, ++index, arg);
      continue;
    }
    if (arg === "--out-dir") {
      options.outDir = readArgValue(argv, ++index, arg);
      continue;
    }
    if (arg === "--external") {
      options.external.push(readArgValue(argv, ++index, arg));
      continue;
    }
    if (arg === "--asset") {
      options.assets.push(parseAssetArg(readArgValue(argv, ++index, arg)));
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function readArgValue(argv, index, flag) {
  const value = argv[index];
  if (!value) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parseAssetArg(value) {
  const [source, target = path.basename(value)] = value.split(":");
  if (!source) {
    throw new Error(`Invalid --asset value: ${value}`);
  }
  return { source, target };
}

function resolveBunRuntime() {
  if (process.versions.bun) {
    return { command: process.execPath, args: [] };
  }
  if (commandExists("bun")) {
    return { command: "bun", args: [] };
  }
  if (commandExists("npx")) {
    return { command: "npx", args: ["-y", "bun"] };
  }
  throw new Error(
    "Neither bun nor npx is installed. Install bun with `brew install oven-sh/bun/bun` or `npm install -g bun`.",
  );
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    stdio: "ignore",
  });
  return result.status === 0;
}

function runBuild(runtime, { entryPath, external, format, outfile }) {
  const args = [
    ...runtime.args,
    "build",
    entryPath,
    "--target=node",
    `--format=${format}`,
    ...external.flatMap((name) => ["--external", name]),
    "--outfile",
    outfile,
  ];
  const result = spawnSync(runtime.command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Failed to build ${format.toUpperCase()} package output`);
  }
}

async function scrubCommonJsSourceFileUrls(outfile, packageDir) {
  const packageUrl = pathToFileURL(packageDir).href;
  const packageFileUrlPattern = new RegExp(`"${escapeRegExp(packageUrl)}/[^"]+"`, "g");
  const source = await fs.readFile(outfile, "utf8");
  await fs.writeFile(outfile, source.replace(packageFileUrlPattern, "undefined"));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printUsage() {
  console.log(`Usage: build-shared-package.mjs [options]

Options:
  --package-dir <dir>  Package root (default: current directory)
  --entry <file>       Entry file relative to package root (default: src/index.ts)
  --out-dir <dir>     Output directory relative to package root (default: dist)
  --external <name>   Leave a module external (can be repeated)
  --asset <src[:dst]> Copy an asset directory/file into out-dir (can be repeated)
  -h, --help          Show help`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
