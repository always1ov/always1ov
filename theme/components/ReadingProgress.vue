<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

const scale = ref(0)

function update() {
  const doc = document.documentElement
  const span = doc.scrollHeight - innerHeight
  scale.value = span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 0
}

onMounted(() => {
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  update()
})

onUnmounted(() => {
  removeEventListener('scroll', update)
  removeEventListener('resize', update)
})
</script>

<template>
  <div class="progress" :style="{ transform: `scaleX(${scale})` }" />
</template>
