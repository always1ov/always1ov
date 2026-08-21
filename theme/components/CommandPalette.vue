<script lang="ts" setup>
/**
 * 命令面板。⌘K / Ctrl+K / 斜杠 打开。
 *
 * 搜索索引就是站点已经在内存里的文章列表，不额外发请求、不引搜索库。
 * 匹配用子序列模糊匹配：输入的字符按顺序出现即可命中，
 * 连续命中加分、开头命中加分——对一个几十篇文章的站点足够了。
 */
import { useAppStore, useSiteStore } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAlwaysConfig, formatDate } from '../composables'

interface Entry {
  kind: string
  title: string
  hint: string
  href?: string
  run?: () => void
  text: string
  hits?: number[]
  points?: number
}

const theme = useAlwaysConfig()
const siteStore = useSiteStore()
const app = useAppStore()
const router = useRouter()

const open = ref(false)
const query = ref('')
const cursor = ref(0)
const input = ref<HTMLInputElement>()

const pool = computed<Entry[]>(() => [
  ...siteStore.postList.map(post => ({
    kind: '文章',
    title: String(post.title ?? ''),
    hint: formatDate(post.date as string).ymd,
    href: post.path,
    text: `${post.title} ${(post.tags || []).join(' ')} ${post.description || ''}`,
  })),
  ...theme.value.nav.map(item => ({
    kind: '导航',
    title: item.label,
    hint: item.path,
    href: item.path,
    text: `${item.label} ${item.path}`,
  })),
  {
    kind: '动作',
    title: '切换 夜 / 昼',
    hint: 'T',
    run: () => app.toggleDark(),
    text: '切换主题 夜 昼 dark light theme',
  },
  {
    kind: '动作',
    title: '复制当前页链接',
    hint: '',
    run: () => navigator.clipboard?.writeText(location.href),
    text: '复制链接 copy link url',
  },
])

/** 子序列匹配。命中返回得分和命中位置，没命中返回 null。 */
function score(text: string, needle: string) {
  const haystack = text.toLowerCase()
  const target = needle.toLowerCase()
  const hits: number[] = []
  let i = 0
  let points = 0
  let streak = 0

  for (let n = 0; n < haystack.length && i < target.length; n++) {
    if (haystack[n] === target[i]) {
      hits.push(n)
      streak += 1
      points += 10 + streak * 4 + (n === 0 ? 12 : 0)
      i += 1
    }
    else {
      streak = 0
    }
  }

  return i === target.length ? { points, hits } : null
}

const results = computed<Entry[]>(() => {
  const q = query.value.trim()
  if (!q)
    return pool.value.slice(0, 12)

  const matched: Entry[] = []
  for (const entry of pool.value) {
    const s = score(entry.text, q)
    if (s)
      matched.push({ ...entry, ...s })
  }

  return matched
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 24)
})

/** 把标题里命中的字符包成 <em>，其余原样转义。 */
function mark(entry: Entry) {
  const escape = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
  if (!query.value.trim())
    return escape(entry.title)

  // hits 是在 text 上的下标，而 text 以 title 开头，所以对 title 直接可用
  const hits = new Set((entry.hits ?? []).filter(i => i < entry.title.length))
  return [...entry.title].map((ch, i) => (hits.has(i) ? `<em>${escape(ch)}</em>` : escape(ch))).join('')
}

/** 分组渲染时，只有和上一条不同的 kind 才画组标题。 */
function isGroupStart(index: number) {
  return index === 0 || results.value[index - 1].kind !== results.value[index].kind
}

function show() {
  open.value = true
  query.value = ''
  cursor.value = 0
  document.body.style.overflow = 'hidden'
  nextTick(() => input.value?.focus())
}

function hide() {
  open.value = false
  document.body.style.overflow = ''
}

function move(delta: number) {
  const total = results.value.length
  if (!total)
    return
  cursor.value = (cursor.value + delta + total) % total
  nextTick(() => {
    document.querySelector('.palette-item[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  })
}

function choose(index = cursor.value) {
  const entry = results.value[index]
  if (!entry)
    return
  hide()
  if (entry.href)
    router.push(entry.href)
  else
    entry.run?.()
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const typing = /^(input|textarea)$/i.test(target.tagName) || target.isContentEditable

  if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open.value)) {
    e.preventDefault()
    open.value ? hide() : show()
    return
  }

  if (!open.value) {
    if (e.key === 't' && !typing && !e.metaKey && !e.ctrlKey)
      app.toggleDark()
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    hide()
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    choose()
  }
}

watch(query, () => { cursor.value = 0 })

onMounted(() => {
  addEventListener('keydown', onKeydown)
  document.documentElement.addEventListener('palette:open', show)
})

onUnmounted(() => {
  removeEventListener('keydown', onKeydown)
  document.documentElement.removeEventListener('palette:open', show)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    class="palette"
    :data-open="String(open)"
    role="dialog"
    aria-modal="true"
    aria-label="搜索与命令"
    @click.self="hide"
  >
    <div class="palette-panel">
      <label class="palette-field">
        <span aria-hidden="true">&gt;</span>
        <input
          ref="input"
          v-model="query"
          type="text"
          placeholder="搜索文章、跳转、切换主题…"
          autocomplete="off"
          spellcheck="false"
          aria-label="搜索"
        >
      </label>

      <div class="palette-list">
        <p v-if="!results.length" class="palette-empty">
          没有匹配的内容。
        </p>

        <template v-for="(entry, i) in results" :key="`${entry.kind}-${entry.title}`">
          <p v-if="isGroupStart(i)" class="palette-group">
            {{ entry.kind }}
          </p>
          <button
            class="palette-item"
            type="button"
            :aria-selected="i === cursor"
            @click="choose(i)"
            @mousemove="cursor = i"
          >
            <span v-html="mark(entry)" />
            <span v-if="entry.hint" class="hint">{{ entry.hint }}</span>
          </button>
        </template>
      </div>

      <div class="palette-foot">
        <span>↑↓ 选择</span><span>⏎ 打开</span><span>ESC 关闭</span><span>T 切换主题</span>
      </div>
    </div>
  </div>
</template>
