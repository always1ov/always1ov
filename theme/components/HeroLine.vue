<script lang="ts" setup>
/**
 * 今日之线。
 *
 * 首屏背后那片东西不是图片，是当场画出来的。
 * 几百根笔画从随机位置出发，每走一步就问一次噪声场「往哪走」，
 * 然后一直走下去，中间不抬笔。
 *
 * 随机种子是当天的日期，所以同一天进来的人看到的完全一样，
 * 换一天就是另一张。点「重画」能看到这片场里的另一种可能。
 *
 * 选它当站点的标志，是因为一条不抬笔的线正好就是 always 的字面意思。
 * 装饰如果只是装饰就不该存在，它得说点什么。
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppStore } from 'valaxy'
import { useAlwaysConfig } from '../composables'

const props = withDefaults(defineProps<{
  strokes?: number
  steps?: number
  cell?: number
}>(), {})

const theme = useAlwaysConfig()
const app = useAppStore()

const canvas = ref<HTMLCanvasElement>()
const seed = ref(todaySeed())
let raf = 0
let lastWidth = 0

/** 用当天日期当种子：20260820 */
function todaySeed() {
  const d = new Date()
  return Number(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`)
}

/** mulberry32：32 位，够随机，四行写完。 */
function rng(a: number) {
  return function next() {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 格点值噪声 + smoothstep 插值。比 Perlin 简单，视觉上够用。 */
function makeNoise(random: () => number, size = 256) {
  const table = new Float32Array(size * size)
  for (let i = 0; i < table.length; i++) table[i] = random()
  const at = (x: number, y: number) => table[((y & (size - 1)) * size) + (x & (size - 1))]
  const smooth = (t: number) => t * t * (3 - 2 * t)

  return function noise(x: number, y: number) {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = smooth(x - xi)
    const yf = smooth(y - yi)
    const top = at(xi, yi) * (1 - xf) + at(xi + 1, yi) * xf
    const bottom = at(xi, yi + 1) * (1 - xf) + at(xi + 1, yi + 1) * xf
    return top * (1 - yf) + bottom * yf
  }
}

function palette() {
  const styles = getComputedStyle(document.documentElement)
  return {
    ink: styles.getPropertyValue('--fg').trim() || '#e9e4da',
    accent: styles.getPropertyValue('--accent').trim() || '#ff4a2b',
  }
}

function draw() {
  const el = canvas.value
  if (!el)
    return

  cancelAnimationFrame(raf)
  const ctx = el.getContext('2d')
  if (!ctx)
    return

  const dpr = Math.min(devicePixelRatio || 1, 2)
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h)
    return

  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const config = theme.value.hero || {}
  const dense = w > 900
  const total = Math.round((props.strokes ?? config.strokes ?? 260) * (dense ? 1 : 0.42))
  const maxSteps = Math.round((props.steps ?? config.steps ?? 420) * (dense ? 1 : 0.6))
  // 步长要远小于噪声格：一步只挪动场的百分之几，笔画才会「流」而不是「抖」
  const step = Math.max(w, h) / 300
  const cell = (props.cell ?? config.cell ?? 190) * (dense ? 1 : 0.7)

  const random = rng(seed.value)
  const noise = makeNoise(rng(seed.value ^ 0x9E3779B9))
  const colors = palette()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const paths = Array.from({ length: total }, () => ({
    x: random() * w,
    y: random() * h,
    len: Math.round(maxSteps * (0.35 + random() * 0.65)),
    width: random() < 0.08 ? 1.2 : 0.6,
    accent: random() < 0.07,
    alpha: 0.12 + random() * 0.34,
    i: 0,
  }))

  // 分帧画：每帧往前推几步，线条像是在长出来
  const perFrame = reduced ? maxSteps : Math.max(2, Math.round(maxSteps / 90))

  function tick() {
    let alive = false
    for (const p of paths) {
      if (p.i >= p.len)
        continue
      alive = true
      ctx!.beginPath()
      ctx!.moveTo(p.x, p.y)
      ctx!.lineWidth = p.width
      ctx!.strokeStyle = p.accent ? colors.accent : colors.ink
      ctx!.globalAlpha = p.accent ? p.alpha * 1.5 : p.alpha
      for (let n = 0; n < perFrame && p.i < p.len; n++, p.i++) {
        // 噪声值 → 角度。3π 的跨度让它转得够多，又不至于原地打结。
        const angle = noise(p.x / cell, p.y / cell) * Math.PI * 3
        p.x += Math.cos(angle) * step
        p.y += Math.sin(angle) * step
        ctx!.lineTo(p.x, p.y)
      }
      ctx!.stroke()
    }
    ctx!.globalAlpha = 1
    if (alive && !reduced)
      raf = requestAnimationFrame(tick)
  }

  if (reduced)
    tick()
  else
    raf = requestAnimationFrame(tick)
}

function reseed() {
  seed.value = Math.floor(Math.random() * 1e9)
  draw()
}

let resizeTimer: ReturnType<typeof setTimeout>
function onResize() {
  // 移动端滚动时地址栏收缩会触发 resize，只有宽度真变了才重画
  if (innerWidth === lastWidth)
    return
  lastWidth = innerWidth
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(draw, 220)
}

// 换主题要跟着换墨色
watch(() => app.isDark, () => requestAnimationFrame(draw))

onMounted(() => {
  lastWidth = innerWidth
  draw()
  addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  removeEventListener('resize', onResize)
})

defineExpose({ reseed, seed })
</script>

<template>
  <canvas ref="canvas" class="hero-canvas" aria-hidden="true" />
</template>
