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
  min-width: 0;
  height: 100vh;
  overflow: hidden;
  color: #d8e1e7;
  background: rgb(26, 33, 44);
}

.workspace {
  height: 100vh;
  display: grid;
  grid-template-columns: 390px minmax(620px, 1fr) 313px;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgb(26, 33, 44);
}

@media (max-width: 1440px) {
  .workspace {
    grid-template-columns: 320px minmax(560px, 1fr) 260px;
  }
}

@media (max-width: 1200px) {
  .workspace {
    grid-template-columns: 260px minmax(420px, 1fr) 240px;
  }
}
</style>
