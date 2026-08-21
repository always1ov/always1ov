<script lang="ts" setup>
/**
 * 主题的全局层。只放两样东西：命令面板，和防止暗色闪白的启动脚本。
 * 页面结构在各个 layout 里，不在这。
 */
import { useHead } from '@unhead/vue'
import { useSiteConfig } from 'valaxy'

const site = useSiteConfig()

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..600;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap',
    },
  ],
  meta: [
    { name: 'theme-color', content: '#0b0b0c', media: '(prefers-color-scheme: dark)' },
    { name: 'theme-color', content: '#f2efe7', media: '(prefers-color-scheme: light)' },
  ],
})
</script>

<template>
  <ClientOnly>
    <CommandPalette />
  </ClientOnly>
</template>
