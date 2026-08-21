<script lang="ts" setup>
import { useSiteConfig, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useAlwaysConfig, useDaysSince } from '../composables'

const site = useSiteConfig()
const theme = useAlwaysConfig()
const siteStore = useSiteStore()

const days = useDaysSince(theme.value.since)
const count = computed(() => siteStore.postList.length)
const year = new Date().getFullYear()
</script>

<template>
  <footer class="colophon">
    <div class="wrap colophon-grid">
      <div>
        <p class="mark serif">{{ site.title }}</p>
        <p class="colophon-meta" style="margin-top: .8rem">
          <span>{{ site.subtitle || site.description }}</span>
        </p>
      </div>

      <div class="colophon-right">
        <p class="colophon-meta" style="gap: 1rem">
          <AppLink
            v-for="item in theme.social"
            :key="item.label"
            class="link"
            :to="item.href"
          >
            {{ item.label }}
          </AppLink>
        </p>
        <p class="colophon-meta">
          <!-- 天数和年份取决于「今天」，构建时和访问时不是同一天，
               所以只在客户端算，免得 hydration 对不上 -->
          <ClientOnly>
            <span>已持续 {{ days }} 天</span>
          </ClientOnly>
          <span>{{ count }} 篇</span>
          <ClientOnly>
            <span>© {{ year }}</span>
          </ClientOnly>
        </p>
        <p class="colophon-meta colophon-note">
          <span>{{ theme.footer.note }}</span>
          <a v-if="theme.footer.beian" class="link" href="https://beian.miit.gov.cn/" rel="noopener">
            {{ theme.footer.beian }}
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
