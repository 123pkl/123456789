<script setup>
import SceneBackground from './components/SceneBackground.vue'
</script>

<template>
  <!-- 全局背景固定不动，页面切换只影响上层卡片 -->
  <SceneBackground />
  <div class="wrap">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
