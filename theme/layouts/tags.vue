<script lang="ts" setup>
/** 标签页。点某个标签，列出这个标签下的全部文章。 */
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const siteStore = useSiteStore()

const tag = computed(() => decodeURIComponent(String(route.params.tag ?? route.path.split('/tags/')[1] ?? '')).replace(/\/$/, ''))

const posts = computed(() => siteStore.postList.filter((post) => {
  const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : [])
  return !tag.value || tags.includes(tag.value)
}))
</script>

<template>
  <TheShell>
    <div class="wrap">
      <header class="page-head">
        <h1 class="page-title">
          <template v-if="tag">
            #{{ tag }}<span class="seal-dot" aria-hidden="true" />
          </template>
          <template v-else>
            标签<span class="seal-dot" aria-hidden="true" />
          </template>
        </h1>
        <p class="page-lede">
          {{ posts.length }} 篇文章。
        </p>
      </header>

      <div class="rows">
        <PostRow
          v-for="(post, i) in posts"
          :key="post.path"
          :post="post"
          :index="i + 1"
        />
      </div>
    </div>
  </TheShell>
</template>
