<script lang="ts" setup>
/**
 * 主题的全局层。只放两样东西：命令面板，和防止暗色闪白的启动脚本。
 * 页面结构在各个 layout 里，不在这。
 */
import { useHead } from '@unhead/vue'
import { useSiteConfig } from 'valaxy'
import { useRoute } from 'vue-router'

const site = useSiteConfig()
const route = useRoute()

/** 站内路径 → 绝对地址。分享出去的链接必须是绝对的。 */
const abs = (p: string) => new URL(p, site.value.url || 'https://always1ov.pages.dev/').href

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

    // Valaxy 默认把 og:image 指向 favicon.svg、og:url 固定成站点根地址。
    // 各家社交平台既不认相对路径也不认 SVG，所以在这里覆盖掉。
    { property: 'og:url', content: () => abs(route.path) },
    { property: 'og:image', content: () => abs('og.png') },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: () => abs('og.png') },
  ],
  link: [
    { rel: 'canonical', href: () => abs(route.path) },
  ],
})
</script>

<template>
  <ClientOnly>
    <CommandPalette />
  </ClientOnly>
</template>
