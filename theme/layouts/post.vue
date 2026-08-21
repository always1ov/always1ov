<script lang="ts" setup>
/**
 * 文章页。左边正文，右边目录，顶上一条朱红的阅读进度。
 */
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'
import { useHead } from '@unhead/vue'
import { useFrontmatter, usePrevNext, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { formatDate } from '../composables'

const frontmatter = useFrontmatter()
const site = useSiteConfig()
const [prev, next] = usePrevNext()

const date = computed(() => formatDate(frontmatter.value.date as string))
// Valaxy 会从 git 里补 updated，跟发布日同一天时不必再显示一遍
const updated = computed(() => {
  const raw = frontmatter.value.updated
  if (!raw)
    return null
  const u = formatDate(raw as string)
  return u.ymd && u.ymd !== date.value.ymd ? u : null
})
const tags = computed(() => {
  const raw = frontmatter.value.tags
  return Array.isArray(raw) ? raw : (raw ? [raw] : [])
})

// frontmatter 的字段可能是 i18n 对象（{ 'zh-CN': '…' }），schema-org 只收字符串
const asText = (value: unknown) => (typeof value === 'string' ? value : undefined)

useHead({
  meta: [
    { property: 'og:type', content: 'article' },
    { property: 'article:published_time', content: () => String(frontmatter.value.date ?? '') },
  ],
})

useSchemaOrg(defineArticle({
  '@type': 'BlogPosting',
  'headline': asText(frontmatter.value.title),
  'description': asText(frontmatter.value.description),
  'author': [{ name: site.value.author.name, url: site.value.author.link }],
  'datePublished': frontmatter.value.date ? new Date(frontmatter.value.date as string) : undefined,
  'dateModified': frontmatter.value.updated ? new Date(frontmatter.value.updated as string) : undefined,
}))
</script>

<template>
  <TheShell>
    <ClientOnly>
      <ReadingProgress />
    </ClientOnly>

    <article>
      <div class="wrap">
        <header class="article-head">
          <p class="article-kicker">
            <time :datetime="date.ymd">{{ date.cn }}</time>
            <template v-if="frontmatter.readingTime">
              <span class="sep">/</span>
              <span>{{ frontmatter.readingTime }} 分钟</span>
            </template>
          </p>

          <h1 class="article-title">
            {{ frontmatter.title }}
          </h1>

          <p v-if="frontmatter.description" class="article-standfirst">
            {{ frontmatter.description }}
          </p>

          <div v-if="tags.length" class="tags" style="margin-top: 1.6rem">
            <AppLink
              v-for="tag in tags"
              :key="tag"
              class="tag"
              :to="`/tags/${tag}`"
            >
              {{ tag }}
            </AppLink>
          </div>
        </header>

        <div class="article-layout">
          <!-- ValaxyMd 负责 .markdown-body 外壳，以及代码复制、表格滚动、
               目录所依赖的 content-updated 钩子。自己写 div 会把这些全丢掉。 -->
          <ValaxyMd :frontmatter="frontmatter">
            <RouterView />
          </ValaxyMd>
          <ClientOnly>
            <TheToc />
          </ClientOnly>
        </div>

        <footer class="article-foot">
          <p class="mono">
            写于 {{ date.cn }}<template v-if="updated"> · 修订于 {{ updated.cn }}</template>
          </p>
          <AppLink class="action" to="/posts">
            回到全部文章 <ArrowRight />
          </AppLink>
        </footer>
      </div>

      <nav v-if="prev || next" class="adjacent" aria-label="相邻文章">
        <AppLink v-if="prev" :to="prev.path || '/'">
          <span class="mono">← 上一篇</span>
          <span class="t serif">{{ prev.title }}</span>
        </AppLink>
        <span v-else />
        <AppLink v-if="next" class="next" :to="next.path || '/'">
          <span class="mono">下一篇 →</span>
          <span class="t serif">{{ next.title }}</span>
        </AppLink>
      </nav>
    </article>
  </TheShell>
</template>
