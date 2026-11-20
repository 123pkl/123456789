<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const stars = ref('')
const canvasEl = ref(null)

let raf = 0
let onResize = null

onMounted(() => {
  // 星空
  let starHtml = ''
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 100
    const y = Math.random() * 70
    const s = Math.random() * 1.6 + 0.3
    const o = Math.random() * 0.6 + 0.2
    const d = (Math.random() * 4 + 2).toFixed(1)
    starHtml += `<span style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:#fff;opacity:${o};animation:tw ${d}s ease-in-out infinite alternate"></span>`
  }
  stars.value = starHtml

  // 粒子动画
  const cv = canvasEl.value
  const ctx = cv.getContext('2d')
  const petals = []
  const sparks = []
  let w, h, dpr

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = cv.clientWidth
    h = cv.clientHeight
    cv.width = w * dpr
    cv.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  onResize = resize
  window.addEventListener('resize', resize)
  resize()

  function newPetal() {
    return {
      x: Math.random() * w, y: -20 - Math.random() * h * 0.4,
      s: 6 + Math.random() * 8,
      vy: 0.5 + Math.random() * 0.9, vx: -0.3 + Math.random() * 0.9,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      color: Math.random() > 0.45 ? 'rgba(244,190,205,' : 'rgba(230,120,140,'
    }
  }
  function newSpark() {
    return {
      x: Math.random() * w, y: h + 10,
      s: 1 + Math.random() * 2.2,
      vy: -0.4 - Math.random() * 1.1, vx: -0.25 + Math.random() * 0.5,
      life: 1, decay: 0.003 + Math.random() * 0.004
    }
  }
  for (let i = 0; i < 46; i++) { const p = newPetal(); p.y = Math.random() * h; petals.push(p) }
  for (let i = 0; i < 26; i++) { const s = newSpark(); s.y = Math.random() * h; sparks.push(s) }

  function drawPetal(p) {
    ctx.save()
    ctx.translate(p.x, p.y); ctx.rotate(p.rot)
    ctx.fillStyle = p.color + (0.55 + 0.25 * Math.sin(p.sway)) + ')'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(p.s * 0.55, -p.s * 0.4, p.s, -p.s * 0.1, 0, p.s)
    ctx.bezierCurveTo(-p.s, -p.s * 0.1, -p.s * 0.55, -p.s * 0.4, 0, 0)
    ctx.fill()
    ctx.restore()
  }
  function drawSpark(s) {
    const a = s.life
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s * 5)
    g.addColorStop(0, `rgba(255,220,150,${a})`)
    g.addColorStop(0.4, `rgba(230,90,50,${a * 0.7})`)
    g.addColorStop(1, 'rgba(200,16,46,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 5, 0, Math.PI * 2); ctx.fill()
  }
  function loop() {
    ctx.clearRect(0, 0, w, h)
    petals.forEach((p, i) => {
      p.sway += 0.02; p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * 0.5; p.rot += p.vr
      drawPetal(p)
      if (p.y > h + 30 || p.x < -40 || p.x > w + 40) petals[i] = newPetal()
    })
    sparks.forEach((s, i) => {
      s.y += s.vy; s.x += s.vx + Math.sin(s.y * 0.02) * 0.2; s.life -= s.decay
      drawSpark(s)
      if (s.life <= 0 || s.y < -20) sparks[i] = newSpark()
    })
    raf = requestAnimationFrame(loop)
  }
  loop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="scene">
    <div class="sky"></div>
    <div class="stars" v-html="stars"></div>
    <div class="sun"></div>

    <!-- 云纹 -->
    <svg class="clouds" viewBox="0 0 1200 300" preserveAspectRatio="none">
      <g fill="none" stroke="#f6e3a1" stroke-width="2">
        <path d="M-50 210 q60 -40 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0"/>
        <path d="M-50 240 q60 -34 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0"/>
        <path d="M-50 180 q80 -46 160 0 t160 0 t160 0 t160 0 t160 0 t160 0 t160 0"/>
      </g>
    </svg>

    <!-- 山脉 -->
    <svg class="mountains" viewBox="0 0 1200 500" preserveAspectRatio="none">
      <defs>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a1420"/><stop offset="100%" stop-color="#0b0406"/>
        </linearGradient>
        <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0a0e"/><stop offset="100%" stop-color="#050203"/>
        </linearGradient>
        <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e8c9b6"/><stop offset="100%" stop-color="#7a3b44"/>
        </linearGradient>
      </defs>
      <path fill="url(#far)" d="M0 300 L150 190 L280 270 L400 160 L520 260 L640 120 L760 250 L900 170 L1040 265 L1200 180 L1200 500 L0 500 Z"/>
      <path fill="url(#near)" d="M330 500 L600 175 Q612 160 624 175 L890 500 Z"/>
      <path fill="url(#snow)" opacity=".85" d="M520 258 L600 175 Q612 160 624 175 L704 258 L678 250 L660 266 L640 250 L620 268 L600 248 L580 268 L560 250 L540 266 Z"/>
      <path fill="#050203" d="M0 500 L120 420 L260 480 L400 430 L560 495 L720 440 L880 490 L1040 430 L1200 480 L1200 500 Z"/>
    </svg>

    <div class="pattern"></div>
    <canvas ref="canvasEl"></canvas>
    <div class="vignette"></div>
  </div>
</template>
