<script setup lang="ts">

import {onMounted, ref} from "vue";
import {getFightChicken, getItems} from "@/api/client";

const items = ref([])

onMounted(async () => {
    getItems().then((data) => {
      items.value = data.data
    })
})

</script>

<template>
  <h1>Crafting</h1>
  <pre>
    {{ items }}
  </pre>
</template>

<style scoped>

</style>
