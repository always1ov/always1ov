<script lang="ts" setup>
defineProps<{
  /** 两位编号，比如 '01' */
  n: string
  title: string
}>()
</script>

<template>
  <div class="section-label">
    <span class="n">{{ n }}</span>
    <span>{{ title }}</span>
  </div>
</template>
