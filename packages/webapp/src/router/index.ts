import {createRouter, createWebHistory} from 'vue-router'
import CraftingView from "@/views/CraftingView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CraftingView,
    },
  ],
})

export default router
