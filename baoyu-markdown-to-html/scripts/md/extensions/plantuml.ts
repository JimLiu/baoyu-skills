import type { MarkedExtension, Tokens } from 'marked'
import { deflateSync } from 'fflate'

export interface PlantUMLOptions {
  /**
   * PlantUML 服务器地址
   * @default 'https://www.plantuml.com/plantuml'
   */
  serverUrl?: string
  /**
   * 渲染格式
   * @default 'svg'
   */
  format?: `svg` | `png`
  /**
   * CSS 类名
   * @default 'plantuml-diagram'
   */
  className?: string
  /**
   * 是否内嵌SVG内容（用于微信公众号等不支持外链图片的环境）
   * @default false
   */
  inlineSvg?: boolean
  /**
   * 自定义样式
   */
  styles?: {
    container?: Record<string, string | number>
  }
}

/**
 * PlantUML 专用的 6-bit 编码函数
 * 基于官方文档 https://plantuml.com/text-encoding
 */
function encode6bit(b: number): string {
  if (b < 10) {
    return String.fromCharCode(48 + b)
  }
  b -= 10
  if (b < 26) {
    return String.fromCharCode(65 + b)
  }
  b -= 26
  if (b < 26) {
    return String.fromCharCode(97 + b)
  }
  b -= 26
  if (b === 0) {
    return `-`
  }
  if (b === 1) {
    return `_`
  }
  return `?`
}

/**
 * 将 3 个字节附加到编码字符串中
 * 基于官方文档 https://plantuml.com/text-encoding
 */
function append3bytes(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
  const c4 = b3 & 0x3F
  let r = ``
  r += encode6bit(c1 & 0x3F)
  r += encode6bit(c2 & 0x3F)
  r += encode6bit(c3 & 0x3F)
  r += encode6bit(c4 & 0x3F)
  return r
}

/**
 * PlantUML 专用的 base64 编码函数
 * 基于官方文档 https://plantuml.com/text-encoding
 */
function encode64(data: string): string {
  let r = ``
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0)
    }
    else if (i + 1 === data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0)
    }
    else {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2))
    }
  }
  return r
}

/**
 * 使用 fflate 库进行 Deflate 压缩
 * 按照官方规范进行压缩
 */
function performDeflate(input: string): string {
  try {
    // 将字符串转换为字节数组
    const inputBytes = new TextEncoder().encode(input)

    // 使用 fflate 进行 deflate 压缩（最高压缩级别 9）
    const compressed = deflateSync(inputBytes, { level: 9 })

    // 将压缩后的字节数组转换为二进制字符串
    return String.fromCharCode(...compressed)
  }
  catch (error) {
    console.warn(`Deflate compression failed:`, error)
    // 如果压缩失败，返回原始输入
    return input
  }
}

/**
 * 编码 PlantUML 代码为服务器可识别的格式
 * 按照官方规范：UTF-8 编码 -> Deflate 压缩 -> PlantUML Base64 编码
 */
function encodePlantUML(plantumlCode: string): string {
  try {
    // 步骤 1 & 2: UTF-8 编码 + Deflate 压缩
    const deflated = performDeflate(plantumlCode)

    // 步骤 3: PlantUML 专用的 base64 编码
    return encode64(deflated)
  }
  catch (error) {
    // 如果编码失败，回退到简单方案
    console.warn(`PlantUML encoding failed, using fallback:`, error)
    const utf8Bytes = new TextEncoder().encode(plantumlCode)
    const base64 = btoa(String.fromCharCode(...utf8Bytes))
    return `~1${base64.replace(/\+/g, `-`).replace(/\//g, `_`).replace(/=/g, ``)}`
  }
}

/**
 * 生成 PlantUML 图片 URL
 */
function generatePlantUMLUrl(code: string, options: Required<PlantUMLOptions>): string {
  const encoded = encodePlantUML(code)
  const formatPath = options.format === `svg` ? `svg` : `png`
  return `${options.serverUrl}/${formatPath}/${encoded}`
}

/**
 * 渲染 PlantUML 图表
 */
function renderPlantUMLDiagram(token: Tokens.Code, options: Required<PlantUMLOptions>): string {
  const { text: code } = token

  // 检查代码是否包含 PlantUML 标记
  const finalCode = (!code.trim().includes(`@start`) || !code.trim().includes(`@end`))
    ? `@startuml\n${code.trim()}\n@enduml`
    : code

  const imageUrl = generatePlantUMLUrl(finalCode, options)

  // 如果启用了内嵌SVG且格式是SVG
  if (options.inlineSvg && options.format === `svg`) {
    // 由于marked是同步的，我们需要返回一个占位符，然后异步替换
    const placeholder = `plantuml-placeholder-${Math.random().toString(36).slice(2, 11)}`

    // 异步获取SVG内容并替换
    fetchSvgContent(imageUrl).then((svgContent) => {
      const placeholderElement = document.querySelector(`[data-placeholder="${placeholder}"]`)
      if (placeholderElement) {
        placeholderElement.outerHTML = createPlantUMLHTML(imageUrl, options, svgContent)
      }
    })

    const containerStyles = options.styles.container
      ? Object.entries(options.styles.container)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`)
          .join(`; `)
      : ``

    return `<div class="${options.className}" style="${containerStyles}" data-placeholder="${placeholder}">
      <div style="color: #666; font-style: italic;">正在加载PlantUML图表...</div>
    </div>`
  }

  return createPlantUMLHTML(imageUrl, options)
}

/**
 * 获取SVG内容
 */
async function fetchSvgContent(svgUrl: string): Promise<string> {
  try {
    const response = await fetch(svgUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const svgContent = await response.text()
    // 移除SVG根元素的固定尺寸，使其响应式
    return svgContent
      // 移除width和height属性
      .replace(/(<svg[^>]*)\swidth="[^"]*"/g, `$1`)
      .replace(/(<svg[^>]*)\sheight="[^"]*"/g, `$1`)
      // 移除style中的width和height
      .replace(/(<svg[^>]*style="[^"]*?)width:[^;]*;?/g, `$1`)
      .replace(/(<svg[^>]*style="[^"]*?)height:[^;]*;?/g, `$1`)
  }
  catch (error) {
    console.warn(`Failed to fetch SVG content from ${svgUrl}:`, error)
    return `<div style="color: #666; font-style: italic;">PlantUML图表加载失败</div>`
  }
}

/**
 * 创建 PlantUML HTML 元素
 */
function createPlantUMLHTML(imageUrl: string, options: Required<PlantUMLOptions>, svgContent?: string): string {
  const containerStyles = options.styles.container
    ? Object.entries(options.styles.container)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`)
        .join(`; `)
    : ``

  // 如果有SVG内容，直接嵌入
  if (svgContent) {
    return `<div class="${options.className}" style="${containerStyles}">
      ${svgContent}
    </div>`
  }

  // 否则使用图片链接
  return `<div class="${options.className}" style="${containerStyles}">
    <img src="${imageUrl}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />
  </div>`
}

/**
 * PlantUML marked 扩展
 */
export function markedPlantUML(options: PlantUMLOptions = {}): MarkedExtension {
  const resolvedOptions: Required<PlantUMLOptions> = {
    serverUrl: options.serverUrl || `https://www.plantuml.com/plantuml`,
    format: options.format || `svg`,
    className: options.className || `plantuml-diagram`,
    inlineSvg: options.inlineSvg || false,
    styles: {
      container: {
        textAlign: `center`,
        margin: `16px 8px`,
        overflowX: `auto`,
        ...options.styles?.container,
      },
    },
  }

  return {
    extensions: [
      {
        name: `plantuml`,
        level: `block`,
        start(src: string) {
          // 匹配 ```plantuml 代码块
          return src.match(/^```plantuml/m)?.index
        },
        tokenizer(src: string) {
          // 匹配完整的 plantuml 代码块
          const match = /^```plantuml\r?\n([\s\S]*?)\r?\n```/.exec(src)

          if (match) {
            const [raw, code] = match
            return {
              type: `plantuml`,
              raw,
              text: code.trim(),
            }
          }
        },
        renderer(token: any) {
          return renderPlantUMLDiagram(token, resolvedOptions)
        },
      },
    ],
    walkTokens(token: any) {
      // 处理现有的代码块，如果语言是 plantuml 就转换类型
      if (token.type === `code` && token.lang === `plantuml`) {
        token.type = `plantuml`
      }
    },
  }
}
