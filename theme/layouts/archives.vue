<script lang="ts" setup>
/** 归档页。按年分组，年份用大号衬线压住。 */
import { useFrontmatter, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useAlwaysConfig, useDaysSince, formatDate } from '../composables'

const siteStore = useSiteStore()
const frontmatter = useFrontmatter()
const theme = useAlwaysConfig()
const days = useDaysSince(theme.value.since)

const byYear = computed(() => {
  const map = new Map<string, typeof siteStore.postList>()
  for (const post of siteStore.postList) {
    const year = formatDate(post.date as string).year || '未标注'
    if (!map.has(year))
      map.set(year, [])
    map.get(year)!.push(post)
  }
  return [...map.entries()]
})

const total = computed(() => siteStore.postList.length)
</script>

<template>
  <TheShell>
    <div class="wrap">
      <header class="page-head">
        <h1 class="page-title">
          写作<span class="seal-dot" aria-hidden="true" />
        </h1>
        <ValaxyMd class="page-lede" :frontmatter="frontmatter">
          <RouterView />
        </ValaxyMd>
      </header>

      <div class="stat-strip">
        <div class="stat">
          <span class="v">{{ total }}</span><span class="k">篇文章</span>
        </div>
        <div class="stat">
          <span class="v">{{ byYear.length }}</span><span class="k">个年头</span>
        </div>
        <div class="stat">
          <span class="v">{{ days }}</span><span class="k">天以来</span>
        </div>
      </div>

      <p v-if="!total" class="page-lede">
        还没有文章。第一篇正在路上。
      </p>

      <section v-for="[year, list] in byYear" :key="year" class="year-block" data-reveal>
        <div class="year-mark">
          <span class="y serif">{{ year }}</span>
          <span class="c">{{ list.length }} 篇</span>
        </div>
        <div class="rows">
          <PostRow
            v-for="(post, i) in list"
            :key="post.path"
            :post="post"
            :index="i + 1"
          />
        </div>
      </section>
    </div>
  </TheShell>
</template>
