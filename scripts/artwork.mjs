#!/usr/bin/env node
/**
 * 生成两样静态美术资源：README 顶部的横幅（SVG），和社交卡片 og.png。
 *
 * 画的都是站点首屏那片流场——同样的噪声、同样的走法，
 * 只是这里一次画完、导出成文件。种子写死，所以每次跑出来都一样，
 * 不会给仓库制造无谓的 diff。
 *
 * og.png 是手写的 PNG 编码：为了一张图去装 sharp（几十 MB 的原生二进制）
 * 不值得，而 PNG 的容器格式本身很简单，压缩交给 node:zlib。
 *
 *   npm run artwork
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { deflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SEED = 20260731 // 站点的起点那天

/** mulberry32 */
function rng(a) {
  return function next() {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 格点值噪声 + smoothstep 插值 */
function makeNoise(random, size = 256) {
  const table = new Float32Array(size * size)
  for (let i = 0; i < table.length; i++) table[i] = random()
  const at = (x, y) => table[((y & (size - 1)) * size) + (x & (size - 1))]
  const smooth = t => t * t * (3 - 2 * t)
  return (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = smooth(x - xi)
    const yf = smooth(y - yi)
    const top = at(xi, yi) * (1 - xf) + at(xi + 1, yi) * xf
    const bottom = at(xi, yi + 1) * (1 - xf) + at(xi + 1, yi + 1) * xf
    return top * (1 - yf) + bottom * yf
  }
}

/** 生成一组笔画。每根是一串坐标点。 */
function strokes({ width: W, height: H, count, steps, cell, every = 3 }) {
  const random = rng(SEED)
  const noise = makeNoise(rng(SEED ^ 0x9E3779B9))
  const step = Math.max(W, H) / 300

  return Array.from({ length: count }, () => {
    let x = random() * W
    let y = random() * H
    const len = Math.round(steps * (0.35 + random() * 0.65))
    const points = [[x, y]]
    for (let i = 0; i < len; i++) {
      const angle = noise(x / cell, y / cell) * Math.PI * 3
      x += Math.cos(angle) * step
      y += Math.sin(angle) * step
      // 每 N 步记一个点：肉眼看不出区别，文件小 N 倍
      if (i % every === 0) points.push([x, y])
    }
    return {
      points,
      accent: random() < 0.08,
      alpha: 0.12 + random() * 0.34,
      width: random() < 0.08 ? 1.2 : 0.6,
    }
  })
}

// ── README 横幅（SVG） ───────────────────────────────────────────

const W = 1280
const H = 320

function renderSvg({ bg, ink, accent }) {
  const paths = strokes({ width: W, height: H, count: 150, steps: 340, cell: 150 }).map((s) => {
    const d = s.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    const color = s.accent ? accent : ink
    return `<path d="${d}" stroke="${color}" stroke-opacity="${s.alpha.toFixed(2)}" stroke-width="${s.width}"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="always1ov">
<rect width="${W}" height="${H}" fill="${bg}"/>
<g fill="none" stroke-linecap="round">${paths}</g>
<rect x="56" y="${H - 88}" width="26" height="26" fill="${accent}"/>
</svg>
`
}

// ── 社交卡片（PNG） ─────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = -1
  for (let n = 0; n < buf.length; n++) c = CRC_TABLE[(c ^ buf[n]) & 0xFF] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

/** PNG 的一个块：长度 + 类型 + 数据 + CRC */
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map(i => Number.parseInt(h.slice(i, i + 2), 16))
}

function renderPng({ width, height, bg, ink, accent }) {
  const data = new Uint8ClampedArray(width * height * 3)
  const bgRgb = hexToRgb(bg)
  for (let i = 0; i < data.length; i += 3) {
    data[i] = bgRgb[0]
    data[i + 1] = bgRgb[1]
    data[i + 2] = bgRgb[2]
  }

  const blend = (x, y, rgb, alpha) => {
    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= width || py >= height || alpha <= 0) return
    const i = (py * width + px) * 3
    const k = Math.min(1, alpha)
    data[i] += (rgb[0] - data[i]) * k
    data[i + 1] += (rgb[1] - data[i + 1]) * k
    data[i + 2] += (rgb[2] - data[i + 2]) * k
  }

  // 线段：按长度取样，粗线靠垂向偏移叠加
  const line = (x0, y0, x1, y1, rgb, alpha, w) => {
    const dx = x1 - x0
    const dy = y1 - y0
    const dist = Math.hypot(dx, dy)
    if (!dist) return
    const nx = -dy / dist
    const ny = dx / dist
    const half = (w - 1) / 2
    const samples = Math.ceil(dist * 1.6)
    for (let s = 0; s <= samples; s++) {
      const t = s / samples
      for (let o = -half; o <= half; o += 0.5)
        blend(x0 + dx * t + nx * o, y0 + dy * t + ny * o, rgb, alpha)
    }
  }

  const inkRgb = hexToRgb(ink)
  const accentRgb = hexToRgb(accent)
  for (const s of strokes({ width, height, count: 620, steps: 520, cell: 150, every: 1 })) {
    const rgb = s.accent ? accentRgb : inkRgb
    for (let i = 1; i < s.points.length; i++)
      line(...s.points[i - 1], ...s.points[i], rgb, s.alpha * 0.85, s.width)
  }

  // 左下角一枚印，跟站点的标记同一个语言
  for (let y = height - 128; y < height - 84; y++)
    for (let x = 84; x < 128; x++) blend(x, y, accentRgb, 1)

  // 打包：每行前面加一个 0 表示不用滤波
  const stride = width * 3
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    Buffer.from(data.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // 位深
  ihdr[9] = 2  // 真彩色
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // 自适应滤波
  ihdr[12] = 0 // 不隔行

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── 输出 ────────────────────────────────────────────────────────

await mkdir(path.join(ROOT, 'assets'), { recursive: true })
await mkdir(path.join(ROOT, 'public'), { recursive: true })

await writeFile(path.join(ROOT, 'assets/banner-dark.svg'), renderSvg({ bg: '#0b0b0c', ink: '#e9e4da', accent: '#ff4a2b' }))
await writeFile(path.join(ROOT, 'assets/banner-light.svg'), renderSvg({ bg: '#f2efe7', ink: '#17160f', accent: '#dd3a18' }))
console.log('  ✓ assets/banner-{dark,light}.svg')

await writeFile(path.join(ROOT, 'public/og.png'), renderPng({ width: 1200, height: 630, bg: '#0b0b0c', ink: '#e9e4da', accent: '#ff4a2b' }))
console.log('  ✓ public/og.png')
