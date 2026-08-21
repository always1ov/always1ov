<script lang="ts" setup>
/**
 * 首页。五段式：首屏 → 自述 → 此刻 → 最近在写 → 在别处。
 * 「自述」那一段的正文来自 pages/index.md ——内容归内容，配置归配置。
 */
import { useFrontmatter, useSiteConfig, useSiteStore } from 'valaxy'
import { computed, ref } from 'vue'
import { useAlwaysConfig } from '../composables'

const theme = useAlwaysConfig()
const site = useSiteConfig()
const siteStore = useSiteStore()
const frontmatter = useFrontmatter()

const hero = ref<{ reseed: () => void, seed: number } | null>(null)
const posts = computed(() => siteStore.postList.slice(0, theme.value.homePostCount))
const total = computed(() => siteStore.postList.length)

const wordmark = computed(() => theme.value.wordmark)
const seedLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
})

const socials = computed(() => theme.value.social.filter(s => s.href))
</script>

<template>
  <TheShell>
    <section class="hero">
      <ClientOnly>
        <HeroLine v-if="theme.hero.enable" ref="hero" />
      </ClientOnly>

      <div class="wrap">
        <p class="mono">
          {{ site.subtitle }}
        </p>

        <h1 class="wordmark">
          <span class="word">
            <span
              v-for="(ch, i) in wordmark[0]"
              :key="`a${i}`"
              class="ch"
              :style="{ '--i': i }"
            >{{ ch }}</span>
          </span>
          <span class="dot" aria-hidden="true" />
          <span class="word em">
            <span
              v-for="(ch, i) in wordmark[2]"
              :key="`b${i}`"
              class="ch"
              :style="{ '--i': wordmark[0].length + i }"
            >{{ ch }}</span>
          </span>
        </h1>

        <p class="hero-lede">
          {{ site.description }}
        </p>

        <div class="hero-foot">
          <ClientOnly>
            <p class="seed">
              <span>今日之线 · SEED {{ seedLabel }}</span>
              <button type="button" @click="hero?.reseed()">
                重画
              </button>
            </p>
          </ClientOnly>
          <a class="scroll-cue" href="#about"><i aria-hidden="true" />往下</a>
        </div>
      </div>
    </section>

    <div class="wrap">
      <section id="about" class="section" data-reveal>
        <SectionLabel n="01" title="自述" />
        <div class="section-body">
          <ValaxyMd class="home-intro" :frontmatter="frontmatter">
            <RouterView />
          </ValaxyMd>
          <p style="margin-top: 2rem">
            <AppLink class="action" to="/about">
              完整的关于页 <ArrowRight />
            </AppLink>
          </p>
        </div>
      </section>

      <section v-if="theme.now.items.length" id="now" class="section" data-reveal>
        <SectionLabel n="02" title="此刻" />
        <div class="section-body">
          <dl class="now-list">
            <div v-for="item in theme.now.items" :key="item.label" class="now-item">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.text }}</dd>
            </div>
          </dl>
          <p class="mono" style="margin-top: 1rem">
            更新于 {{ theme.now.updated }}
          </p>
        </div>
      </section>

      <section v-if="posts.length" id="writing" class="section" data-reveal>
        <SectionLabel n="03" title="最近在写" />
        <div class="section-body">
          <div class="rows">
            <PostRow
              v-for="(post, i) in posts"
              :key="post.path"
              :post="post"
              :index="i + 1"
            />
          </div>
          <p style="margin-top: 2rem">
            <AppLink class="action" to="/posts">
              全部 {{ total }} 篇 <ArrowRight />
            </AppLink>
          </p>
        </div>
      </section>

      <section v-if="socials.length" id="elsewhere" class="section" data-reveal>
        <SectionLabel n="04" title="在别处" />
        <div class="section-body">
          <div class="rows">
            <AppLink
              v-for="(item, i) in socials"
              :key="item.label"
              class="row"
              :to="item.href"
            >
              <span class="row-index">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="row-title serif">{{ item.label }}</span>
              <span class="row-meta">{{ item.handle }}</span>
              <span class="row-arrow" aria-hidden="true"><ArrowRight /></span>
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  </TheShell>
</template>
