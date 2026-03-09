import type { MarkedExtension } from 'marked'

/**
 * 扩展标记语法：
 * - 高亮: ==文本==
 * - 下划线: ++文本++
 * - 波浪线: ~文本~
 */
export function markedMarkup(): MarkedExtension {
  return {
    extensions: [
      // 高亮语法 ==文本==
      {
        name: `markup_highlight`,
        level: `inline`,
        start(src: string) {
          return src.match(/==(?!=)/)?.index
        },
        tokenizer(src: string) {
          const rule = /^==((?:[^=]|=(?!=))+)==/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_highlight`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer(token: any) {
          // 新主题系统：使用 class 而非内联样式
          return `<span class="markup-highlight">${token.text}</span>`
        },
      },

      // 下划线语法 ++文本++
      {
        name: `markup_underline`,
        level: `inline`,
        start(src: string) {
          return src.match(/\+\+(?!\+)/)?.index
        },
        tokenizer(src: string) {
          const rule = /^\+\+((?:[^+]|\+(?!\+))+)\+\+/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_underline`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer(token: any) {
          // 新主题系统：使用 class 而非内联样式
          return `<span class="markup-underline">${token.text}</span>`
        },
      },

      // 波浪线语法 ~文本~
      {
        name: `markup_wavyline`,
        level: `inline`,
        start(src: string) {
          // 查找单个 ~ 但不是连续的 ~~
          return src.match(/~(?!~)/)?.index
        },
        tokenizer(src: string) {
          // 匹配 ~文本~ 但确保不是 ~~文本~~
          const rule = /^~([^~\n]+)~(?!~)/
          const match = rule.exec(src)
          if (match) {
            return {
              type: `markup_wavyline`,
              raw: match[0],
              text: match[1],
            }
          }
        },
        renderer(token: any) {
          // 新主题系统：使用 class 而非内联样式
          return `<span class="markup-wavyline">${token.text}</span>`
        },
      },
    ],
  }
}
