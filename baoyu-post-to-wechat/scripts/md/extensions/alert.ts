import type { MarkedExtension, Tokens } from 'marked'

export interface AlertOptions {
  className?: string
  variants?: AlertVariantItem[]
  withoutStyle?: boolean
}

export interface AlertVariantItem {
  type: string
  icon: string
  title?: string
  titleClassName?: string
}

function ucfirst(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * https://github.com/bent10/marked-extensions/tree/main/packages/alert
 * To support theme, we need to modify the source code.
 * A [marked](https://marked.js.org/) extension to support [GFM alerts](https://github.com/orgs/community/discussions/16925).
 */
export function markedAlert(options: AlertOptions = {}): MarkedExtension {
  const { className = `markdown-alert`, variants = [], withoutStyle = false } = options
  const resolvedVariants = resolveVariants(variants)

  // 提取公共的元数据构建逻辑
  function buildMeta(variantType: string, matchedVariant: AlertVariantItem, fromContainer = false) {
    return {
      className,
      variant: variantType,
      icon: matchedVariant.icon,
      title: matchedVariant.title ?? ucfirst(variantType),
      titleClassName: `${className}-title`,
      fromContainer,
    }
  }

  // 提取公共的渲染逻辑
  function renderAlert(token: any) {
    const { meta, tokens = [] } = token
    // @ts-expect-error marked renderer context has parser property
    const text = this.parser.parse(tokens)
    // 新主题系统：使用 CSS 选择器而非内联样式
    let tmpl = `<blockquote class="${meta.className} ${meta.className}-${meta.variant}">\n`
    tmpl += `<p class="${meta.titleClassName} alert-title-${meta.variant}">`
    if (!withoutStyle) {
      // 给 SVG 添加 class，通过 CSS 控制颜色
      tmpl += meta.icon.replace(
        `<svg`,
        `<svg class="alert-icon-${meta.variant}"`,
      )
    }
    tmpl += meta.title
    tmpl += `</p>\n`
    tmpl += text
    tmpl += `</blockquote>\n`

    return tmpl
  }

  return {
    walkTokens(token) {
      if (token.type !== `blockquote`)
        return

      const matchedVariant = resolvedVariants.find(({ type }) =>
        new RegExp(createSyntaxPattern(type), `i`).test(token.text),
      )

      if (matchedVariant) {
        const { type: variantType } = matchedVariant
        const typeRegexp = new RegExp(createSyntaxPattern(variantType), `i`)

        Object.assign(token, {
          type: `alert`,
          meta: buildMeta(variantType, matchedVariant),
        })

        const firstLine = token.tokens?.[0] as Tokens.Paragraph
        const firstLineText = firstLine.raw?.replace(typeRegexp, ``).trim()

        if (firstLineText) {
          const patternToken = firstLine.tokens[0] as Tokens.Text

          Object.assign(patternToken, {
            raw: patternToken.raw.replace(typeRegexp, ``),
            text: patternToken.text.replace(typeRegexp, ``),
          })

          if (firstLine.tokens[1]?.type === `br`) {
            firstLine.tokens.splice(1, 1)
          }
        }
        else {
          token.tokens?.shift()
        }
      }
    },
    extensions: [
      {
        name: `alert`,
        level: `block`,
        renderer: renderAlert,
      },
      {
        name: `alertContainer`,
        level: `block`,
        start(src) {
          return src.match(/^:::/)?.index
        },
        tokenizer(src, _tokens) {
          // eslint-disable-next-line regexp/no-super-linear-backtracking
          const match = /^:::\s*(\w+)\s*\n([\s\S]*?)\n:::/.exec(src)

          if (match) {
            const [raw, variant, content] = match
            const matchedVariant = resolvedVariants.find(v => v.type === variant)
            if (!matchedVariant)
              return

            return {
              type: `alert`,
              raw,
              text: content.trim(),
              tokens: this.lexer.blockTokens(content.trim()),
              meta: buildMeta(variant, matchedVariant, true),
            }
          }
        },
        renderer: renderAlert,
      },
    ],
  }
}

/**
 * The default configuration for alert variants.
 */
const defaultAlertVariant: AlertVariantItem[] = [
  {
    type: `note`,
    icon: `<svg class="octicon octicon-info" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  },
  {
    type: `info`,
    icon: `<svg class="octicon octicon-info" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  },
  {
    type: `tip`,
    icon: `<svg class="octicon octicon-light-bulb" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
  },
  {
    type: `important`,
    icon: `<svg class="octicon octicon-report" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  },
  {
    type: `warning`,
    icon: `<svg class="octicon octicon-alert" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  },
  {
    type: `caution`,
    icon: `<svg class="octicon octicon-stop" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  },
  // Obsidian-style callouts
  {
    type: `abstract`,
    title: `Abstract`,
    icon: `<svg class="octicon octicon-clipboard" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5.75 1a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75Zm4.5-1.5a2.25 2.25 0 0 1 2.122 1.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h.628A2.25 2.25 0 0 1 5.75-.5ZM3.5 3v10a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5Z"></path></svg>`,
  },
  {
    type: `summary`,
    title: `Summary`,
    icon: `<svg class="octicon octicon-clipboard" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5.75 1a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75Zm4.5-1.5a2.25 2.25 0 0 1 2.122 1.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h.628A2.25 2.25 0 0 1 5.75-.5ZM3.5 3v10a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5Z"></path></svg>`,
  },
  {
    type: `tldr`,
    title: `TL;DR`,
    icon: `<svg class="octicon octicon-clipboard" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5.75 1a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75Zm4.5-1.5a2.25 2.25 0 0 1 2.122 1.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h.628A2.25 2.25 0 0 1 5.75-.5ZM3.5 3v10a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5Z"></path></svg>`,
  },
  {
    type: `todo`,
    title: `Todo`,
    icon: `<svg class="octicon octicon-checklist" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.5 1.75v11.5c0 .138.112.25.25.25h3.17a.75.75 0 0 1 0 1.5H2.75A1.75 1.75 0 0 1 1 13.25V1.75C1 .784 1.784 0 2.75 0h8.5C12.216 0 13 .784 13 1.75v7.736a.75.75 0 0 1-1.5 0V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm10.97 8.72a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1-1.06 1.06l-1.22-1.22v4.94a.75.75 0 0 1-1.5 0v-4.94l-1.22 1.22a.75.75 0 0 1-1.06-1.06Z"></path></svg>`,
  },
  {
    type: `success`,
    title: `Success`,
    icon: `<svg class="octicon octicon-check-circle" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"></path></svg>`,
  },
  {
    type: `done`,
    title: `Done`,
    icon: `<svg class="octicon octicon-check-circle" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"></path></svg>`,
  },
  {
    type: `question`,
    title: `Question`,
    icon: `<svg class="octicon octicon-question" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.92 6.085h.001a.749.749 0 1 1-1.342-.67c.169-.339.436-.701.849-.977C6.845 4.16 7.369 4 8 4a2.756 2.756 0 0 1 1.637.525c.503.377.863.965.863 1.725 0 .448-.115.83-.329 1.15-.205.307-.47.513-.692.662-.109.072-.22.138-.313.195l-.006.004a6.24 6.24 0 0 0-.26.16.952.952 0 0 0-.276.245.75.75 0 0 1-1.248-.832c.184-.264.42-.489.692-.661.103-.067.207-.132.313-.195l.007-.004c.1-.061.182-.11.258-.161a.969.969 0 0 0 .277-.245C8.96 6.514 9 6.427 9 6.25a.612.612 0 0 0-.262-.525A1.27 1.27 0 0 0 8 5.5c-.369 0-.595.09-.74.187a1.01 1.01 0 0 0-.34.398ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  },
  {
    type: `help`,
    title: `Help`,
    icon: `<svg class="octicon octicon-question" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.92 6.085h.001a.749.749 0 1 1-1.342-.67c.169-.339.436-.701.849-.977C6.845 4.16 7.369 4 8 4a2.756 2.756 0 0 1 1.637.525c.503.377.863.965.863 1.725 0 .448-.115.83-.329 1.15-.205.307-.47.513-.692.662-.109.072-.22.138-.313.195l-.006.004a6.24 6.24 0 0 0-.26.16.952.952 0 0 0-.276.245.75.75 0 0 1-1.248-.832c.184-.264.42-.489.692-.661.103-.067.207-.132.313-.195l.007-.004c.1-.061.182-.11.258-.161a.969.969 0 0 0 .277-.245C8.96 6.514 9 6.427 9 6.25a.612.612 0 0 0-.262-.525A1.27 1.27 0 0 0 8 5.5c-.369 0-.595.09-.74.187a1.01 1.01 0 0 0-.34.398ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  },
  {
    type: `faq`,
    title: `FAQ`,
    icon: `<svg class="octicon octicon-question" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.92 6.085h.001a.749.749 0 1 1-1.342-.67c.169-.339.436-.701.849-.977C6.845 4.16 7.369 4 8 4a2.756 2.756 0 0 1 1.637.525c.503.377.863.965.863 1.725 0 .448-.115.83-.329 1.15-.205.307-.47.513-.692.662-.109.072-.22.138-.313.195l-.006.004a6.24 6.24 0 0 0-.26.16.952.952 0 0 0-.276.245.75.75 0 0 1-1.248-.832c.184-.264.42-.489.692-.661.103-.067.207-.132.313-.195l.007-.004c.1-.061.182-.11.258-.161a.969.969 0 0 0 .277-.245C8.96 6.514 9 6.427 9 6.25a.612.612 0 0 0-.262-.525A1.27 1.27 0 0 0 8 5.5c-.369 0-.595.09-.74.187a1.01 1.01 0 0 0-.34.398ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  },
  {
    type: `failure`,
    title: `Failure`,
    icon: `<svg class="octicon octicon-x-circle" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>`,
  },
  {
    type: `fail`,
    title: `Fail`,
    icon: `<svg class="octicon octicon-x-circle" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>`,
  },
  {
    type: `missing`,
    title: `Missing`,
    icon: `<svg class="octicon octicon-x-circle" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>`,
  },
  {
    type: `danger`,
    title: `Danger`,
    icon: `<svg class="octicon octicon-zap" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.346 1.909 1.22 3.004l-7.34 7.142a1.249 1.249 0 0 1-.871.354h-.302a1.25 1.25 0 0 1-1.157-1.723L5.633 10.5H3.462c-1.57 0-2.346-1.909-1.22-3.004ZM9.98 1.873a.016.016 0 0 0-.016.006L2.252 9.021a.75.75 0 0 0 .488 1.212h3.838a.75.75 0 0 1 .694 1.034L5.545 15.02a.016.016 0 0 0 .003.017.017.017 0 0 0 .018.004h.302a.016.016 0 0 0 .012-.005l7.34-7.142a.75.75 0 0 0-.488-1.212h-3.838a.75.75 0 0 1-.694-1.034l1.527-3.628a.016.016 0 0 0-.003-.017.017.017 0 0 0-.018-.004h-.302Z"></path></svg>`,
  },
  {
    type: `error`,
    title: `Error`,
    icon: `<svg class="octicon octicon-zap" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.346 1.909 1.22 3.004l-7.34 7.142a1.249 1.249 0 0 1-.871.354h-.302a1.25 1.25 0 0 1-1.157-1.723L5.633 10.5H3.462c-1.57 0-2.346-1.909-1.22-3.004ZM9.98 1.873a.016.016 0 0 0-.016.006L2.252 9.021a.75.75 0 0 0 .488 1.212h3.838a.75.75 0 0 1 .694 1.034L5.545 15.02a.016.016 0 0 0 .003.017.017.017 0 0 0 .018.004h.302a.016.016 0 0 0 .012-.005l7.34-7.142a.75.75 0 0 0-.488-1.212h-3.838a.75.75 0 0 1-.694-1.034l1.527-3.628a.016.016 0 0 0-.003-.017.017.017 0 0 0-.018-.004h-.302Z"></path></svg>`,
  },
  {
    type: `bug`,
    title: `Bug`,
    icon: `<svg class="octicon octicon-bug" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.72.22a.75.75 0 0 1 1.06 0l1 .999a3.488 3.488 0 0 1 2.441 0l.999-1a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.775.776c.616.63.995 1.493.995 2.444v.327c0 .1-.009.197-.025.292l.727.726a.75.75 0 1 1-1.06 1.06l-.727-.727a2.17 2.17 0 0 1-.292.026H9.25V7.5a.75.75 0 0 1-1.5 0V6.125H6.875a2.17 2.17 0 0 1-.292-.026l-.727.727a.75.75 0 1 1-1.06-1.06l.727-.726a2.17 2.17 0 0 1-.025-.292V4.5c0-.951.379-1.814.995-2.444l-.775-.776a.75.75 0 0 1 0-1.06Zm6.437 6.003A.608.608 0 0 0 11 6.072v-.026a3.999 3.999 0 0 0-.11-.936 2.488 2.488 0 0 0-5.78 0 3.992 3.992 0 0 0-.11.936v.026c0 .05.008.098.02.147h4.937a.612.612 0 0 0 .2-.02ZM2.25 7.5a.75.75 0 0 0 0 1.5h.5v1.25a4.75 4.75 0 0 0 2.478 4.166l.247.137a.75.75 0 1 0 .722-1.313l-.246-.137A3.25 3.25 0 0 1 4.25 10.25V9h7.5v1.25a3.25 3.25 0 0 1-1.701 2.853l-.246.137a.75.75 0 1 0 .722 1.313l.247-.137A4.75 4.75 0 0 0 13.25 10.25V9h.5a.75.75 0 0 0 0-1.5Z"></path></svg>`,
  },
  {
    type: `example`,
    title: `Example`,
    icon: `<svg class="octicon octicon-list-unordered" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5.75 2.5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  },
  {
    type: `quote`,
    title: `Quote`,
    icon: `<svg class="octicon octicon-quote" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM4 5.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 5.25Zm0 4a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
  },
  {
    type: `cite`,
    title: `Cite`,
    icon: `<svg class="octicon octicon-quote" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM4 5.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 5.25Zm0 4a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
  },
]

/**
 * Resolves the variants configuration, combining the provided variants with
 * the default variants.
 */
export function resolveVariants(variants: AlertVariantItem[]) {
  if (!variants.length)
    return defaultAlertVariant

  return Object.values(
    [...defaultAlertVariant, ...variants].reduce(
      (map, item) => {
        map[item.type] = item
        return map
      },
      {} as { [key: string]: AlertVariantItem },
    ),
  )
}

/**
 * Returns regex pattern to match alert syntax.
 */
export function createSyntaxPattern(type: string) {
  return `^(?:\\[!${type}])\\s*?\n*`
}
