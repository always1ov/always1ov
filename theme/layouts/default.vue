<script lang="ts" setup>
/** 独立页面（关于等）。结构最简：一个标题 + 一段正文。 */
import { useFrontmatter } from 'valaxy'

const frontmatter = useFrontmatter()
</script>

<template>
  <TheShell>
    <div class="wrap">
      <header class="page-head">
        <h1 class="page-title">
          {{ frontmatter.title }}<span class="seal-dot" aria-hidden="true" />
        </h1>
        <p v-if="frontmatter.description" class="page-lede">
          {{ frontmatter.description }}
        </p>
      </header>

      <ValaxyMd class="page-body" :frontmatter="frontmatter">
        <RouterView />
      </ValaxyMd>
    </div>
  </TheShell>
</template>
