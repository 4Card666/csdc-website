/* CSDC TOP10 历史身份认领（个人中心）。所有身份验证与唯一性限制由数据库 RPC 最终执行。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = $('top10-claim-status');
  if (!status) return;

  const form = $('top10-claim-form');
  const select = $('top10-claim-identity');
  const reason = $('top10-claim-reason');
  const details = $('top10-claim-details');
  const hint = $('top10-claim-identity-hint');
  const feedback = $('top10-claim-feedback');
  const button = $('top10-claim-submit');
  let client = null;
  let currentUserId = null;
  let accountApproved = false;
  let identities = [];
  const labels = {pending:'等待管理员审核',approved:'已批准',rejected:'已拒绝'};
  const dateText = value => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN');
  };
  function announce(text, error=false) {
    feedback.textContent = text;
    feedback.className = 'auth-message ' + (error ? 'auth-error' : 'auth-success');
    feedback.hidden = false;
  }
  function setDetails(rows) {
    details.replaceChildren();
    for (const [label, value] of rows) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label + '：';
      p.append(strong, document.createTextNode(String(value ?? '—')));
      details.append(p);
    }
    details.hidden = rows.length === 0;
  }
  function renderOptions(list) {
    select.replaceChildren();
    const placeholder = new Option('请选择历史车手…', '');
    select.add(placeholder);
    for (const row of list) {
      if (row.is_bound) continue;
      const years = Array.isArray(row.years) && row.years.length
        ? '（' + row.years.join('、') + '）' : '';
      select.add(new Option(row.display_name + years, row.identity_id));
    }
    select.value = '';
    const available = select.options.length - 1;
    hint.hidden = available > 0;
    hint.textContent = available ? '' : '目前没有可以认领的历史身份，请联系管理员核实。';
    button.disabled = available === 0;
    return available;
  }
  async function rpc(name, params) {
    const {data, error} = await client.rpc(name, params);
    if (error) throw error;
    return data;
  }
  async function refresh() {
    form.hidden = true;
    feedback.hidden = true;
    setDetails([]);
    status.textContent = '正在读取 TOP10 身份状态…';
    // Only RPCs: no direct SELECT from RLS-protected TOP10 tables.
    const mine = await rpc('top10_get_my_identity');
    if (!mine?.success) throw new Error('身份状态查询未返回成功结果');
    const state = mine.status;
    if (state === 'bound') {
      status.textContent = '已绑定 TOP10 历史身份';
      const rows = [
        ['历史车手', mine.identity_name || '—'],
        ['绑定时间', dateText(mine.bound_at)],
        ['设备资料编辑', mine.can_edit ? '已具备资格（下一阶段开放编辑入口）' : '账号未通过审核，暂不能编辑']
      ];
      setDetails(rows);
      return;
    }
    if (state === 'pending') {
      status.textContent = '身份认领申请待审核';
      setDetails([
        ['申请身份', mine.identity_name || '—'],
        ['申请时间', dateText(mine.created_at)],
        ['审核状态', labels.pending]
      ]);
      return;
    }
    if (state === 'rejected') {
      status.textContent = '上次身份认领申请未通过';
      setDetails([
        ['申请身份', mine.identity_name || '—'],
        ['审核状态', labels.rejected],
        ['拒绝原因', mine.rejection_reason || '管理员未填写原因'],
        ['审核时间', dateText(mine.reviewed_at)]
      ]);
    } else if (state === 'unclaimed') {
      status.textContent = '当前账号尚未认领 TOP10 历史身份';
    } else if (state === 'approved') {
      // Defensive fallback for a previously approved claim without a binding.
      status.textContent = '申请已批准，正在等待身份绑定确认，请联系管理员';
      setDetails([['申请身份', mine.identity_name || '—']]);
      return;
    } else {
      throw new Error('未知身份状态：' + String(state));
    }
    if (!accountApproved) {
      const text = '账号审核通过后才能申请认领 TOP10 历史身份。';
      status.textContent += '。' + text;
      return;
    }
    identities = await rpc('top10_list_identities');
    if (!Array.isArray(identities)) throw new Error('历史身份列表返回的数据格式不正确');
    renderOptions(identities);
    form.hidden = false;
  }
  async function init() {
    if (!window.CSDC_SUPABASE_URL || !window.CSDC_SUPABASE_PUBLISHABLE_KEY
      || !window.supabase?.createClient) {
      status.textContent = 'Supabase 未配置或尚未加载，请刷新页面。';
      return;
    }
    client = window.CSDCAuth?.client || window.supabase.createClient(
      window.CSDC_SUPABASE_URL, window.CSDC_SUPABASE_PUBLISHABLE_KEY
    );
    const {data:auth, error:authError} = await client.auth.getUser();
    if (authError) throw authError;
    if (!auth?.user) {
      status.textContent = '请先登录后查看历史身份认领功能。';
      return;
    }
    currentUserId = auth.user.id;
    const {data:profile, error:profileError} = await client.from('profiles')
      .select('account_status').eq('id', currentUserId).single();
    if (profileError) throw profileError;
    accountApproved = profile?.account_status === 'approved';
    await refresh();
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!accountApproved || !client || !currentUserId) return;
    const identityId = select.value;
    const claimReason = reason.value.trim();
    if (!identities.some(row => row.identity_id === identityId && !row.is_bound)) {
      announce('请选择尚未绑定的历史车手身份。', true); return;
    }
    if (Array.from(claimReason).length < 5 || Array.from(claimReason).length > 2000) {
      announce('认领理由需要填写 5–2000 个字符。', true); return;
    }
    if (!window.confirm('确认申请认领所选 TOP10 历史身份？提交后将等待管理员审核。')) return;
    button.disabled = true;
    feedback.hidden = true;
    try {
      const result = await rpc('top10_submit_identity_claim', {
        p_identity_id: identityId,
        p_claim_reason: claimReason
      });
      if (!result?.success) throw new Error('服务器没有确认认领申请成功');
      await refresh();
      announce('认领申请已提交，等待管理员审核。');
      reason.value = '';
    } catch (error) {
      announce('提交失败：' + (error?.message || '未知错误') + '。如历史身份刚被绑定，请刷新页面查看最新状态。', true);
    } finally {
      if (!form.hidden) button.disabled = select.options.length <= 1;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
      status.textContent = 'TOP10 身份认领加载失败';
      announce('无法读取身份信息：' + (error?.message || '未知错误'), true);
    });
  });
})();
