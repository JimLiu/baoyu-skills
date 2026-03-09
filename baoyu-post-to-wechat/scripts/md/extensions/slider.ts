import type { MarkedExtension, Tokens } from 'marked'

/**
 * A marked extension to support horizontal sliding images.
 * Syntax: <![alt1](url1),![alt2](url2),![alt3](url3)>
 */
export function markedSlider(): MarkedExtension {
  return {
    extensions: [
      {
        name: `horizontalSlider`,
        level: `block`,
        start(src: string) {
          return src.match(/^<!\[/)?.index
        },
        tokenizer(src: string) {
          const rule = /^<(!\[.*?\]\(.*?\)(?:,!\[.*?\]\(.*?\))*)>/
          const match = src.match(rule)
          if (match) {
            return {
              type: `horizontalSlider`,
              raw: match[0],
              text: match[1],
            }
          }
          return undefined
        },
        renderer(token: Tokens.Generic) {
          const { text } = token
          const imageMatches = text.match(/!\[(.*?)\]\((.*?)\)/g) || []

          if (imageMatches.length === 0) {
            return ``
          }

          const images = imageMatches.map((img: string) => {
            const altMatch = img.match(/!\[(.*?)\]/) || []
            const srcMatch = img.match(/\]\((.*?)\)/) || []
            const alt = altMatch[1] || ``
            const src = srcMatch[1] || ``

            // 新主题系统：不再需要内联样式
            return { src, alt }
          })

          // 使用微信公众号兼容的滑动容器布局
          // 使用微信支持的section标签和特殊样式组合

          return `
            <section style="box-sizing: border-box; font-size: 16px;">
              <section data-role="outer" style="font-family: 微软雅黑; font-size: 16px;">
                <section data-role="paragraph" style="margin: 0px auto; box-sizing: border-box; width: 100%;">
                  <section style="margin: 0px auto; text-align: center;">
                    <section style="display: inline-block; width: 100%;">
                      <!-- 微信公众号支持的滑动图片容器 -->
                      <section style="overflow-x: scroll; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; text-align: center;">
                        ${images.map((img: { src: string, alt: string }, _index: number) => `<section style="display: inline-block; width: 100%; margin-right: 0; vertical-align: top;">
                          <img src="${img.src}" alt="${img.alt}" title="${img.alt}" style="width: 100%; height: auto; border-radius: 4px; vertical-align: top;"/>
                          <p style="margin-top: 5px; font-size: 14px; color: #666; text-align: center; white-space: normal;">${img.alt}</p>
                        </section>`).join(``)}
                      </section>
                    </section>
                  </section>
                </section>
              </section>
              <p style="font-size: 14px; color: #999; text-align: center; margin-top: 5px;"><<< 左右滑动看更多 >>></p>
            </section>
          `
        },
      },
    ],
  }
}
