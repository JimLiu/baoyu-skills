import frontMatter from "front-matter";
import hljs from "highlight.js/lib/core";
import { marked, type RendererObject, type Tokens } from "marked";
import readingTime, { type ReadTimeResults } from "reading-time";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkStringify from "remark-stringify";

import {
  markedAlert,
  markedFootnotes,
  markedInfographic,
  markedMarkup,
  markedPlantUML,
  markedRuby,
  markedSlider,
  markedToc,
  MDKatex,
} from "./extensions/index.js";
import {
  COMMON_LANGUAGES,
  highlightAndFormatCode,
} from "./utils/languages.js";
import { macCodeSvg } from "./constants.js";
import type { IOpts, ParseResult, RendererAPI } from "./types.js";

Object.entries(COMMON_LANGUAGES).forEach(([name, lang]) => {
  hljs.registerLanguage(name, lang);
});

export { hljs };

marked.setOptions({
  breaks: true,
});
marked.use(markedSlider());

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

function buildAddition(): string {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `;
}

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
    )
    .join("\n");
}

function transform(legend: string, text: string | null, title: string | null): string {
  const options = legend.split("-");
  for (const option of options) {
    if (option === "alt" && text) {
      return text;
    }
    if (option === "title" && title) {
      return title;
    }
  }
  return "";
}

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    const parsed = frontMatter(markdownText);
    const yamlData = parsed.attributes;
    const markdownContent = parsed.body;
    const readingTimeResult = readingTime(markdownContent);
    return {
      yamlData: yamlData as Record<string, any>,
      markdownContent,
      readingTime: readingTimeResult,
    };
  } catch (error) {
    console.error("Error parsing front-matter:", error);
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: readingTime(markdownText),
    };
  }
}

export function initRenderer(opts: IOpts = {}): RendererAPI {
  const footnotes: [number, string, string][] = [];
  let footnoteIndex = 0;
  let codeIndex = 0;
  const listOrderedStack: boolean[] = [];
  const listCounters: number[] = [];
  const isBrowser = typeof window !== "undefined";

  function getOpts(): IOpts {
    return opts;
  }

  function styledContent(styleLabel: string, content: string, tagName?: string): string {
    const tag = tagName ?? styleLabel;
    const className = `${styleLabel.replace(/_/g, "-")}`;
    const headingAttr = /^h\d$/.test(tag) ? " data-heading=\"true\"" : "";
    return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`;
  }

  function addFootnote(title: string, link: string): number {
    const existingFootnote = footnotes.find(([, , existingLink]) => existingLink === link);
    if (existingFootnote) {
      return existingFootnote[0];
    }
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0;
    footnoteIndex = 0;
    setOptions(newOpts);
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts };
    marked.use(markedAlert());
    if (isBrowser) {
      marked.use(MDKatex({ nonStandard: true }, true));
    }
    marked.use(markedMarkup());
    marked.use(markedInfographic({ themeMode: opts.themeMode }));
  }

  function buildReadingTime(readingTimeResult: ReadTimeResults): string {
    if (!opts.countStatus) {
      return "";
    }
    if (!readingTimeResult.words) {
      return "";
    }
    return `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">字数 ${readingTimeResult?.words}，阅读大约需 ${Math.ceil(readingTimeResult?.minutes)} 分钟</p>
      </blockquote>
    `;
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return "";
    }
    return (
      styledContent("h4", "引用链接")
      + styledContent("footnotes", buildFootnoteArray(footnotes), "p")
    );
  };

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      return styledContent(tag, text);
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes("<figure") && text.includes("<img");
      const isEmpty = text.trim() === "";
      if (isFigureImage || isEmpty) {
        return text;
      }
      return styledContent("p", text);
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens);
      return styledContent("blockquote", text);
    },

    code({ text, lang = "" }: Tokens.Code): string {
      if (lang.startsWith("mermaid")) {
        if (isBrowser) {
          clearTimeout(codeIndex as any);
          codeIndex = setTimeout(async () => {
            const windowRef = typeof window !== "undefined" ? (window as any) : undefined;
            if (windowRef && windowRef.mermaid) {
              const mermaid = windowRef.mermaid;
              await mermaid.run();
            } else {
              const mermaid = await import("mermaid");
              await mermaid.default.run();
            }
          }, 0) as any as number;
        }
        return `<pre class="mermaid">${text}</pre>`;
      }
      const langText = lang.split(" ")[0];
      const isLanguageRegistered = hljs.getLanguage(langText);
      const language = isLanguageRegistered ? langText : "plaintext";

      const highlighted = highlightAndFormatCode(
        text,
        language,
        hljs,
        !!opts.isShowLineNumber
      );

      const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`;
      let pendingAttr = "";
      if (!isLanguageRegistered && langText !== "plaintext") {
        const escapedText = text.replace(/"/g, "&quot;");
        pendingAttr = ` data-language-pending="${langText}" data-raw-code="${escapedText}" data-show-line-number="${opts.isShowLineNumber}"`;
      }
      const code = `<code class="language-${lang}"${pendingAttr}>${highlighted}</code>`;

      return `<pre class="hljs code__pre">${span}${code}</pre>`;
    },

    codespan({ text }: Tokens.Codespan): string {
      const escapedText = escapeHtml(text);
      return styledContent("codespan", escapedText, "code");
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map((item) => this.listitem(item)).join("");
      listOrderedStack.pop();
      listCounters.pop();
      return styledContent(ordered ? "ol" : "ul", html);
    },

    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1]!;
      listCounters[listCounters.length - 1] = idx + 1;
      const prefix = ordered ? `${idx}. ` : "• ";
      let content: string;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser
          .parse(token.tokens)
          .replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, "$1");
      }
      return styledContent("listitem", `${prefix}${content}`, "li");
    },

    image({ href, title, text }: Tokens.Image): string {
      const newText = opts.legend ? transform(opts.legend, text, title) : "";
      const subText = newText ? styledContent("figcaption", newText) : "";
      const titleAttr = title ? ` title="${title}"` : "";
      return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${subText}</figure>`;
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
      }
      if (href === text) {
        return parsedText;
      }
      if (opts.citeStatus) {
        const ref = addFootnote(title || text, href);
        return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`;
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent("strong", this.parser.parseInline(tokens));
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent("em", this.parser.parseInline(tokens));
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens);
          return styledContent("th", text);
        })
        .join("");
      const body = rows
        .map((row) => {
          const rowContent = row.map((cell) => this.tablecell(cell)).join("");
          return styledContent("tr", rowContent);
        })
        .join("");
      return `
        <section style="max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      return styledContent("td", text);
    },

    hr(_: Tokens.Hr): string {
      return styledContent("hr", "");
    },
  };

  marked.use({ renderer });
  marked.use(markedMarkup());
  marked.use(markedToc());
  marked.use(markedSlider());
  marked.use(markedAlert({}));
  if (isBrowser) {
    marked.use(MDKatex({ nonStandard: true }, true));
  }
  marked.use(markedFootnotes());
  marked.use(
    markedPlantUML({
      inlineSvg: isBrowser,
    })
  );
  marked.use(markedInfographic());
  marked.use(markedRuby());

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    buildReadingTime,
    createContainer(content: string) {
      return styledContent("container", content, "section");
    },
    getOpts,
  };
}

function preprocessCjkEmphasis(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCjkFriendly);
  const tree = processor.parse(markdown);
  const extractText = (node: any): string => {
    if (node.type === "text") return node.value;
    if (node.children) return node.children.map(extractText).join("");
    return "";
  };
  const visit = (node: any, parent?: any, index?: number) => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        visit(node.children[i], node, i);
      }
    }
    if (node.type === "strong" && parent && typeof index === "number") {
      const text = extractText(node);
      parent.children[index] = { type: "html", value: `<strong>${text}</strong>` };
    }
    if (node.type === "emphasis" && parent && typeof index === "number") {
      const text = extractText(node);
      parent.children[index] = { type: "html", value: `<em>${text}</em>` };
    }
  };
  visit(tree);
  const stringify = unified().use(remarkStringify);
  let result = stringify.stringify(tree);
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  return result;
}

export function renderMarkdown(raw: string, renderer: RendererAPI): {
  html: string;
  readingTime: ReadTimeResults;
} {
  const { markdownContent, readingTime: readingTimeResult } =
    renderer.parseFrontMatterAndContent(raw);
  const preprocessed = preprocessCjkEmphasis(markdownContent);
  const html = marked.parse(preprocessed) as string;
  return { html, readingTime: readingTimeResult };
}

export function postProcessHtml(
  baseHtml: string,
  reading: ReadTimeResults,
  renderer: RendererAPI
): string {
  let html = baseHtml;
  html = renderer.buildReadingTime(reading) + html;
  html += renderer.buildFootnotes();
  html += renderer.buildAddition();
  html += `
    <style>
      .hljs.code__pre > .mac-sign {
        display: ${renderer.getOpts().isMacCodeBlock ? "flex" : "none"};
      }
    </style>
  `;
  html += `
    <style>
      h2 strong {
        color: inherit !important;
      }
    </style>
  `;
  return renderer.createContainer(html);
}
