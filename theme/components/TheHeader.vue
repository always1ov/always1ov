<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAlwaysConfig } from '../composables'

const site = useSiteConfig()
const theme = useAlwaysConfig()
const route = useRoute()

const stuck = ref(false)

function isCurrent(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function onScroll() {
  stuck.value = scrollY > 8
}

onMounted(() => {
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => removeEventListener('scroll', onScroll))

function openPalette() {
  document.documentElement.dispatchEvent(new CustomEvent('palette:open'))
}
</script>

<template>
  <header class="masthead" :data-stuck="String(stuck)">
    <div class="wrap masthead-inner">
      <AppLink class="brand" to="/">
        <span class="seal" aria-hidden="true" />
        {{ site.title }}
      </AppLink>

      <nav class="nav" aria-label="主导航">
        <AppLink
          v-for="item in theme.nav"
          :key="item.path"
          class="nav-link"
          :to="item.path"
          :aria-current="isCurrent(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </AppLink>

        <div class="masthead-tools">
          <button class="action action--search" type="button" aria-label="打开搜索" @click="openPalette">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
            </svg>
            <span class="label">搜索</span> <kbd>⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  </header>
</template>
