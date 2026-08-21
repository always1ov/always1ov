import type { ThemeConfig } from '../types'
import { useThemeConfig } from 'valaxy'
import { computed, onMounted, onUnmounted, ref } from 'vue'

/** 带类型的主题配置。组件里一律用这个，别直接用 valaxy 的裸版本。 */
export function useAlwaysConfig() {
  return useThemeConfig<ThemeConfig>()
}

/** 站点起点到今天的天数，用于页脚的「已持续 N 天」。 */
export function useDaysSince(since: string) {
  return computed(() => {
    const from = new Date(`${since}T00:00:00Z`).getTime()
    if (Number.isNaN(from))
      return 0
    return Math.max(0, Math.round((Date.now() - from) / 86400000))
  })
}

/**
 * 进入视口才显形。
 *
 * 藏起来这件事由 CSS 的 `.js [data-reveal]` 负责，而 `.js` 是启动脚本加的——
 * 所以脚本没跑起来时内容照样在页面上。一个内容站点绝不能因为
 * 一行 JavaScript 出错就变成空白。
 */
export function useReveal() {
  const observer = ref<IntersectionObserver>()

  onMounted(() => {
    const targets = document.querySelectorAll('[data-reveal]')
    if (!targets.length)
      return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-in'))
      return
    }

    observer.value = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting)
          continue
        entry.target.classList.add('is-in')
        observer.value?.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 })

    targets.forEach(el => observer.value?.observe(el))
  })

  onUnmounted(() => observer.value?.disconnect())
}

/** 格式化日期。全站的日期都从这里出，避免各处各写一套。 */
export function formatDate(input?: string | Date) {
  const MONTHS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
  const d = input instanceof Date ? input : new Date(String(input ?? ''))
  if (Number.isNaN(d.getTime()))
    return { ymd: '', cn: '', short: '', year: '' }

  const pad = (n: number) => String(n).padStart(2, '0')
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  return {
    ymd: `${year}-${pad(month)}-${pad(day)}`,
    cn: `${year} 年 ${MONTHS[month - 1]}月 ${day} 日`,
    short: `${pad(month)} / ${pad(day)}`,
    year: String(year),
  }
}

/** 中英混排的阅读时长：中文 400 字/分钟，英文 220 词/分钟。 */
export function readingMinutes(text: string) {
  const plain = String(text ?? '').replace(/<[^>]+>/g, ' ')
  const cjk = (plain.match(/[⺀-鿿]/g) || []).length
  const latin = (plain.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length
  return Math.max(1, Math.round(cjk / 400 + latin / 220))
}
