<template>
  <main class="app-shell">
    <section class="workspace">
      <slot name="sidebar"></slot>
      <slot></slot>
      <slot name="inspector"></slot>
    </section>
  </main>
</template>

<style scoped lang="scss">
.app-shell {
  min-width: 75rem;
  height: 100vh;
  overflow: hidden;
  color: #d8e1e7;
  background: rgb(24, 24, 24);
}

.workspace {
  height: 100vh;
  display: grid;
  grid-template-columns: 390px minmax(620px, 1fr) 470px;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgb(24, 24, 24);
}

@media (max-width: 1440px) {
  .workspace {
    grid-template-columns: 320px minmax(560px, 1fr) 390px;
  }
}
</style>
