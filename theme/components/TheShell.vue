<script lang="ts" setup>
import { useReveal } from '../composables'

// 进入视口才显形。藏起来这件事由 CSS 的 `.js [data-reveal]` 负责，
// 所以脚本挂了内容也还在。
useReveal()
</script>

<template>
  <a class="skip" href="#main">跳到正文</a>
  <TheHeader />
  <main id="main">
    <slot />
  </main>
  <TheFooter />
</template>
