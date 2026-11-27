# ⚡ 给 AI 的启动速查手册（2026-11-27 已按实物重写）

> **重要**：历史版本曾描述一套「MySQL + JWT + 限流 + sql 脚本」的完整后端，
> 经 2026-11-27 实测，该后端在本机磁盘上**并不存在**（无 jdbc/mysql 依赖、
> 无数据源配置、无 sql 脚本、无 AuthController/JwtUtil/RateLimiter 源码）。
> 勿再引用旧描述。本版每一行都对应当前真实代码。

---

## 一、项目全景

- **类型**：鬼灭之刃主题的登录 / 注册系统，前后端分离。
- **前端**：Vue 3 + Vite，源码 `demon-slayer-login-vue/`，端口 **5173**。
- **后端**：Spring Boot 3.4.5（Java 17 目标，本机 JDK 21），源码在
  `D:\workSpace\springBootTest`，端口 **8081**，`--server.port=8081` 必须带。
  - ⚠️ 后端源码**不在** `123456789` 项目根目录里；根目录那个 `pom.xml` / `src`
    只是空的 demo 壳（`spring.application.name=demo`，无任何接口），别去启动它。
- **持久化**：账号存 **JSON 文件** `D:\workSpace\springBootTest\data\kimetsu_users.json`，
  重启不丢。**不是 MySQL**。文件不存在时首次启动自动 seed 4 个预置账号。
- MySQL 3306 本机虽有服务在跑，但本后端**未连接任何数据库**。

## 一·补、页面串联（登录应用 ↔ 炭治郎战斗页）

- **战斗页**：项目根目录 `tanjiro-battle.html`，独立单文件 HTML（自带 CSS/JS，全屏呼吸特效），**不复制**。
  由 `vite.config.js` 里的 `battlePage()` 插件挂到 `/tanjiro-battle.html`：dev 用中间件实时读盘，build 用 `generateBundle` 输出进 `dist/`。
  因此它与登录应用**同源**（都是 `localhost:5173`），能读到同一份 `localStorage` 登录态。
- **登录 → 战场**：登录成功遮罩（含演示账号）新增「拔刀 · 进入战场」按钮 → `window.location.href='/tanjiro-battle.html'`（`LoginCard.vue` 的 `enterBattle()`）。
- **战场 → 登录**：战斗页 topbar 显示当前队员名与呼吸流派（读 `kimetsu_session_v1`），
  「← 返回登录 / 退出」按钮清除 `kimetsu_session_v1` + `kimetsu_token_v1` 并跳 `/#/login`。未登录直接打开则显示「未入队 · 体验模式」，可正常浏览特效。
- 本地双击 `tanjiro-battle.html`（`file:` 协议）时，返回按钮回退到 `http://localhost:5173/#/login`。

## 二、一键启动（用户说「启动项目」就做这个）

双击 `一键启动.bat`（正文纯 ASCII，不会乱码）。它会：
杀 8081/5173 旧进程 → `clean package` 重新打包后端 → 启动后端 8081 →
检查前端 node_modules → 启动前端 5173 → 等待 12s → `pause`。

> 后端源码目录在 bat 里写死为 `D:\workSpace\springBootTest`，
> 新增的 `AuthController.java` 在同一个 `src` 下，`clean package` 会一起编进去。

**停止**：双击 `一键停止.bat`（按 8081 / 5173 端口 kill）。

**手动启动（不用脚本时，推荐 PowerShell）**
```powershell
# 后端
Set-Location "D:\workSpace\springBootTest"
$env:MAVEN_OPTS = "-Dfile.encoding=UTF-8"
.\mvnw.cmd -q -DskipTests clean package
java -Dfile.encoding=UTF-8 -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081

# 前端
Set-Location "<项目>\demon-slayer-login-vue"
npm install   # 仅 node_modules 缺失时
npm run dev
```
必须用 PowerShell 跑 `mvnw.cmd`；**bash 调 mvnw 会报 classworlds 错误**。
重打包前先停掉正在运行的 java（否则 Windows 下 jar 被占用，`clean` 删不掉）。

## 三、当前已实现的接口（基础路径 `/api/auth`）

代码位置：`D:\workSpace\springBootTest\src\main\java\com\fenglin\springboottest\AuthController.java`
（2026-11-27 补齐，单文件自包含，**零新增 Maven 依赖**）。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/ping` | 健康检查 → `{"code":200,"msg":"pong"}` |
| POST | `/register` | `{name,password,breath}` → 口令 ≥6 位，名号不可重复 |
| POST | `/login` | `{name,password}` → `data` 含 `token`（JWT，12h） |
| GET | `/me` | Header `Authorization: Bearer <token>` → 当前账号 |

响应统一 `{"code":200,"msg":"...","data":{...}}`，`code=200` 成功、`400` 失败。
另外还有一个教学 demo 控制器 `UserController`（`/user/*`），与登录无关。

## 四、安全特性（均为 JDK 原生实现，未引第三方库）

- **持久化**：`data/kimetsu_users.json`（相对后端工作目录，故必须从该目录启动）。
- **口令**：PBKDF2WithHmacSHA256 + 16 字节随机盐，60000 轮，不明文存储。
- **JWT**：`HmacSHA256` 手写签发 / 校验，12 小时过期；密钥见 `AuthController` 常量。
- **限流**：登录「同 IP + 名号」连续失败 5 次锁 60s；注册同 IP 限流。
- **CORS**：`@CrossOrigin(origins="*")` 兜底；前端走 Vite 代理，正常无需跨域。
- 演示账号 `炭治郎` / `demo` 任意口令可登录（后端特判，返回 `demo:true`）。

## 五、关键文件索引

| 文件 | 作用 |
|---|---|
| 后端 `src/.../AuthController.java` | 4 个接口 + 存储 + JWT + 限流（全部逻辑都在这一个文件） |
| 后端 `data/kimetsu_users.json` | 账号数据（运行时生成，重启不丢） |
| 后端 `src/main/resources/application*.properties` | 仅 `profiles.active=dev` / 端口 / 日志，无数据源 |
| 后端 `pom.xml` | web / thymeleaf / devtools / test，**无 jdbc、无 mysql** |
| 前端 `src/utils/accounts.js` | `/api/auth` 封装、token 存储、`verifySession()` |
| 前端 `vite.config.js` | 代理 `/api` → `http://localhost:8081` |

## 六、自检命令

```bash
curl --noproxy '*' http://localhost:8081/api/auth/ping
curl --noproxy '*' http://localhost:5173/api/auth/ping
curl --noproxy '*' -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" -d '{"name":"灶门炭治郎","password":"123456"}'
```
本机有 `HTTP_PROXY`，`curl localhost` 会被干扰，**必须加 `--noproxy '*'`**。

## 七、测试账号

| 账号 | 口令 |
|---|---|
| `炭治郎` / `demo` | 任意（演示账号） |
| `灶门炭治郎` / `灶门祢豆子` / `水柱义勇` / `炎柱炼狱` | `123456` |

前端还有纯前端的「演示账号一键体验」按钮（`loginDemo()`），不发请求、无 token。

## 八、已知的坑

1. **端口随机化**：必须 `--server.port=8081`；脚本已处理。
2. **jar 被占用**：旧后端运行时 `clean` 删不掉 jar，先按端口 kill 旧进程。
3. **bash 调 mvnw**：报 classworlds 错误，用 PowerShell 或 bat。
4. **中文 bat 乱码**：bat 正文保持纯 ASCII + `chcp 65001`，勿写中文提示。
5. **后台进程被清理**：AI 沙箱里工具启动的后台进程可能随会话消失；
   用户自己双击 bat 启动的独立窗口不受限。
6. **文档与实物不符**：旧版手册描述的 MySQL 版后端不存在，以本版为准。
7. **前端路径**：`vite.config.js` 代理到 8081，直连后端时 CORS 已兜底。
