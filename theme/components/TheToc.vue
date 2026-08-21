<script lang="ts" setup>
import { runContentUpdated, useOutline } from 'valaxy'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const { headers, handleClick } = useOutline()
const active = ref('')

let observer: IntersectionObserver | undefined

/** 当前正在读的那一节：视口上部三成的区域里，最靠前的那个标题。 */
function observe() {
  observer?.disconnect()
  const targets = [...document.querySelectorAll<HTMLElement>('.markdown-body :is(h2, h3)[id]')]
  if (!targets.length)
    return

  const visible = new Set<string>()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting)
        visible.add(entry.target.id)
      else
        visible.delete(entry.target.id)
    }
    active.value = targets.find(t => visible.has(t.id))?.id ?? active.value
  }, { rootMargin: '-10% 0px -70% 0px' })

  targets.forEach(t => observer!.observe(t))
}

onMounted(async () => {
  // 目录被包在 ClientOnly 里，挂载时机晚于 ValaxyMd，
  // 那一次 runContentUpdated 已经过去了——所以自己再触发一次，否则永远抓不到标题。
  await nextTick()
  runContentUpdated()
  setTimeout(observe, 60)
})
onUnmounted(() => observer?.disconnect())

const isActive = (link: string) => decodeURIComponent(link.replace('#', '')) === active.value
</script>

<template>
  <aside v-if="headers.length > 1" class="toc" aria-label="本页目录">
    <p class="toc-title">目录</p>
    <ul>
      <template v-for="header in headers" :key="header.link">
        <li>
          <a :href="header.link" :data-active="String(isActive(header.link))" @click="handleClick">
            {{ header.title }}
          </a>
        </li>
        <li v-for="child in header.children" :key="child.link">
          <a class="lv3" :href="child.link" :data-active="String(isActive(child.link))" @click="handleClick">
            {{ child.title }}
          </a>
        </li>
      </template>
    </ul>
  </aside>
</template>
