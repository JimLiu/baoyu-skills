import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { ExtendConfig } from "./types.js";

function extractYamlFrontMatter(content: string): string | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*$/m);
  return match ? match[1]! : null;
}

function parseExtendYaml(yaml: string): Partial<ExtendConfig> {
  const config: Partial<ExtendConfig> = {};
  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx < 0) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (value === "null" || value === "") continue;

    if (key === "default_theme") config.default_theme = value;
    else if (key === "default_color") config.default_color = value;
    else if (key === "default_font_family") config.default_font_family = value;
    else if (key === "default_font_size") config.default_font_size = value.endsWith("px") ? value : `${value}px`;
    else if (key === "default_code_theme") config.default_code_theme = value;
    else if (key === "mac_code_block") config.mac_code_block = value === "true";
    else if (key === "show_line_number") config.show_line_number = value === "true";
    else if (key === "cite") config.cite = value === "true";
    else if (key === "count") config.count = value === "true";
    else if (key === "legend") config.legend = value;
    else if (key === "keep_title") config.keep_title = value === "true";
  }
  return config;
}

export function loadExtendConfig(): Partial<ExtendConfig> {
  const paths = [
    path.join(process.cwd(), ".baoyu-skills", "baoyu-markdown-to-html", "EXTEND.md"),
    path.join(homedir(), ".baoyu-skills", "baoyu-markdown-to-html", "EXTEND.md"),
  ];
  for (const p of paths) {
    try {
      const content = fs.readFileSync(p, "utf-8");
      const yaml = extractYamlFrontMatter(content);
      if (!yaml) continue;
      return parseExtendYaml(yaml);
    } catch {
      continue;
    }
  }
  return {};
}
