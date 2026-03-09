import type { ReadTimeResults } from "reading-time";

export type ThemeName = string;

export interface StyleConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: string;
  foreground: string;
  blockquoteBackground: string;
  accentColor: string;
  containerBg: string;
}

export interface IOpts {
  legend?: string;
  citeStatus?: boolean;
  countStatus?: boolean;
  isMacCodeBlock?: boolean;
  isShowLineNumber?: boolean;
  themeMode?: "light" | "dark";
}

export interface RendererAPI {
  reset: (newOpts: Partial<IOpts>) => void;
  setOptions: (newOpts: Partial<IOpts>) => void;
  getOpts: () => IOpts;
  parseFrontMatterAndContent: (markdown: string) => {
    yamlData: Record<string, any>;
    markdownContent: string;
    readingTime: ReadTimeResults;
  };
  buildReadingTime: (reading: ReadTimeResults) => string;
  buildFootnotes: () => string;
  buildAddition: () => string;
  createContainer: (html: string) => string;
}

export interface ParseResult {
  yamlData: Record<string, any>;
  markdownContent: string;
  readingTime: ReadTimeResults;
}

export interface CliOptions {
  inputPath: string;
  theme: ThemeName;
  keepTitle: boolean;
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: string;
  codeTheme: string;
  isMacCodeBlock: boolean;
  isShowLineNumber: boolean;
  citeStatus: boolean;
  countStatus: boolean;
  legend: string;
}

export interface ExtendConfig {
  default_theme: string | null;
  default_color: string | null;
  default_font_family: string | null;
  default_font_size: string | null;
  default_code_theme: string | null;
  mac_code_block: boolean | null;
  show_line_number: boolean | null;
  cite: boolean | null;
  count: boolean | null;
  legend: string | null;
  keep_title: boolean | null;
}

export interface HtmlDocumentMeta {
  title: string;
  author?: string;
  description?: string;
}
