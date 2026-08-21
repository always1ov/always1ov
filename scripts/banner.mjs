#!/usr/bin/env node
/**
 * 生成 README 顶部那张横幅。
 *
 * 画的是站点首屏同一片流场——同样的噪声、同样的走法，
 * 只是这里一次画完，导出成 SVG，好让 GitHub 直接渲染。
 * 种子写死，所以每次跑出来的图都一样，不会给仓库制造无谓的 diff。
 *
 *   node scripts/banner.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'
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

const W = 1280
const H = 320

function strokes() {
  const random = rng(SEED)
  const noise = makeNoise(rng(SEED ^ 0x9E3779B9))
  const step = Math.max(W, H) / 300
  const cell = 150

  return Array.from({ length: 150 }, () => {
    let x = random() * W
    let y = random() * H
    const len = Math.round(340 * (0.35 + random() * 0.65))
    const points = [[x, y]]
    for (let i = 0; i < len; i++) {
      const angle = noise(x / cell, y / cell) * Math.PI * 3
      x += Math.cos(angle) * step
      y += Math.sin(angle) * step
      // 每三步记一个点：肉眼看不出区别，文件小三倍
      if (i % 3 === 0) points.push([x, y])
    }
    return {
      points,
      accent: random() < 0.08,
      alpha: (0.12 + random() * 0.34).toFixed(2),
      width: random() < 0.08 ? 1.2 : 0.6,
    }
  })
}

function render({ bg, ink, accent }) {
  const paths = strokes().map((s) => {
    const d = s.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    const color = s.accent ? accent : ink
    return `<path d="${d}" stroke="${color}" stroke-opacity="${s.alpha}" stroke-width="${s.width}"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="always1ov">
<rect width="${W}" height="${H}" fill="${bg}"/>
<g fill="none" stroke-linecap="round">${paths}</g>
<rect x="56" y="${H - 88}" width="26" height="26" fill="${accent}"/>
</svg>
`
}

await mkdir(path.join(ROOT, 'assets'), { recursive: true })
await writeFile(path.join(ROOT, 'assets/banner-dark.svg'), render({ bg: '#0b0b0c', ink: '#e9e4da', accent: '#ff4a2b' }))
await writeFile(path.join(ROOT, 'assets/banner-light.svg'), render({ bg: '#f2efe7', ink: '#17160f', accent: '#dd3a18' }))
console.log('  ✓ assets/banner-{dark,light}.svg')
