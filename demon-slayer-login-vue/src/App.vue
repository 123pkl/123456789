<script setup>
import { onMounted } from 'vue'
import SceneBackground from './components/SceneBackground.vue'
import { verifySession } from './utils/accounts.js'

// 应用启动时校验会话：token 无效/过期则清除本地登录态
onMounted(() => {
  verifySession()
})
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
