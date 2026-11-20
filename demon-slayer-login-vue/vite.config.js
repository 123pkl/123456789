import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 代理 /api 到 Spring Boot 后端，避免跨域（后端同时配置了 CORS 兜底）
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  // 构建后若用同源部署（前后端一起打包），可按需开启 base
  build: {
    outDir: 'dist'
  }
})
