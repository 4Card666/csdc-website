(() => {
  'use strict';
  const url = window.CSDC_SUPABASE_URL;
  const key = window.CSDC_SUPABASE_PUBLISHABLE_KEY;
  const configured = Boolean(url && key && window.supabase && typeof window.supabase.createClient === 'function');
  const client = configured ? window.supabase.createClient(url, key) : null;
  const $ = (id) => document.getElementById(id);
  const message = (txt, error = false) => { const el = $('auth-message'); if (el) { el.textContent = txt; el.className = 'auth-message ' + (error ? 'auth-error' : 'auth-success'); el.hidden = !txt; } };
  const prettyError = (err) => {
    const msg = String(err?.message || '请求失败，请稍后重试。');
    if (/already registered|already exists/i.test(msg)) return '该邮箱可能已注册，请尝试登录或重置密码。';
    if (/invalid login credentials/i.test(msg)) return '邮箱或密码错误，或者账号尚未完成邮箱验证。';
    if (/email not confirmed/i.test(msg)) return '请先打开邮箱完成验证，再登录。';
    if (/rate limit/i.test(msg)) return '请求过于频繁，请稍后再试。';
    return msg;
  };
  const setBusy = (form, busy) => { const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.disabled = busy; };
  const showConfig = () => message('尚未配置 Supabase：请先在 js/supabase-config.js 中填写 Project URL 和 Publishable Key。', true);
  async function session() { if (!client) return null; const {data,error} = await client.auth.getUser(); return error ? null : data.user; }
  async function refreshNav() {
    const link = document.querySelector('[data-auth-nav]'); if (!link) return;
    const user = await session(); link.textContent = user ? '个人中心' : '登录 / 注册'; link.href = user ? 'account.html' : 'login.html';
  }
  async function profile(user) {
    const {data,error} = await client.from('profiles').select('username, display_name, account_status, role, created_at').eq('id', user.id).single();
    if (error) throw error; return data;
  }
  async function initAccount() {
    if (!$('account-status')) return;
    if (!client) { showConfig(); return; }
    const user = await session();
    if (!user) { window.location.replace('login.html'); return; }
    $('account-email').textContent = user.email || '—';
    $('account-verified').textContent = user.email_confirmed_at ? '已验证' : '未验证';
    try {
      const data = await profile(user);
      $('account-username').textContent = data.username || '—';
      $('account-name').textContent = data.display_name || '—';
      const labels = {pending:'等待管理员审核',approved:'已审核通过',rejected:'审核未通过',suspended:'账号已停用'};
      $('account-status').textContent = labels[data.account_status] || '状态未知';
      $('account-role').textContent = data.role === 'admin' ? '管理员' : '普通用户';
      $('account-note').textContent = data.account_status === 'approved' ? '账号已通过审核。' : data.account_status === 'pending' ? '邮箱验证完成后，仍需等待管理员审核；账号审核与正式车手资格是两回事。' : '如需帮助，请联系 CSDC 管理员。';
    } catch (err) { message('读取用户资料失败：' + prettyError(err), true); $('account-status').textContent = '无法读取'; }
    $('logout-button')?.addEventListener('click', async () => { const {error} = await client.auth.signOut(); if (error) message(prettyError(error),true); else window.location.replace('login.html'); });
  }
  async function initForms() {
    const reg = $('register-form'); const login = $('login-form');
    if (!reg && !login) return;
    if (!client) { showConfig(); reg?.querySelectorAll('input,button').forEach(el=>el.disabled=true); login?.querySelectorAll('input,button').forEach(el=>el.disabled=true); return; }
    if (await session()) { window.location.replace('account.html'); return; }
    reg?.addEventListener('submit', async (ev) => {
      ev.preventDefault(); message('');
      const username = $('reg-username').value.trim(); const displayName = $('reg-name').value.trim();
      const email = $('reg-email').value.trim(); const password = $('reg-password').value;
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) { message('用户名须为 3–24 位英文字母、数字或下划线。',true); return; }
      if (password !== $('reg-confirm').value) { message('两次输入的密码不一致。',true); return; }
      setBusy(reg,true);
      try {
        const {error} = await client.auth.signUp({email,password,options:{emailRedirectTo:new URL('account.html',window.location.href).href,data:{username,display_name:displayName}}});
        if (error) throw error;
        reg.reset(); message('注册请求已提交。请检查邮箱并点击验证链接，验证后登录查看待审核状态。若邮箱已注册，系统也可能返回相同提示。');
      } catch(err) { message(prettyError(err),true); } finally { setBusy(reg,false); }
    });
    login?.addEventListener('submit', async(ev) => {
      ev.preventDefault(); message(''); setBusy(login,true);
      try {
        const {error} = await client.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});
        if(error) throw error; window.location.assign('account.html');
      } catch(err) { message(prettyError(err),true); } finally { setBusy(login,false); }
    });
  }
  document.addEventListener('DOMContentLoaded', () => { refreshNav(); initForms(); initAccount(); });
  window.CSDCAuth = { configured };
})();
