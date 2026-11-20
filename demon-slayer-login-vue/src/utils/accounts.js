/**
 * 账号接口封装 —— 连接 Spring Boot 后端
 * 后端基础地址：http://localhost:8081（dev 环境），通过 Vite 代理 /api 转发。
 * 所有函数均为异步，返回统一的 { ok, msg, account } 结构。
 */

const API_BASE = '/api/auth'

// 演示账号：始终可用，方便未注册时体验登录流程
export const DEMO_ACCOUNT = {
  id: 'demo',
  name: '灶门炭治郎',
  breath: '日之呼吸',
  demo: true
}

/** 统一的请求方法 */
async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`服务器响应异常 (${res.status})`)
  return res.json()
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
 * 登录校验（调用后端 /api/auth/login）
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
      setSession(account)
      return { ok: true, msg: result.msg || '登录成功', account }
    }
    return { ok: false, msg: result.msg || '登录失败' }
  } catch (e) {
    return { ok: false, msg: '无法连接服务器，请确认后端已启动' }
  }
}

/** 演示账号一键登录（纯前端，无需请求后端） */
export function loginDemo() {
  setSession(DEMO_ACCOUNT)
  return { ok: true, account: DEMO_ACCOUNT }
}

function setSession(account) {
  try {
    localStorage.setItem('kimetsu_session_v1', JSON.stringify(account))
  } catch { /* 忽略隐私模式下的存储异常 */ }
}

export function getSession() {
  try {
    const raw = localStorage.getItem('kimetsu_session_v1')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  try { localStorage.removeItem('kimetsu_session_v1') } catch { /* ignore */ }
}

/** 兼容保留：登录页曾用于判断是否显示注册提示，现固定返回 0 */
export function registeredCount() {
  return 0
}
