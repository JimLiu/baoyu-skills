import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { basename, dirname, join } from "path"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkFrontmatter from "remark-frontmatter"
import remarkStringify from "remark-stringify"
import type { Root, Content } from "mdast"

const args = process.argv.slice(2)
const file = args.find(a => !a.startsWith("--"))
const maxWords = parseInt(args[args.indexOf("--max-words") + 1] || "5000")
const outputDir = args.indexOf("--output-dir") !== -1 ? args[args.indexOf("--output-dir") + 1] : ""

if (!file) {
  console.error("Usage: chunk.ts <file> [--max-words 5000]")
  process.exit(1)
}

const content = readFileSync(file, "utf-8")

const tree = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ["yaml"])
  .parse(content)

const stringify = unified()
  .use(remarkStringify, { bullet: "-", emphasis: "*", strong: "*" })
  .use(remarkGfm)
  .use(remarkFrontmatter, ["yaml"])

function nodeToMd(node: Content): string {
  const root: Root = { type: "root", children: [node] }
  return stringify.stringify(root).trim()
}

function countWords(text: string): number {
  const cleaned = text.replace(/[#*`\[\]()>|_~-]/g, " ")
  const cjk = cleaned.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g)
  const latin = cleaned.match(/[a-zA-Z0-9]+/g)
  return (cjk?.length || 0) + (latin?.length || 0)
}

interface Block {
  md: string
  words: number
}

function splitNodeToBlocks(node: Content): Block[] {
  const md = nodeToMd(node)
  const words = countWords(md)

  if (words <= maxWords) return [{ md, words }]

  if (node.type === "heading" || node.type === "thematicBreak" || node.type === "html") {
    return [{ md, words }]
  }

  if ("children" in node && Array.isArray(node.children)) {
    const blocks: Block[] = []
    for (const child of node.children as Content[]) {
      blocks.push(...splitNodeToBlocks(child))
    }
    return blocks
  }

  const lines = md.split("\n")
  if (lines.length > 1) {
    const blocks: Block[] = []
    let buf: string[] = []
    let bufWords = 0
    for (const line of lines) {
      const lw = countWords(line)
      if (bufWords + lw > maxWords && buf.length > 0) {
        blocks.push({ md: buf.join("\n"), words: bufWords })
        buf = [line]
        bufWords = lw
      } else {
        buf.push(line)
        bufWords += lw
      }
    }
    if (buf.length > 0) blocks.push({ md: buf.join("\n"), words: bufWords })
    return blocks
  }

  return [{ md, words }]
}

let frontmatter = ""
const blocks: Block[] = []

for (const node of tree.children) {
  if (node.type === "yaml") {
    frontmatter = `---\n${node.value}\n---`
    continue
  }
  blocks.push(...splitNodeToBlocks(node as Content))
}

const chunks: { blocks: Block[]; words: number }[] = []
let cur: Block[] = []
let curWords = 0

for (const b of blocks) {
  if (curWords + b.words > maxWords && cur.length > 0) {
    chunks.push({ blocks: cur, words: curWords })
    cur = [b]
    curWords = b.words
  } else {
    cur.push(b)
    curWords += b.words
  }
}
if (cur.length > 0) chunks.push({ blocks: cur, words: curWords })

const dir = outputDir ? join(outputDir, "chunks") : join(dirname(file), "chunks")
mkdirSync(dir, { recursive: true })

if (frontmatter) {
  writeFileSync(join(dir, "frontmatter.md"), frontmatter)
}

chunks.forEach((chunk, i) => {
  const num = String(i + 1).padStart(2, "0")
  const out = join(dir, `chunk-${num}.md`)
  writeFileSync(out, chunk.blocks.map(b => b.md).join("\n\n"))
})

console.log(JSON.stringify({
  source: file,
  chunks: chunks.length,
  output_dir: dir,
  frontmatter: !!frontmatter,
  words_per_chunk: chunks.map(c => c.words)
}))
