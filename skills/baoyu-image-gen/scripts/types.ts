export type Provider = "google" | "openai" | "dashscope";
export type Quality = "normal" | "2k";

export type CliArgs = {
  prompt: string | null;
  promptFiles: string[];
  imagePath: string | null;
  provider: Provider | null;
  model: string | null;
  aspectRatio: string | null;
  size: string | null;
  quality: Quality;
  imageSize: string | null;
  referenceImages: string[];
  n: number;
  json: boolean;
  help: boolean;
};
