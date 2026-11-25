# ⚡ 给 AI 的启动速查手册（2026-11-25 已校正）

> 旧版本手册内容严重过时：路径对不上、描述了一个不存在的"完整后端"。
> 本版基于实际代码与环境重写。**以本版为准，勿信旧描述。**

---

## 一、项目全景

- **类型**：鬼灭之刃主题的登录/注册系统，前后端分离。
- **前端**：Vue 3 + Vite，源码在 `D:\workSpace\123456789\demon-slayer-login-vue`，端口 **5173**。
- **后端**：Spring Boot 3.4.5，源码在 `D:\workSpace\springBootTest`，端口 **8081**。
  - 注意：后端源码**不在**项目根 `123456789` 里（根目录只有个空的 demo 壳）。真正跑的接口在 `D:\workSpace\springBootTest`。
- **数据库**：本机 MySQL 8，`localhost:3306`，用户 `root`，密码 `123456`，库 `kimetsu_db`，表 `t_user`。

## 二、一键启动（用户说"启动项目"就做这个）

直接双击（纯 ASCII 正文，不会乱码）：

```
D:\workSpace\123456789\一键启动.bat
```

它会：杀旧进程 → 重新打包后端 → 启动后端 8081 → 检查/安装前端依赖 → 启动前端 5173。
日志窗口：`Kimetsu-Backend-8081` 和 `Kimetsu-Frontend-5173`。

**停止**：双击 `D:\workSpace\123456789\一键停止.bat`（按 8081/5173 端口 kill）。

## 三、当前已实现的接口（基础路径 /api/auth）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/ping` | 健康检查 → `{"code":200,"msg":"pong"}` |
| POST | `/register` | `{name,password,breath}` |
| POST | `/login` | `{name,password}` → data 含 `token` |
| GET | `/me` | Header `Authorization: Bearer <token>` → 当前账号 |

响应统一格式 `{"code":200,"msg":"...","data":{...}}`，code=200 成功，400 失败。

## 四、安全特性（均已实现并实测）

- **持久化**：账号存 MySQL `t_user`，重启后端不丢。
- **BCrypt**：口令 60 位哈希存储；历史明文口令登录一次后自动升级。
- **JWT**：登录签发 token（12 小时），`/me` 校验；前端 App.vue 启动调 `verifySession()` 校验。
- **限流**：登录同一 IP+名号连续失败 5 次锁 60 秒；注册同一 IP 60 秒最多 5 次。
- 演示账号 `炭治郎`/`demo` 任意口令可登录。

## 五、关键文件索引

| 文件 | 作用 |
|---|---|
| 后端 `pom.xml` | 依赖：web / thymeleaf / jdbc / mysql / spring-security-crypto |
| 后端 `src/main/resources/application.properties` | 数据源 + `app.jwt.secret` |
| 后端 `sql/kimetsu_db.sql` | 建库建表 + 6 个演示账号（幂等） |
| 后端 `.../AuthController.java` | 4 个接口 |
| 后端 `.../JwtUtil.java` | JWT 签发校验（JDK 原生 HMAC-SHA256） |
| 后端 `.../RateLimiter.java` | 登录/注册限流 |
| 前端 `src/utils/accounts.js` | token 存储 + verifySession |
| 前端 `vite.config.js` | 代理 /api → localhost:8081 |

## 六、手动启动（不用脚本时）

后端（PowerShell，避免 bash 调 mvnw 的 classworlds 错误）：
```powershell
Set-Location "D:\workSpace\springBootTest"
$env:MAVEN_OPTS = "-Dfile.encoding=UTF-8"
.\mvnw.cmd -q -DskipTests clean package
java -Dfile.encoding=UTF-8 -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081
```
**必须带 `--server.port=8081`**：有环境变量会把端口顶成随机值。

前端：
```powershell
Set-Location "D:\workSpace\123456789\demon-slayer-login-vue"
npm install   # node_modules 缺失时
npm run dev
```

## 七、自检命令

```bash
curl --noproxy '*' http://localhost:8081/api/auth/ping    # {"code":200,"msg":"pong"}
curl --noproxy '*' -o /dev/null -w "%{http_code}" http://localhost:5173/   # 200
```

注意：本机有 `HTTP_PROXY` 环境变量，`curl localhost` 会被干扰，**必须加 `--noproxy '*'`**。

## 八、测试账号

| 账号 | 口令 |
|---|---|
| 炭治郎 / demo | 任意（演示账号） |
| 灶门炭治郎 / 灶门祢豆子 / 水柱义勇 / 炎柱炼狱 | 123456 |
| 睿 | 未知（来源不明，勿删） |

## 九、已知的坑

1. **端口随机化**：必须 `--server.port=8081`；脚本已处理。
2. **jar 被占用**：旧后端运行时 clean 删不掉 jar；脚本先按端口 kill 旧进程。
3. **bash 调 mvnw**：报 classworlds 错误，用 PowerShell 或 bat。
4. **中文 bat 乱码**：脚本正文纯 ASCII + `chcp 65001`，切勿往 bat 写中文提示。
5. **后台进程被清理**：AI 沙箱里工具启动的后台进程会随会话消失；用户自己双击 bat 不受限。
6. **mysql 客户端字符集**：Windows 默认 gbk，执行含中文的 UTF-8 脚本要加 `--default-character-set=utf8mb4`，否则 collation 冲突（ERROR 1267）。
7. **限流计数 bug（已修）**：初始 `lockUntil=0` 会被误判为"锁已过期"导致计数恒为 1；正确写法 `if (lockUntil > 0 && lockUntil <= now)` 才清零。
