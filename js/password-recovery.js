(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const show = (value, isError = false) => {
    const el = $('recovery-message');
    if (!el) return;
    el.textContent = value;
    el.className = 'auth-message ' + (isError ? 'auth-error' : 'auth-success');
    el.hidden = !value;
  };
  const url = window.CSDC_SUPABASE_URL;
  const key = window.CSDC_SUPABASE_PUBLISHABLE_KEY;
  const client = url && key && window.supabase?.createClient ? window.supabase.createClient(url, key) : null;
  const forgot = $('forgot-form');
  const reset = $('reset-form');
  if (!client) { show('Supabase 尚未正确配置，请联系网站管理员。', true); return; }
  const readable = e => {
    const msg = String(e?.message || '请求失败，请稍后重试。');
    if (/rate limit/i.test(msg)) return '请求过于频繁，请稍后再试。';
    if (/expired|invalid.*(token|otp)|otp.*(expired|invalid)/i.test(msg)) return '重置链接已失效或过期，请重新申请。';
    return msg;
  };
  const busy = (form, state) => { const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.disabled = state; };
  forgot?.addEventListener('submit', async ev => {
    ev.preventDefault(); busy(forgot, true); show('');
    try {
      const redirectTo = new URL('reset-password.html', window.location.href).href;
      const { error } = await client.auth.resetPasswordForEmail($('forgot-email').value.trim(), { redirectTo });
      if (error) throw error;
      show('如果邮箱已注册，密码重置邮件将发送到该邮箱。请检查收件箱和垃圾邮件文件夹。');
      forgot.reset();
    } catch (e) { show(readable(e), true); }
    finally { busy(forgot, false); }
  });
  if (!reset) return;
  let recoveryVerified = false;
  let completed = false;
  const initialUrl = new URL(window.location.href);
  const initialHash = new URLSearchParams(initialUrl.hash.slice(1));
  const isRecoveryLink = initialHash.get('type') === 'recovery' || initialUrl.searchParams.get('type') === 'recovery' || initialUrl.searchParams.has('code') || initialUrl.searchParams.has('token_hash');
  const activate = () => {
    if (completed) return;
    recoveryVerified = true;
    reset.hidden = false;
    show('身份验证成功，请输入新密码。');
  };
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) activate();
  });
  (async () => {
    if (!isRecoveryLink) { show('请先从邮箱中的密码重置链接进入本页面。', true); return; }
    // Supabase JS v2 handles the recovery URL fragment or PKCE code automatically.
    const { data, error } = await client.auth.getSession();
    if (error) { show(readable(error), true); return; }
    if (data?.session) activate();
    else show('正在验证密码重置链接。如果长时间没有反应，请重新申请。');
  })();
  reset.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!recoveryVerified) { show('请先通过有效的密码恢复链接验证身份。', true); return; }
    const password = $('reset-password').value;
    if (password !== $('reset-confirm').value) { show('两次输入的密码不一致。', true); return; }
    busy(reset, true); show('');
    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      completed = true;
      reset.hidden = true;
      await client.auth.signOut();
      history.replaceState(null, '', window.location.pathname);
      show('密码修改成功！请返回登录页面，使用新密码登录。');
    } catch (e) { show(readable(e), true); }
    finally { busy(reset, false); }
  });
})();
