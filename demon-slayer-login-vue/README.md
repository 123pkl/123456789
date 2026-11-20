# 鬼滅の刃 · 鬼杀队登录 / 注册（Vue 3 + Vite）

由单文件 HTML 页面迁移而来的 Vue 项目，视觉风格与交互保持不变，并新增了完整的注册功能。

## 功能

- **登录页** `/login`：账号密码校验、错误提示、演示账号一键体验。
- **注册页** `/register`：名号、口令、确认口令、呼吸流派、队规确认；前端校验（必填、口令长度 ≥6、两次一致）。
- **注册 → 登录闭环**：注册与登录均调用 Spring Boot 后端接口 `/api/auth/register`、`/api/auth/login`，账号数据存入 MySQL（见后端项目 `D:\workSpace\springBootTest`）。
- **前端风格完全保留**：红日、富士山、樱花粒子、毛玻璃卡片等视觉不变。

## 连接后端（重要）

前端依赖后端服务，请先启动后端（Spring Boot，端口 8081），再启动前端：

```bash
# 1. 启动后端：在 D:\workSpace\springBootTest 运行 SpringBootTestApplication
#    并先执行 sql/kimetsu_db.sql 建库

# 2. 启动前端
npm install
npm run dev
```

`vite.config.js` 已配置代理：`/api` → `http://localhost:8081`，无需关心跨域（后端也已配置 CORS）。

可用演示账号：
- `炭治郎` / 任意口令（代码内置）
- `灶门祢豆子` / `123456`（数据库 SQL 脚本内置）

## 目录结构

```
demon-slayer-login-vue/
├── index.html                   # 入口 HTML
├── package.json                 # 项目依赖与脚本
├── vite.config.js               # Vite 配置
├── README.md
└── src/
    ├── main.js                  # 应用入口（挂载路由）
    ├── App.vue                  # 根组件：全局背景 + router-view
    ├── style.css                # 全局样式（原页面 CSS + 注册页补充样式）
    ├── router/
    │   └── index.js             # 路由：/login、/register（hash 模式）
    ├── utils/
    │   └── accounts.js          # 本地账号存储：注册/登录校验/会话
    └── components/
        ├── SceneBackground.vue  # 背景场景：红日/山脉/云纹/星空/樱花与火星粒子
        ├── LoginCard.vue        # 登录卡片
        └── RegisterCard.vue     # 注册卡片
```

## 启动

需要 Node.js 18+。

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 http://localhost:5173）。

## 构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`，路由使用 hash 模式，可直接静态部署。
