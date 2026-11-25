/**
 * 账号接口封装 —— 连接 Spring Boot 后端
 * 后端基础地址：http://localhost:8081（dev 环境），通过 Vite 代理 /api 转发。
 * 所有函数均为异步，返回统一的 { ok, msg, account } 结构。
 */

const API_BASE = '/api/auth'
const SESSION_KEY = 'kimetsu_session_v1'
const TOKEN_KEY = 'kimetsu_token_v1'

// 演示账号：始终可用，方便未注册时体验登录流程
export const DEMO_ACCOUNT = {
  id: 'demo',
  name: '灶门炭治郎',
  breath: '日之呼吸',
  demo: true
}

/** 统一的请求方法（支持可选 token） */
async function request(path, { method = 'POST', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  if (!res.ok) throw new Error(`服务器响应异常 (${res.status})`)
  return res.json()
}

async function post(path, body) {
  return request(path, { method: 'POST', body })
}

/**
 * 注册账号（调用后端 /api/auth/register）
 * @returns {Promise<{ok:boolean, msg:string, data?:object}>}
 */
export async function registerAccount({ name, password, breath }) {
  const cleanName = (name || '').trim()
  if (!cleanName) return { ok: false, msg: '请填写队员名号' }
  if (!password) return { ok: false, msg: '请填写日轮刀口令' }
  if (password.length < 6) return { ok: false, msg: '口令至少需要 6 位' }
  if (!breath) return { ok: false, msg: '请选择你的呼吸流派' }

  try {
    const result = await post('/register', { name: cleanName, password, breath })
    if (result.code === 200) {
      return { ok: true, msg: result.msg || '登记成功', data: result.data }
    }
    return { ok: false, msg: result.msg || '登记失败' }
  } catch (e) {
    return { ok: false, msg: '无法连接服务器，请确认后端已启动' }
  }
}

/**
 * 登录校验（调用后端 /api/auth/login），成功后保存账号与 JWT token
 * @returns {Promise<{ok:boolean, msg:string, account?:object}>}
 */
export async function loginAccount({ name, password }) {
  const cleanName = (name || '').trim()
  if (!cleanName) return { ok: false, msg: '请填写队员名号' }
  if (!password) return { ok: false, msg: '请填写日轮刀口令' }

  try {
    const result = await post('/login', { name: cleanName, password })
    if (result.code === 200) {
      const account = result.data || {}
      const token = account.token || ''
      // 账号信息不落盘 token，分开存储
      const { token: _t, ...safeAccount } = account
      setSession(safeAccount)
      setToken(token)
      return { ok: true, msg: result.msg || '登录成功', account: safeAccount }
    }
    return { ok: false, msg: result.msg || '登录失败' }
  } catch (e) {
    return { ok: false, msg: '无法连接服务器，请确认后端已启动' }
  }
}

/** 演示账号一键登录（纯前端，无需请求后端，无 token） */
export function loginDemo() {
  setSession(DEMO_ACCOUNT)
  clearToken()
  return { ok: true, account: DEMO_ACCOUNT }
}

/**
 * 校验当前会话：带 token 请求后端 /me。
 * 返回 { ok, account }；token 无效/过期/缺失时清除本地会话。
 * 演示账号（无 token）直接视为有效。
 */
export async function verifySession() {
  const token = getToken()
  if (!token) {
    // 演示账号或已退出
    const cached = getSession()
    return { ok: !!cached, account: cached }
  }
  try {
    const result = await request('/me', { method: 'GET', token })
    if (result.code === 200) {
      setSession(result.data || {})
      return { ok: true, account: result.data }
    }
    clearSession()
    return { ok: false, msg: result.msg || '会话已失效' }
  } catch (e) {
    return { ok: false, msg: '无法连接服务器' }
  }
}

function setSession(account) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(account))
  } catch { /* 忽略隐私模式下的存储异常 */ }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}

function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

/** 同步读取本地会话（不校验有效性；需要校验请用 verifySession） */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

/** 兼容保留：登录页曾用于判断是否显示注册提示，现固定返回 0 */
export function registeredCount() {
  return 0
}
