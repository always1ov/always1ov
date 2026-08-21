<script lang="ts" setup>
import { useAppStore } from 'valaxy'

const app = useAppStore()

/**
 * 支持的浏览器上用一次圆形视图过渡来换主题；
 * 不支持（或用户开了减弱动态效果）就直接切，不做降级动画。
 */
function toggle(event: MouseEvent) {
  app.toggleDarkWithTransition(event)
}
</script>

<template>
  <button
    class="icon-btn"
    type="button"
    :aria-label="app.isDark ? '切换到日间模式' : '切换到夜间模式'"
    @click="toggle"
  >
    <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
    <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.1 5.1l1.4 1.4M17.5 17.5l1.4 1.4M18.9 5.1l-1.4 1.4M6.5 17.5l-1.4 1.4" />
    </svg>
  </button>
</template>
