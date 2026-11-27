<script setup>
import { ref, onMounted } from 'vue'
import { loginAccount, loginDemo, registeredCount } from '../utils/accounts.js'

const card = ref(null)
const user = ref('')
const pass = ref('')
const remember = ref(false)
const loading = ref(false)
const shaking = ref(false)
const errorMsg = ref('')
const showOverlay = ref(false)
const welcomeText = ref('')
const hasAccounts = ref(false)

onMounted(() => {
  hasAccounts.value = registeredCount() > 0
})

function shake() {
  shaking.value = false
  void card.value?.offsetWidth
  shaking.value = true
  setTimeout(() => (shaking.value = false), 400)
}

async function handleSubmit() {
  if (loading.value) return
  errorMsg.value = ''
  if (!user.value.trim() || !pass.value) {
    errorMsg.value = '请填写名号与口令'
    shake()
    return
  }
  loading.value = true
  const res = await loginAccount({ name: user.value, password: pass.value })
  loading.value = false
  if (!res.ok) {
    errorMsg.value = res.msg
    shake()
    return
  }
  welcomeText.value = `${res.account.name}，你的日轮刀已点燃。愿呼吸不止，刀刃不熄。`
  showOverlay.value = true
}

function handleDemo() {
  const res = loginDemo()
  welcomeText.value = `${res.account.name}，体验模式已开启。愿你斩断一切魑魅魍魉。`
  showOverlay.value = true
}

// 登录成功后进入炭治郎战斗页（Vite 通过 /tanjiro-battle.html 提供，与本项目同源）
function enterBattle() {
  window.location.href = '/tanjiro-battle.html'
}
</script>

<template>
  <div class="card" ref="card" :class="{ shake: shaking }">
    <span class="corner tl"></span><span class="corner tr"></span>
    <span class="corner bl"></span><span class="corner br"></span>

    <div class="brand">
      <div class="crest">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2c1.5 4-2 5-2 9 0 1.6 1.1 2.6 2 3 .6-2 2.4-3.2 2-6 2.6 2 4 4.4 4 7a6 6 0 1 1-12 0c0-3.4 2-6.6 6-9z" fill="#ffe9b8"/>
          <path d="M12 12c.6 2-1 3-1 5a3 3 0 0 0 6 0c0-2-2-4-5-5z" fill="#e63946"/>
        </svg>
      </div>
      <h1>鬼滅の刃</h1>
      <div class="en">Demon Slayer</div>
      <div class="tag">鬼杀队 · 队员登录</div>
    </div>

    <div class="divider">入 队 认 证</div>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label for="user">队 员 番 号 / 昵称</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>
          <input id="user" v-model="user" type="text" placeholder="请输入你的名字" autocomplete="username">
          <span class="line"></span>
        </div>
      </div>

      <div class="field">
        <label for="pass">日 轮 刀 口 令</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          <input id="pass" v-model="pass" type="password" placeholder="请输入口令" autocomplete="current-password">
          <span class="line"></span>
        </div>
      </div>

      <div class="row">
        <label class="remember"><input type="checkbox" v-model="remember"> 保持燃刃状态</label>
        <a href="#" @click.prevent>遗忘口令？</a>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="btn" type="submit">
        <span>{{ loading ? '集 中 中 …' : '点 火 入 队' }}</span>
      </button>
    </form>

    <button type="button" class="btn-demo" @click="handleDemo">⚡ 以炭治郎身份体验</button>

    <div class="signup">尚无队籍？<router-link to="/register">申请加入鬼杀队</router-link></div>
    <div class="footnote">— 全集中 · 常中 · 呼吸 —</div>

    <!-- 登录成功遮罩：Teleport 挂载到 body，避免被卡片的 backdrop-filter 限制为局部定位 -->
    <Teleport to="body">
      <div class="overlay" :class="{ show: showOverlay }">
        <div class="seal">焔</div>
        <h2>欢迎回归，鬼杀队队员</h2>
        <p>{{ welcomeText }}</p>
        <div class="overlay-actions">
          <button class="overlay-primary" @click="enterBattle">拔 刀 · 进 入 战 场</button>
          <button class="overlay-ghost" @click="showOverlay = false">稍 后</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
