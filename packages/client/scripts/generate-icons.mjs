// 用 Node.js 内置模块生成 PNG 图标，无需任何第三方依赖
// PNG 格式：Signature + IHDR + IDAT(zlib 压缩的像素数据) + IEND

import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public');

// ── PNG 构建工具函数 ──────────────────────────────────────

function u32(n) {
  const b = Buffer.allocUnsafe(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([t, data]);
  return Buffer.concat([u32(data.length), t, data, u32(crc32(crcBuf))]);
}

/**
 * 创建 RGBA PNG，pixelFn(x, y) 返回 [r, g, b, a]
 */
function makePNG(size, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.concat([
    u32(size), u32(size),
    Buffer.from([8, 6, 0, 0, 0]), // 8-bit RGBA
  ]);

  // 每行：1 字节 filter(0=None) + size*4 字节像素
  const raw = Buffer.allocUnsafe(size * (1 + size * 4));
  let pos = 0;
  for (let y = 0; y < size; y++) {
    raw[pos++] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y, size);
      raw[pos++] = r; raw[pos++] = g; raw[pos++] = b; raw[pos++] = a;
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── 像素着色函数 ──────────────────────────────────────────

/**
 * 圆角矩形判断
 */
function inRoundedRect(x, y, size, radius) {
  const cx = size / 2, cy = size / 2;
  const hw = size / 2 - 1, hh = size / 2 - 1;
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  if (dx > hw || dy > hh) return false;
  if (dx <= hw - radius || dy <= hh - radius) return true;
  const cornerX = dx - (hw - radius), cornerY = dy - (hh - radius);
  return cornerX * cornerX + cornerY * cornerY <= radius * radius;
}

/**
 * 闪电多边形（归一化坐标 0-1）
 */
const LIGHTNING = [
  [0.42, 0.08], [0.22, 0.52], [0.46, 0.52],
  [0.28, 0.92], [0.78, 0.44], [0.54, 0.44],
  [0.68, 0.08],
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function taskforgePixel(x, y, size) {
  const nx = x / size, ny = y / size;
  const radius = size * 0.22;
  const bg = [99, 102, 241, 255]; // #6366f1 紫色

  if (!inRoundedRect(x, y, size, radius)) return [0, 0, 0, 0]; // 透明
  if (pointInPolygon(nx, ny, LIGHTNING)) return [255, 255, 255, 255]; // 白色闪电
  return bg;
}

// ── 生成图标 ─────────────────────────────────────────────

for (const size of [192, 512]) {
  const buf = makePNG(size, taskforgePixel);
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, buf);
  console.log(`✓ ${file} (${buf.length} bytes)`);
}
