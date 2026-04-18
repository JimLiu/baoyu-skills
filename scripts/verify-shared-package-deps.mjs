#!/usr/bin/env node

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const PACKAGE_DEPENDENCY_SECTIONS = [
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
  "devDependencies",
];

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(options.repoRoot);
  const workspacePackages = await discoverWorkspacePackages(repoRoot);
  const targets = normalizeTargetConsumerDirs(repoRoot, options.targets);
  const consumers = await discoverSkillScriptPackages(repoRoot, targets);
  const errors = [];

  for (const consumer of consumers) {
    const packageJson = JSON.parse(await fs.readFile(consumer.packageJsonPath, "utf8"));
    const relativePackageJson = toPosix(path.relative(repoRoot, consumer.packageJsonPath));
    for (const section of PACKAGE_DEPENDENCY_SECTIONS) {
      const dependencies = packageJson[section];
      if (!dependencies || typeof dependencies !== "object") continue;

      for (const [name, workspacePackage] of workspacePackages) {
        if (!(name in dependencies)) continue;

        const spec = dependencies[name];
        const expectedSpec = `^${workspacePackage.version}`;
        if (typeof spec !== "string" || spec.startsWith("file:")) {
          errors.push(`${relativePackageJson}: ${section}.${name} must use ${expectedSpec}, not ${spec}`);
          continue;
        }
        if (spec !== expectedSpec) {
          errors.push(`${relativePackageJson}: ${section}.${name} is ${spec}; expected ${expectedSpec}`);
        }
      }
    }

    for (const name of workspacePackages.keys()) {
      const vendorDir = path.join(consumer.dir, "vendor", name);
      if (existsSync(vendorDir)) {
        errors.push(`${toPosix(path.relative(repoRoot, vendorDir))}: remove vendored workspace package`);
      }
    }
  }

  if (errors.length) {
    throw new Error(["Shared package dependency check failed:", ...errors].join("\n"));
  }

  console.log(`Verified npm package dependencies for ${consumers.length} skill script package(s).`);
}

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    targets: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      options.repoRoot = argv[index + 1] ?? options.repoRoot;
      index += 1;
      continue;
    }
    if (arg === "--target") {
      options.targets.push(argv[index + 1] ?? "");
      index += 1;
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

function normalizeTargetConsumerDirs(repoRoot, targets) {
  if (!targets || targets.length === 0) return null;

  const consumerDirs = new Set();
  for (const target of targets) {
    if (!target) continue;

    const resolvedTarget = path.resolve(repoRoot, target);
    if (path.basename(resolvedTarget) === "scripts") {
      consumerDirs.add(resolvedTarget);
      continue;
    }

    consumerDirs.add(path.join(resolvedTarget, "scripts"));
  }

  return consumerDirs;
}

async function discoverWorkspacePackages(repoRoot) {
  const packagesRoot = path.join(repoRoot, "packages");
  const map = new Map();
  if (!existsSync(packagesRoot)) return map;

  const entries = await fs.readdir(packagesRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packageJsonPath = path.join(packagesRoot, entry.name, "package.json");
    if (!existsSync(packageJsonPath)) continue;

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
    if (!packageJson.name || !packageJson.version) continue;
    map.set(packageJson.name, {
      dir: path.join(packagesRoot, entry.name),
      version: packageJson.version,
    });
  }

  return map;
}

async function discoverSkillScriptPackages(repoRoot, targetConsumerDirs = null) {
  const skillsRoot = path.join(repoRoot, "skills");
  const consumers = [];
  const skillEntries = await fs.readdir(skillsRoot, { withFileTypes: true });
  for (const entry of skillEntries) {
    if (!entry.isDirectory()) continue;
    const scriptsDir = path.join(skillsRoot, entry.name, "scripts");
    if (targetConsumerDirs && !targetConsumerDirs.has(path.resolve(scriptsDir))) continue;
    const packageJsonPath = path.join(scriptsDir, "package.json");
    if (!existsSync(packageJsonPath)) continue;
    consumers.push({ dir: scriptsDir, packageJsonPath });
  }
  return consumers.sort((left, right) => left.dir.localeCompare(right.dir));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function printUsage() {
  console.log(`Usage: verify-shared-package-deps.mjs [options]

Options:
  --repo-root <dir>   Repository root (default: current directory)
  --target <dir>      Check only one skill directory (can be repeated)
  -h, --help          Show help`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
