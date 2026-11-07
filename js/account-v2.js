(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const statusLabels = {pending:'待审核',approved:'已通过',rejected:'已拒绝',revoked:'已撤销',cancelled:'已取消'};
  const date = value => value ? new Date(value).toLocaleString('zh-CN') : '—';
  const text = value => value == null || value === '' ? '—' : String(value);
  const show = (id, value) => { const el = $(id); if(el) el.textContent = value; };
  function note(message, isError=false) {
    const el = $('auth-message'); if (!el) return;
    el.textContent = message;
    el.className = 'auth-message ' + (isError ? 'auth-error' : 'auth-success');
    el.hidden = false;
  }
  function item(lines) {
    const box = document.createElement('div'); box.className = 'account-v2-item';
    lines.forEach((line, i) => {
      const node = document.createElement(i === 0 ? 'strong' : 'small');
      node.textContent = line; box.appendChild(node);
    }); return box;
  }
  function renderList(id, records, empty, map) {
    const root = $(id); if (!root) return;
    root.replaceChildren();
    if (!records.length) { const p=document.createElement('p'); p.className='account-v2-muted'; p.textContent=empty; root.appendChild(p); return; }
    records.forEach(row => root.appendChild(item(map(row))));
  }
  async function init() {
    if (!$('driver-status')) return;
    const config = window.CSDC_SUPABASE_URL && window.CSDC_SUPABASE_PUBLISHABLE_KEY;
    if (!config || !window.supabase?.createClient) { show('driver-status','Supabase 未配置或未加载'); return; }
    const client = window.supabase.createClient(window.CSDC_SUPABASE_URL, window.CSDC_SUPABASE_PUBLISHABLE_KEY);
    const {data:auth,error:authError} = await client.auth.getUser();
    if (authError || !auth?.user) return;
    const user = auth.user;
    const {data:profile,error:profileError} = await client.from('profiles').select('account_status,role').eq('id',user.id).single();
    if (profileError) { show('driver-status','读取账号信息失败'); return; }
    if (profile.role === 'admin' && profile.account_status === 'approved') $('admin-entry').hidden = false;
    const allowed = profile.account_status === 'approved';
    $('profile-change-form').hidden = !allowed;
    $('change-unavailable').hidden = allowed;
    const {data:drivers,error:driverError} = await client.from('drivers').select('driver_status,approved_at,revoked_at').eq('user_id',user.id).limit(1);
    if (driverError) show('driver-status','读取失败：'+driverError.message);
    else if (!drivers?.length) show('driver-status','尚未获得正式车手资格');
    else show('driver-status', statusLabels[drivers[0].driver_status] || text(drivers[0].driver_status));
    async function loadChanges() {
      const {data,error} = await client.from('profile_change_requests').select('field_name,old_value,new_value,status,created_at,rejection_reason').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);
      if(error) { show('change-history','读取失败：'+error.message); return; }
      renderList('change-history',data||[],'暂无资料修改申请',r=>[
        (r.field_name==='username'?'用户名':'显示名称')+'：'+text(r.old_value)+' → '+text(r.new_value),
        '审核状态：'+(statusLabels[r.status]||r.status)+' · 提交时间：'+date(r.created_at),
        ...(r.rejection_reason?['拒绝原因：'+r.rejection_reason]:[])
      ]);
    }
    await loadChanges();
    const {data:registrations,error:regError} = await client.from('registrations').select('event_id,status,created_at,rejection_reason,events(title,event_date)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);
    if(regError) show('registration-history','读取失败：'+regError.message);
    else renderList('registration-history',registrations||[],'暂无分站报名记录',r=>[
      text(r.events?.title||'赛事 '+r.event_id),
      '报名状态：'+(statusLabels[r.status]||r.status)+' · 申请时间：'+date(r.created_at),
      ...(r.rejection_reason?['拒绝原因：'+r.rejection_reason]:[])
    ]);
    $('change-field').addEventListener('change',ev=>{
      $('change-value').value=''; $('change-value').maxLength=ev.target.value==='username'?24:30;
      $('change-value').placeholder=ev.target.value==='username'?'3–24 位英文字母、数字或下划线':'2–30 个字符';
    });
    $('profile-change-form').addEventListener('submit',async ev=>{
      ev.preventDefault();
      const field=$('change-field').value, value=$('change-value').value.trim();
      if(field==='username' && !/^[A-Za-z0-9_]{3,24}$/.test(value)) { note('用户名须为 3–24 位英文字母、数字或下划线。',true); return; }
      if(field==='display_name' && (value.length<2 || value.length>30)) { note('显示名称须为 2–30 个字符。',true); return; }
      const button=$('profile-change-form').querySelector('button[type="submit"]'); button.disabled=true;
      try {
        const {data,error}=await client.rpc('submit_profile_change',{p_field_name:field,p_new_value:value});
        if(error) throw error;
        if(data?.success===false) throw new Error(data.message||'提交失败');
        note('修改申请已提交，等待管理员审核。'); $('change-value').value=''; await loadChanges();
      } catch(err) { note('提交失败：'+(err.message||'未知错误'),true); }
      finally {button.disabled=false;}
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{init().catch(err=>{show('driver-status','加载失败：'+err.message);});});
})();
