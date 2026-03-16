import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

type WmConfig = { logoSize: number; marginRight: number; marginBottom: number };
type WmPosition = { x: number; y: number; width: number; height: number };

function detectConfig(w: number, h: number): WmConfig {
  if (w > 1024 && h > 1024) return { logoSize: 96, marginRight: 64, marginBottom: 64 };
  return { logoSize: 48, marginRight: 32, marginBottom: 32 };
}

function calcPosition(w: number, h: number, cfg: WmConfig): WmPosition {
  return {
    x: w - cfg.marginRight - cfg.logoSize,
    y: h - cfg.marginBottom - cfg.logoSize,
    width: cfg.logoSize,
    height: cfg.logoSize,
  };
}

function buildAlphaMap(bgData: Buffer, w: number, h: number): Float32Array {
  const map = new Float32Array(w * h);
  for (let i = 0; i < map.length; i++) {
    const idx = i * 4;
    map[i] = Math.max(bgData[idx]!, bgData[idx + 1]!, bgData[idx + 2]!) / 255.0;
  }
  return map;
}

function applyReverseBlend(
  data: Buffer,
  imgW: number,
  alphaMap: Float32Array,
  pos: WmPosition,
): void {
  for (let row = 0; row < pos.height; row++) {
    for (let col = 0; col < pos.width; col++) {
      const imgIdx = ((pos.y + row) * imgW + (pos.x + col)) * 4;
      const alphaIdx = row * pos.width + col;
      let alpha = alphaMap[alphaIdx]!;

      if (alpha < ALPHA_THRESHOLD) continue;
      alpha = Math.min(alpha, MAX_ALPHA);
      const inv = 1.0 - alpha;

      for (let c = 0; c < 3; c++) {
        const val = (data[imgIdx + c]! - alpha * LOGO_VALUE) / inv;
        data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
  }
}

const alphaMaps: Record<number, Float32Array> = {};

async function getAlphaMap(size: number): Promise<Float32Array> {
  if (alphaMaps[size]) return alphaMaps[size]!;

  const file = size === 48 ? 'bg_48.png' : 'bg_96.png';
  const dir = (import.meta as any).dir ?? path.dirname(new URL(import.meta.url).pathname);
  const buf = await readFile(path.join(dir, 'assets', file));
  const png = PNG.sync.read(buf);
  const map = buildAlphaMap(png.data as unknown as Buffer, png.width, png.height);
  alphaMaps[size] = map;
  return map;
}

export async function removeWatermarkFromFile(filePath: string): Promise<boolean> {
  const buf = await readFile(filePath);

  let png: PNG;
  try {
    png = PNG.sync.read(buf);
  } catch {
    return false;
  }

  const { width, height } = png;
  const cfg = detectConfig(width, height);
  const pos = calcPosition(width, height, cfg);

  if (pos.x < 0 || pos.y < 0) return false;

  const alphaMap = await getAlphaMap(cfg.logoSize);
  applyReverseBlend(png.data as unknown as Buffer, width, alphaMap, pos);

  const out = PNG.sync.write(png);
  await writeFile(filePath, out);
  return true;
}
