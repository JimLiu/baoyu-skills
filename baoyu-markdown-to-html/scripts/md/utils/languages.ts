import type { LanguageFn } from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import objectivec from 'highlight.js/lib/languages/objectivec'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import phpTemplate from 'highlight.js/lib/languages/php-template'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import pythonRepl from 'highlight.js/lib/languages/python-repl'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import vbnet from 'highlight.js/lib/languages/vbnet'
import wasm from 'highlight.js/lib/languages/wasm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

export const COMMON_LANGUAGES: Record<string, LanguageFn> = {
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  go,
  graphql,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  lua,
  makefile,
  markdown,
  objectivec,
  perl,
  php,
  'php-template': phpTemplate,
  plaintext,
  python,
  'python-repl': pythonRepl,
  r,
  ruby,
  rust,
  scss,
  shell,
  sql,
  swift,
  typescript,
  vbnet,
  wasm,
  xml,
  yaml,
}

// highlight.js CDN 配置
const HLJS_VERSION = `11.11.1`
const HLJS_CDN_BASE = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/${HLJS_VERSION}`

// 缓存正在加载的语言
const loadingLanguages = new Map<string, Promise<void>>()

/**
 * 生成语言包的 CDN URL
 */
function grammarUrlFor(language: string): string {
  return `${HLJS_CDN_BASE}/es/languages/${language}.min.js`
}

/**
 * 动态加载并注册语言
 * @param language 语言名称
 * @param hljs highlight.js 实例
 */
export async function loadAndRegisterLanguage(language: string, hljs: any): Promise<void> {
  // 如果已经注册，直接返回
  if (hljs.getLanguage(language)) {
    return
  }

  // 如果正在加载，等待加载完成
  if (loadingLanguages.has(language)) {
    await loadingLanguages.get(language)
    return
  }

  // 开始加载
  const loadPromise = (async () => {
    try {
      const module = await import(/* @vite-ignore */ grammarUrlFor(language))
      hljs.registerLanguage(language, module.default)
    }
    catch (error) {
      console.warn(`Failed to load language: ${language}`, error)
      throw error
    }
    finally {
      loadingLanguages.delete(language)
    }
  })()

  loadingLanguages.set(language, loadPromise)
  await loadPromise
}

/**
 * 格式化高亮后的代码，处理空格和制表符
 */
function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html
  // 将 span 之间的空格移到 span 内部
  formatted = formatted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_: string, span1: string, spaces: string, span2: string) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  formatted = formatted.replace(/(\s+)(<span[^>]*>)/g, (_: string, spaces: string, span: string) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`))
  // 替换制表符为4个空格
  formatted = formatted.replace(/\t/g, `    `)

  if (preserveNewlines) {
    // 替换换行符为 <br/>，并将空格转换为 &nbsp;
    formatted = formatted.replace(/\r\n/g, `<br/>`).replace(/\n/g, `<br/>`).replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }
  else {
    // 只将空格转换为 &nbsp;
    formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`))
  }

  return formatted
}

/**
 * 高亮代码并格式化（支持行号）
 * @param text 原始代码文本
 * @param language 语言名称
 * @param hljs highlight.js 实例
 * @param showLineNumber 是否显示行号
 * @returns 格式化后的 HTML
 */
export function highlightAndFormatCode(text: string, language: string, hljs: any, showLineNumber: boolean): string {
  let highlighted = ``

  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, `\n`).split(`\n`)

    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, { language }).value
      const formatted = formatHighlightedCode(lineHtml, false)
      return formatted === `` ? `&nbsp;` : formatted
    })

    const lineNumbersHtml = highlightedLines.map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`).join(``)
    const codeInnerHtml = highlightedLines.join(`<br/>`)
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`
    const lineNumberColumnStyles = `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`

    highlighted = `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
        <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>
    `
  }
  else {
    const rawHighlighted = hljs.highlight(text, { language }).value
    highlighted = formatHighlightedCode(rawHighlighted, true)
  }

  return highlighted
}

export function highlightCodeBlock(codeBlock: Element, language: string, hljs: any): void {
  const rawCode = codeBlock.getAttribute(`data-raw-code`)
  const showLineNumber = codeBlock.getAttribute(`data-show-line-number`) === `true`

  if (!rawCode)
    return

  const text = rawCode.replace(/&quot;/g, `"`)

  const highlighted = highlightAndFormatCode(text, language, hljs, showLineNumber)

  codeBlock.innerHTML = highlighted
  codeBlock.removeAttribute(`data-language-pending`)
  codeBlock.removeAttribute(`data-raw-code`)
  codeBlock.removeAttribute(`data-show-line-number`)
}

/**
 * 高亮 DOM 中待处理的代码块
 * 查找带有 data-language-pending 属性的代码块，动态加载语言后重新高亮
 * @param hljs highlight.js 实例
 * @param container 容器元素（可选，默认为 document）
 */
export function highlightPendingBlocks(hljs: any, container: Document | Element = document): void {
  const pendingBlocks = container.querySelectorAll(`code[data-language-pending]`)

  pendingBlocks.forEach((codeBlock) => {
    const language = codeBlock.getAttribute(`data-language-pending`)
    if (!language)
      return

    if (hljs.getLanguage(language)) {
      // 语言已加载，直接高亮
      highlightCodeBlock(codeBlock, language, hljs)
    }
    else {
      // 动态加载语言后重新高亮
      loadAndRegisterLanguage(language, hljs).then(() => {
        highlightCodeBlock(codeBlock, language, hljs)
      }).catch(() => {
        // 加载失败，移除标记
        codeBlock.removeAttribute(`data-language-pending`)
        codeBlock.removeAttribute(`data-raw-code`)
        codeBlock.removeAttribute(`data-show-line-number`)
      })
    }
  })
}
