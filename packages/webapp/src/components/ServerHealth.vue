<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHealth } from '@/api/client'

const status = ref<'checking' | 'ok' | 'unreachable'>('checking')

onMounted(async () => {
  try {
    const { data } = await getHealth()
    status.value = data?.status === 'ok' ? 'ok' : 'unreachable'
  } catch {
    status.value = 'unreachable'
  }
})
</script>

<template>
  <span class="server-health" data-testid="server-health" :data-status="status">
    server: {{ status }}
  </span>
</template>

<style scoped>
.server-health {
  font-size: 0.8rem;
  color: var(--color-text);
}
.server-health[data-status='ok'] {
  color: hsla(160, 100%, 37%, 1);
}
</style>
