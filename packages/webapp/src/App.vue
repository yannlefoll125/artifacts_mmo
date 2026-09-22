<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ServerHealth from './components/ServerHealth.vue'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>

    <ServerHealth />
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem 0 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}
</style>
