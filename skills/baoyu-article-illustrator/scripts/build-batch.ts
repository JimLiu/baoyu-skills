import path from "node:path";
import process from "node:process";
import { readdir, readFile, writeFile } from "node:fs/promises";

type CliArgs = {
  outlinePath: string | null;
  promptsDir: string | null;
  outputPath: string | null;
  imagesDir: string | null;
  provider: string;
  model: string;
  aspectRatio: string;
  quality: string;
  jobs: number | null;
  help: boolean;
};

type OutlineEntry = {
  index: number;
  filename: string;
};

function printUsage(): void {
  console.log(`Usage:
  npx -y tsx scripts/build-batch.ts --outline outline.md --prompts prompts --output batch.json --images-dir attachments

Options:
  --outline <path>     Path to outline.md
  --prompts <path>     Path to prompts directory
  --output <path>      Path to output batch.json
  --images-dir <path>  Directory for generated images
  --provider <name>    Provider for baoyu-image-gen batch tasks (default: replicate)
  --model <id>         Model for baoyu-image-gen batch tasks (default: google/nano-banana-pro)
  --ar <ratio>         Aspect ratio for all tasks (default: 16:9)
  --quality <level>    Quality for all tasks (default: 2k)
  --jobs <count>       Recommended worker count metadata (optional)
  -h, --help           Show help`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    outlinePath: null,
    promptsDir: null,
    outputPath: null,
    imagesDir: null,
    provider: "replicate",
    model: "google/nano-banana-pro",
    aspectRatio: "16:9",
    quality: "2k",
    jobs: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]!;
    if (current === "--outline") args.outlinePath = argv[++i] ?? null;
    else if (current === "--prompts") args.promptsDir = argv[++i] ?? null;
    else if (current === "--output") args.outputPath = argv[++i] ?? null;
    else if (current === "--images-dir") args.imagesDir = argv[++i] ?? null;
    else if (current === "--provider") args.provider = argv[++i] ?? args.provider;
    else if (current === "--model") args.model = argv[++i] ?? args.model;
    else if (current === "--ar") args.aspectRatio = argv[++i] ?? args.aspectRatio;
    else if (current === "--quality") args.quality = argv[++i] ?? args.quality;
    else if (current === "--jobs") {
      const value = argv[++i];
      args.jobs = value ? parseInt(value, 10) : null;
    } else if (current === "--help" || current === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown option: ${current}`);
    }
  }

  return args;
}

function parseOutline(content: string): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  const lines = content.split(/\r?\n/);
  let currentIndex = 0;

  for (const line of lines) {
    const illustrationMatch = line.match(/^## Illustration\s+(\d+)/);
    if (illustrationMatch) {
      currentIndex = parseInt(illustrationMatch[1]!, 10);
      continue;
    }
    const filenameMatch = line.match(/^\*\*Filename\*\*:\s+(.+)$/);
    if (filenameMatch && currentIndex > 0) {
      entries.push({
        index: currentIndex,
        filename: filenameMatch[1]!.trim(),
      });
    }
  }

  return entries;
}

async function getPromptFiles(promptsDir: string): Promise<string[]> {
  const files = await readdir(promptsDir);
  return files
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => path.join(promptsDir, file));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  if (!args.outlinePath || !args.promptsDir || !args.outputPath || !args.imagesDir) {
    printUsage();
    throw new Error("Missing required arguments: --outline, --prompts, --output, --images-dir");
  }

  const outlineContent = await readFile(path.resolve(args.outlinePath), "utf8");
  const entries = parseOutline(outlineContent);
  const promptFiles = await getPromptFiles(path.resolve(args.promptsDir));

  if (entries.length === 0) {
    throw new Error("No illustration entries with **Filename** found in outline.");
  }
  if (entries.length !== promptFiles.length) {
    throw new Error(
      `Outline/image count mismatch: outline has ${entries.length} entries, prompts dir has ${promptFiles.length} prompt files.`
    );
  }

  const tasks = entries.map((entry, index) => ({
    id: path.basename(entry.filename, path.extname(entry.filename)),
    promptFiles: [promptFiles[index]!],
    image: path.join(path.resolve(args.imagesDir!), entry.filename),
    provider: args.provider,
    model: args.model,
    ar: args.aspectRatio,
    quality: args.quality,
  }));

  const payload = {
    jobs: args.jobs,
    tasks,
  };

  await writeFile(path.resolve(args.outputPath), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(path.resolve(args.outputPath));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
