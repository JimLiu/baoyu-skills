import type { MarkedExtension } from 'marked'

/**
 * 注音/拼音标注扩展
 * https://talk.commonmark.org/t/proper-ruby-text-rb-syntax-support-in-markdown/2279
 * https://www.w3.org/TR/ruby/
 *
 * 支持的格式：
 * 1. [文字]{注音}
 * 2. [文字]^(注音)
 *
 * 分隔符：
 * - `・` (中点)
 * - `．` (全角句点)
 * - `。` (中文句号)
 * - `-` (英文减号)
 */
export function markedRuby(): MarkedExtension {
  return {
    extensions: [
      {
        name: `ruby`,
        level: `inline`,
        start(src: string) {
          // 匹配以 [ 开头的格式
          return src.match(/\[/)?.index
        },
        tokenizer(src: string) {
          // 1. [文字]{注音}
          const rule1 = /^\[([^\]]+)\]\{([^}]+)\}/
          let match = rule1.exec(src)
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic`,
            }
          }

          // 2. [文字]^(注音)
          const rule2 = /^\[([^\]]+)\]\^\(([^)]+)\)/
          match = rule2.exec(src)
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic-hat`,
            }
          }

          return undefined
        },
        renderer(token: any) {
          const { text, ruby, format } = token

          // 检查是否有分隔符
          const separatorRegex = /[・．。-]/g
          const hasSeparators = separatorRegex.test(ruby)

          if (hasSeparators) {
            // 分割注音部分
            const rubyParts = ruby.split(separatorRegex).filter((part: string) => part.trim() !== ``)

            const textChars = text.split(``)
            const result = []

            if (textChars.length >= rubyParts.length) {
              // 文字字符数量 >= 注音部分数量
              // 按注音部分数量分割文字
              let currentIndex = 0

              for (let i = 0; i < rubyParts.length; i++) {
                const rubyPart = rubyParts[i]
                const remainingChars = textChars.length - currentIndex
                const remainingParts = rubyParts.length - i

                // 计算当前部分应该包含多少个字符，默认为 1
                let charCount = 1
                if (remainingParts === 1) {
                  // 最后一个部分，包含所有剩余字符
                  charCount = remainingChars
                }

                // 提取当前部分的文字
                const currentText = textChars.slice(currentIndex, currentIndex + charCount).join(``)

                result.push(`<ruby data-text="${currentText}" data-ruby="${rubyPart}" data-format="${format}">${currentText}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`)

                currentIndex += charCount
              }

              // 处理剩余的字符
              if (currentIndex < textChars.length) {
                result.push(textChars.slice(currentIndex).join(``))
              }
            }
            else {
              // 文字字符数量 < 注音部分数量
              // 每个字符对应一个注音部分，多余的注音被忽略
              for (let i = 0; i < textChars.length; i++) {
                const char = textChars[i]
                const rubyPart = rubyParts[i] || ``

                if (rubyPart) {
                  result.push(`<ruby data-text="${char}" data-ruby="${rubyPart}" data-format="${format}">${char}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`)
                }
                else {
                  result.push(char)
                }
              }
            }

            return result.join(``)
          }

          return `<ruby data-text="${text}" data-ruby="${ruby}" data-format="${format}">${text}<rp>(</rp><rt>${ruby}</rt><rp>)</rp></ruby>`
        },
      },
    ],
  }
}
