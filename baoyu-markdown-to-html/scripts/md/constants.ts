import type { StyleConfig } from "./types.js";

export const FONT_FAMILY_MAP: Record<string, string> = {
  sans: `-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,
  serif: `Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,
  "serif-cjk": `"Source Han Serif SC", "Noto Serif CJK SC", "Source Han Serif CN", STSong, SimSun, serif`,
  mono: `Menlo, Monaco, 'Courier New', monospace`,
};

export const FONT_SIZE_OPTIONS = ["14px", "15px", "16px", "17px", "18px"];

export const COLOR_PRESETS: Record<string, string> = {
  blue: "#0F4C81",
  green: "#009874",
  vermilion: "#FA5151",
  yellow: "#FECE00",
  purple: "#92617E",
  sky: "#55C9EA",
  rose: "#B76E79",
  olive: "#556B2F",
  black: "#333333",
  gray: "#A9A9A9",
  pink: "#FFB7C5",
  red: "#A93226",
  orange: "#D97757",
};

export const CODE_BLOCK_THEMES = [
  "1c-light", "a11y-dark", "a11y-light", "agate", "an-old-hope",
  "androidstudio", "arduino-light", "arta", "ascetic",
  "atom-one-dark-reasonable", "atom-one-dark", "atom-one-light",
  "brown-paper", "codepen-embed", "color-brewer", "dark", "default",
  "devibeans", "docco", "far", "felipec", "foundation",
  "github-dark-dimmed", "github-dark", "github", "gml", "googlecode",
  "gradient-dark", "gradient-light", "grayscale", "hybrid", "idea",
  "intellij-light", "ir-black", "isbl-editor-dark", "isbl-editor-light",
  "kimbie-dark", "kimbie-light", "lightfair", "lioshi", "magula",
  "mono-blue", "monokai-sublime", "monokai", "night-owl", "nnfx-dark",
  "nnfx-light", "nord", "obsidian", "panda-syntax-dark",
  "panda-syntax-light", "paraiso-dark", "paraiso-light", "pojoaque",
  "purebasic", "qtcreator-dark", "qtcreator-light", "rainbow", "routeros",
  "school-book", "shades-of-purple", "srcery", "stackoverflow-dark",
  "stackoverflow-light", "sunburst", "tokyo-night-dark", "tokyo-night-light",
  "tomorrow-night-blue", "tomorrow-night-bright", "vs", "vs2015", "xcode",
  "xt256",
];

export const DEFAULT_STYLE: StyleConfig = {
  primaryColor: "#0F4C81",
  fontFamily: FONT_FAMILY_MAP.sans!,
  fontSize: "16px",
  foreground: "0 0% 3.9%",
  blockquoteBackground: "#f7f7f7",
  accentColor: "#6B7280",
  containerBg: "transparent",
};

export const THEME_STYLE_DEFAULTS: Record<string, Partial<StyleConfig>> = {
  default: {
    primaryColor: COLOR_PRESETS.blue,
  },
  grace: {
    primaryColor: COLOR_PRESETS.purple,
  },
  simple: {
    primaryColor: COLOR_PRESETS.green,
  },
  modern: {
    primaryColor: COLOR_PRESETS.orange,
    accentColor: "#E4B1A0",
    containerBg: "rgba(250, 249, 245, 1)",
    fontFamily: FONT_FAMILY_MAP.sans,
    fontSize: "15px",
    blockquoteBackground: "rgba(255, 255, 255, 0.6)",
  },
};

export const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();
