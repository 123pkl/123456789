# ⚡ 给 AI 的启动速查手册（每次开机先看这里）

> 这份文件是写给 AI 助手看的。电脑每次开机重置，node_modules 和 target 会被删除。
> 不要再花时间探查环境、不要再推理，直接按本文件操作即可。

---

## 一、项目全景（3 句话）

1. 这是**鬼灭之刃主题的登录/注册系统**，前后端分离。
2. **前端**：Vue 3 + Vite，路径 `C:\Users\Administrator\Desktop\demon-slayer-login-vue`，端口 **5173**。
3. **后端**：Spring Boot 3.4.5 + MyBatis-Plus + MySQL 8，路径 `D:\workSpace\springBootTest`，端口 **8081**。

## 二、最重要的结论（别再重复验证）

- **`mvn` 不在 PATH**！但在 PATH 里的有 `node`/`npm`（在 workbuddy 隔离目录）。
  - 后端构建必须用项目自带的 `mvnw.cmd`（Maven Wrapper），不要用 `mvn`。
- **有环境变量会把端口顶成随机值（如 54970）**，所以启动后端必须带 `--server.port=8081`。
- **每次开机 node_modules、target 都会被删**，所以脚本必须先重建再启动：
  - 后端：`mvnw.cmd clean package` 重建 target → 再 `java -jar`
  - 前端：`npm install` 重建 node_modules → 再 `npm run dev`
- **bash 调用 mvnw 会报 classworlds 错误**，必须用 PowerShell 或直接双击 bat。
- **本机 MySQL**：`localhost:3306`，用户 `root`，密码 `123456`，库 `kimetsu_db`，表 `t_user`。
- 数据库通常能跨重置保留；若表丢失，执行 `sql\kimetsu_db.sql` 重建（幂等，含 3 个演示账号）。

## 三、一键启动（用户下次说"启动项目"就做这一步）

直接双击以下 bat（正文为纯 ASCII，GBK/UTF-8 下都不会乱码；内部基本为相对路径，`cd /d %~dp0` 定位）：

```
D:\workSpace\springBootTest\一键启动前后端.bat
```

它会：先后端（打包+启动 8081）→ 等 20 秒 → 前端（装依赖+启动 5173）。
前后端日志分别在独立窗口 `鬼灭后端-8081` 和 `鬼灭前端-5173`。

**停止**：双击 `D:\workSpace\springBootTest\一键停止前后端.bat`（按端口 8081/5173 kill 进程）。

**分开控制**（各自目录内）：
- 后端：`D:\workSpace\springBootTest\start-backend.bat` / `stop-backend.bat`
- 前端：`C:\Users\Administrator\Desktop\demon-slayer-login-vue\start-frontend.bat` / `stop-frontend.bat`

## 四、若需手动启动（不用脚本时的确切命令）

后端（PowerShell）：
```powershell
Set-Location "D:\workSpace\springBootTest"
$env:MAVEN_OPTS = "-Dfile.encoding=UTF-8"
.\mvnw.cmd -q -DskipTests clean package
java -Dfile.encoding=UTF-8 -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081
```

前端：
```powershell
Set-Location "C:\Users\Administrator\Desktop\demon-slayer-login-vue"
npm install
npm run dev
```

## 五、自检命令

```bash
curl http://localhost:8081/api/auth/ping     # 期望 {"code":200,"msg":"pong"}
curl http://localhost:5173/                   # 期望 HTTP 200
```

## 六、可用测试账号

| 账号 | 口令 | 来源 |
|---|---|---|
| 炭治郎 或 demo | 任意 | 代码内置演示账号 |
| 灶门祢豆子 | 123456 | SQL 脚本内置 |
| 水柱义勇 | 123456 | SQL 脚本内置 |
| 炎柱炼狱 | 123456 | SQL 脚本内置 |

## 七、接口清单（基础路径 /api/auth）

- `GET /ping` — 健康检查
- `POST /register` — `{name, password, breath}`
- `POST /login` — `{name, password}`

响应格式：`{"code":200, "msg":"...", "data":{...}}`，code=200 为成功。

## 八、关键文件索引

| 文件 | 作用 |
|---|---|
| `pom.xml` | 依赖：web / mybatis-plus 3.5.9 / mysql / lombok / validation |
| `src/main/resources/application.properties` | 数据库连接 + MyBatis-Plus 配置 |
| `sql/kimetsu_db.sql` | 建库建表 + 演示数据 |
| `README-改造说明.md` | 详细改造说明 |
| 前端 `src/utils/accounts.js` | fetch 调后端 /api/auth/* |
| 前端 `vite.config.js` | 代理 /api → localhost:8081 |

## 九、已知的坑（血泪经验）

1. **端口被随机化**：曾遇到 Tomcat 绑定 54970 而非 8081，原因是外部 `SERVER_PORT` 变量。解决：命令行加 `--server.port=8081`（脚本已处理）。
2. **jar 被占用导致 clean 失败**：若旧后端还在跑，`mvnw clean` 删不掉 jar。解决：脚本打包前先按 8081 端口 kill 旧进程（已处理）。
3. **bash 调 mvn**：报 `org.codehaus.plexus.classworlds.launcher.Launcher` 找不到。解决：用 PowerShell 或 bat。
4. **中文 bat 乱码**：已彻底解决——脚本正文改为纯 ASCII（GBK/UTF-8 通用，永不乱码），开头 `chcp 65001`。**切勿再往 bat 里写中文提示**，否则在某些查看器/终端仍会乱码。
5. **工具调用后子进程被清理**：在当前 AI 沙箱里，普通后台进程会随工具调用结束而消失。若用 AI 启动服务做测试，需在**单次调用内**完成"启动→测试→关闭"；用户自己双击 bat 不受此限制。
