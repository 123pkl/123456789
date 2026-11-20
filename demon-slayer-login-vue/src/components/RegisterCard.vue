<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerAccount } from '../utils/accounts.js'

const router = useRouter()

const card = ref(null)
const name = ref('')
const password = ref('')
const confirm = ref('')
const breath = ref('')
const agree = ref(false)
const loading = ref(false)
const shaking = ref(false)
const errorMsg = ref('')

const breaths = [
  { value: '日之呼吸', label: '日之呼吸 · 火之神神乐' },
  { value: '水之呼吸', label: '水之呼吸 · 流畅如波' },
  { value: '雷之呼吸', label: '雷之呼吸 · 迅捷如电' },
  { value: '炎之呼吸', label: '炎之呼吸 · 烈焰灼灼' },
  { value: '虫之呼吸', label: '虫之呼吸 · 蝶舞纷飞' },
  { value: '风之呼吸', label: '风之呼吸 · 疾风骤起' },
  { value: '岩之呼吸', label: '岩之呼吸 · 坚如磐石' },
  { value: '音之呼吸', label: '音之呼吸 · 声震四方' }
]

// 成功遮罩
const success = ref(false)

function shake() {
  shaking.value = false
  void card.value?.offsetWidth
  shaking.value = true
  setTimeout(() => (shaking.value = false), 400)
}

async function handleRegister() {
  errorMsg.value = ''
  if (!name.value.trim() || !password.value || !confirm.value || !breath.value || !agree.value) {
    errorMsg.value = '请填写完整信息并同意队规'
    shake()
    return
  }
  if (password.value !== confirm.value) {
    errorMsg.value = '两次输入的口令不一致'
    shake()
    return
  }
  loading.value = true
  const res = await registerAccount({ name: name.value, password: password.value, breath: breath.value })
  loading.value = false
  if (!res.ok) {
    errorMsg.value = res.msg
    shake()
    return
  }
  success.value = true
}

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="card register-card" ref="card" :class="{ shake: shaking }">
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
      <div class="tag">鬼杀队 · 队员登记</div>
    </div>

    <div class="divider">申 请 入 队</div>

    <form @submit.prevent="handleRegister">
      <div class="field">
        <label for="rname">队 员 名 号</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>
          <input id="rname" v-model="name" type="text" placeholder="为自己取一个名号" autocomplete="username">
          <span class="line"></span>
        </div>
      </div>

      <div class="field">
        <label for="rpass">日 轮 刀 口 令</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          <input id="rpass" v-model="password" type="password" placeholder="至少 6 位口令" autocomplete="new-password">
          <span class="line"></span>
        </div>
      </div>

      <div class="field">
        <label for="rconfirm">确 认 口 令</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6L9 17l-5-5"/></svg>
          <input id="rconfirm" v-model="confirm" type="password" placeholder="再次输入口令" autocomplete="new-password">
          <span class="line"></span>
        </div>
      </div>

      <div class="field">
        <label for="rbreath">呼 吸 流 派</label>
        <div class="input-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M5 7c0 4 14 6 14 10M19 7c0 4-14 6-14 10"/></svg>
          <select id="rbreath" v-model="breath" class="select-input">
            <option value="" disabled>选择你的呼吸流派</option>
            <option v-for="b in breaths" :key="b.value" :value="b.value">{{ b.label }}</option>
          </select>
          <span class="line"></span>
        </div>
      </div>

      <div class="row agree-row">
        <label class="remember"><input type="checkbox" v-model="agree"> 我已阅读并遵守鬼杀队队规</label>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="btn" type="submit">
        <span>{{ loading ? '鉴 定 中 …' : '缔 结 队 籍' }}</span>
      </button>
    </form>

    <div class="signup">已有队籍？<router-link to="/login">返回登录</router-link></div>
    <div class="footnote">— 全集中 · 常中 · 呼吸 —</div>

    <!-- 注册成功遮罩 -->
    <Teleport to="body">
      <div class="overlay" :class="{ show: success }">
        <div class="seal">籍</div>
        <h2>队籍缔结完成</h2>
        <p>{{ name }}，自今日起你便是鬼杀队的一员。愿你的呼吸，永不紊乱。</p>
        <button @click="goLogin">前 往 登 录</button>
      </div>
    </Teleport>
  </div>
</template>
