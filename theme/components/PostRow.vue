<script lang="ts" setup>
import type { Post } from 'valaxy'
import { computed } from 'vue'
import { formatDate, readingMinutes } from '../composables'

const props = withDefaults(defineProps<{
  post: Post
  index: number
  showSummary?: boolean
}>(), { showSummary: true })

const n = computed(() => String(props.index).padStart(2, '0'))
const date = computed(() => formatDate(props.post.date as string))

/** 摘要优先用 frontmatter 的 description，没有就退回自动摘录。 */
const summary = computed(() => {
  const raw = props.post.description || props.post.excerpt || ''
  const text = String(raw).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 88 ? `${text.slice(0, 88).trimEnd()}…` : text
})

const minutes = computed(() => {
  const source = `${props.post.description || ''}${props.post.excerpt || ''}`
  return props.post.readingTime || readingMinutes(source) || 1
})
</script>

<template>
  <AppLink class="row" :to="post.path || '/'">
    <span class="row-index">{{ n }}</span>
    <span class="row-title serif">{{ post.title }}</span>
    <span class="row-meta">{{ date.short }} · {{ minutes }} 分钟</span>
    <span v-if="showSummary && summary" class="row-sub">{{ summary }}</span>
    <span class="row-arrow" aria-hidden="true"><ArrowRight /></span>
  </AppLink>
</template>
