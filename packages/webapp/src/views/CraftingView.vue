<script setup lang="ts">

import {onMounted, ref} from "vue";
import {getFightChicken, getItems} from "@/api/client";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const items = ref([])

onMounted(async () => {
  getItems({
    query: {
      skill: "weaponcrafting",
      level: 30
    }
  }).then((data) => {
    items.value = data.data
  })
})

</script>

<template>
  <h1>Crafting</h1>

  <DataTable :value="items">
    <Column field="name" header="Name"/>
    <Column field="level" header="Level"/>
    <Column field="description" header="Description"/>

  </DataTable>
<!--  <pre>-->
<!--    {{ items }}-->
<!--  </pre>-->
</template>

<style scoped>

</style>
