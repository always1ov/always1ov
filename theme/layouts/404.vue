<template>
  <TheShell>
    <div class="wrap lost">
      <p class="mono">
        HTTP 404 · 没有这一页
      </p>
      <p class="lost-code">
        4<span class="em">0</span>4
      </p>
      <p style="max-width: 34ch; color: var(--fg-mute); text-wrap: pretty">
        这条路走到头了。可能是链接过期，也可能是我把它挪走了。
      </p>
      <p style="display: flex; gap: .6rem; flex-wrap: wrap; justify-content: center">
        <AppLink class="action action--solid" to="/">
          回首页 <ArrowRight />
        </AppLink>
        <AppLink class="action" to="/posts">
          看看写了什么
        </AppLink>
      </p>
    </div>
  </TheShell>
</template>
