import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// 战斗页是项目根目录下的独立单文件 HTML，保持在原位、不复制，避免两份不同步
const BATTLE_HTML = resolve(here, '../tanjiro-battle.html')

/**
 * 把根目录的 tanjiro-battle.html 挂到 /tanjiro-battle.html。
 * - dev：中间件实时读盘（改了战斗页刷新即可生效）
 * - build：作为额外 asset 输出进 dist
 * 与登录应用同源，因此 localStorage 里的登录态可以被战斗页读到。
 */
function battlePage() {
  return {
    name: 'kimetsu-battle-page',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        if (pathname === '/tanjiro-battle.html') {
          try {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(readFileSync(BATTLE_HTML))
          } catch (err) {
            next(err)
          }
          return
        }
        next()
      })
    },
    generateBundle() {
      try {
        this.emitFile({
          type: 'asset',
          fileName: 'tanjiro-battle.html',
          source: readFileSync(BATTLE_HTML)
        })
      } catch (err) {
        this.warn('tanjiro-battle.html 未找到，跳过打包战斗页')
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), battlePage()],
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
