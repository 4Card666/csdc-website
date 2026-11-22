/* CSDC 管理后台 · 用户档案总览（只读） */
(() => {
  'use strict';
  let selectedUserId = null;
  let filters = { keyword: '', account: 'all', role: 'all', driver: 'all' };
  const statusNames = {
    pending: '待审核', approved: '已通过', rejected: '已拒绝',
    suspended: '已停用', revoked: '已撤销', draft: '草稿',
    published: '已发布', cancelled: '已取消', closed: '已关闭'
  };
  const n = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const fmt = value => value === undefined || value === null || value === '' ? '—' : String(value);
  const when = value => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? fmt(value) : d.toLocaleString('zh-CN', {hour12:false});
  };
  const status = value => statusNames[value] || (value ? String(value) : '未登记');
  const isActive = () => document.querySelector('#admin-tabs [data-tab].active')?.dataset.tab === 'user-directory';
  const driverState = value => !value ? '网站未登记' : value === 'approved' ? '已认证' : status(value);
  const roleState = value => value === 'admin' ? '管理员' : '普通用户';
  const pill = (label, state) => n('span', 'user-overview-pill ' +
    (state === 'approved' ? 'is-ok' : state === 'rejected' || state === 'suspended' || state === 'revoked' ? 'is-bad' : state === 'pending' ? 'is-warn' : ''), label);
  function identity(user, compact=false) {
    const row = n('div', 'user-overview-person' + (compact ? ' compact' : ''));
    const avatar = n('span', 'user-overview-avatar', Array.from(user.display_name || user.username || '?')[0] || '?');
    avatar.setAttribute('aria-hidden','true');
    const info = n('div', 'user-overview-person-info');
    info.append(n('strong', 'user-overview-nickname', user.display_name || user.username || '未设置昵称'));
    info.append(n('span', 'user-overview-username', '@' + (user.username || '未知用户名')));
    row.append(avatar, info);
    return row;
  }
  function section(title) {
    const s = n('section', 'user-overview-detail-section');
    s.append(n('h3', '', title));
    return s;
  }
  function rows(entries) {
    const list = n('dl', 'user-overview-kv');
    for (const [label, value] of entries) {
      list.append(n('dt', '', label), n('dd', '', fmt(value)));
    }
    return list;
  }
  function arraySection(title, records, rowFn, empty='暂无记录') {
    const s = section(title);
    if (records === null) {
      s.append(n('p', 'user-overview-note', '该类记录暂未接入当前数据库版本。'));
      return s;
    }
    if (!Array.isArray(records) || !records.length) {
      s.append(n('p', 'user-overview-note', empty));
      return s;
    }
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const detail = n('details', 'user-overview-record');
      const summary = n('summary', '', rowFn(rec, true, i));
      detail.append(summary, rows(rowFn(rec, false, i)));
      if (rec.source_record) {
        const raw = n('details','user-overview-raw');
        raw.append(n('summary','','查看原始业务字段'), n('pre','',JSON.stringify(rec.source_record,null,2)));
        detail.append(raw);
      }
      s.append(detail);
    }
    return s;
  }
  function showDetail(root, client, userId, fallback) {
    const loading = n('div', 'user-overview-loading', '正在读取完整用户档案…');
    root.replaceChildren(loading);
    return client.rpc('admin_get_user_profile_detail',{p_user_id:userId}).then(({data,error}) => {
      if (error) throw error;
      if (selectedUserId !== userId || !root.isConnected || !isActive()) return;
      const detail = data || {};
      const account = detail.account || fallback || {};
      const wrap = n('div','user-overview-detail');
      const back = n('button','admin-btn','返回账号列表');back.type='button';
      back.addEventListener('click',()=>{selectedUserId=null;document.querySelector('#admin-tabs [data-tab="user-directory"]')?.click();});
      wrap.append(back,identity({username:account.username,display_name:account.nickname},false));
      const statuses = n('div','user-overview-pills');
      statuses.append(pill('账号：'+status(account.account_status),account.account_status));
      statuses.append(pill('权限：'+roleState(account.role),account.role === 'admin' ? 'approved' : ''));
      statuses.append(pill('车手：'+driverState(detail.driver?.status),detail.driver?.status));
      wrap.append(statuses);
      const basic = section('基本账号资料');
      basic.append(rows([
        ['用户 ID', account.id],['用户名',account.username],['昵称',account.nickname],
        ['注册时间',when(account.registered_at)],['登录邮箱',account.email],
        ['邮箱验证时间',when(account.email_confirmed_at)],['最近登录时间',when(account.last_login_at)],['账号审核',status(account.account_status)],
        ['管理员权限',roleState(account.role)],['账号审核拒绝原因',account.rejection_reason]
      ])); wrap.append(basic);
      const driver = section('正式车手身份');
      driver.append(rows([
        ['网站认证状态',driverState(detail.driver?.status)],
        ['资格授予时间',when(detail.driver?.approved_at)],
        ['资格撤销时间',when(detail.driver?.revoked_at)]
      ]));
      driver.append(n('p','user-overview-note','网站未登记仅代表数据库中没有该账号的车手资格记录，不等于现实中没有获得 CSDC 认证。'));
      wrap.append(driver);
      const num = arraySection('各赛季正式车号',detail.season_numbers,(r,summary)=> summary
        ? `${fmt(r.season)} · ${fmt(r.driver_number)}`
        : [['赛季',r.season],['正式车号',r.driver_number],['赛季 ID',r.season_id]]);
      wrap.append(num);
      wrap.append(arraySection('赛季车号申请记录',detail.number_requests,(r,summary)=> summary
        ? `${fmt(r.season)} · ${fmt(r.driver_number)} · ${status(r.status)}`
        : [['赛季',r.season],['申请号码',r.driver_number],['审核状态',status(r.status)],['申请时间',when(r.created_at)],['审核时间',when(r.reviewed_at)],['拒绝原因',r.rejection_reason]]));
      wrap.append(arraySection('分站赛事报名记录',detail.registrations,(r,summary)=> summary
        ? `${fmt(r.event)} · ${status(r.status)}`
        : [['分站赛事',r.event],['赛事日期',when(r.event_date)],['报名状态',status(r.status)],['申请时间',when(r.created_at)],['拒绝原因',r.rejection_reason]]));
      wrap.append(arraySection('车辆数据审核记录',detail.vehicle_reviews,(r,summary)=> summary
        ? `${fmt(r.event)} · ${status(r.review_status)}`
        : [['赛事',r.event],['审核状态',status(r.review_status)],['AERO',r.aero],['Drivetrains',r.drivetrains],['Engines',r.engines],['Fuel Placement',r.fuel_placement],['Physics',r.physics],['拒绝原因',r.rejection_reason]]));
      const top = section('TOP10 历史身份与资料');
      if (detail.top10) {
        top.append(rows([
          ['历史身份',detail.top10.identity_name],['身份 ID',detail.top10.identity_id],
          ['账号绑定时间',when(detail.top10.bound_at)],
          ['入选年度', (detail.top10.years||[]).map(y=>`${y.year} 年 #${y.rank}（${y.points} 分）`).join('；') || '—']
        ]));
        const profile = n('details','user-overview-record');
        profile.append(n('summary','','查看当前审核通过的 TOP10 设备资料'),
          n('pre','user-overview-json',detail.top10.approved_profile ? JSON.stringify(detail.top10.approved_profile,null,2) : '暂无设备资料'));
        top.append(profile);
      } else top.append(n('p','user-overview-note','尚未绑定 TOP10 历史身份。'));
      wrap.append(top);
      wrap.append(arraySection('TOP10 身份认领历史',detail.top10_claims,(r,summary)=> summary
        ? `${fmt(r.identity_name)} · ${status(r.status)}`
        : [['历史身份',r.identity_name],['申请状态',status(r.status)],['认领理由',r.claim_reason],['申请时间',when(r.created_at)],['审核时间',when(r.reviewed_at)],['拒绝原因',r.rejection_reason]]));
      wrap.append(arraySection('TOP10 设备资料申请历史',detail.top10_profile_submissions,(r,summary)=> summary
        ? `${status(r.status)} · ${when(r.created_at)}`
        : [['审核状态',status(r.status)],['提交时间',when(r.created_at)],['审核时间',when(r.reviewed_at)],['拒绝原因',r.rejection_reason],['申请资料',JSON.stringify(r.profile_data || {},null,2)]]));
      wrap.append(arraySection('用户名与昵称修改申请',detail.profile_changes,(r,summary)=> summary
        ? `${fmt(r.field_name || '资料变更')} · ${status(r.status)}`
        : [['修改字段',r.field_name],['旧值',r.old_value],['新值',r.new_value],['审核状态',status(r.status)],['申请时间',when(r.created_at)],['拒绝原因',r.rejection_reason]]));
      wrap.append(arraySection('管理员相关操作记录（最近 50 条）',detail.operation_logs,(r,summary)=> summary
        ? `${fmt(r.action)} · ${when(r.created_at)}`
        : [['操作类型',r.action],['发生时间',when(r.created_at)],['操作管理员 ID',r.admin_id],['操作详情',JSON.stringify(r.details || {},null,2)]]));
      wrap.append(n('p','user-overview-note','本页只读。修改账号、车手资格及审核结果仍请使用原有专门管理模块；为保护账号安全，不展示密码、验证码或会话令牌。'));
      root.replaceChildren(wrap);
    }).catch(error => {
      if (selectedUserId !== userId || !root.isConnected || !isActive()) return;
      root.replaceChildren();
      const back = n('button','admin-btn','返回账号列表');back.type='button';
      back.addEventListener('click',()=>{selectedUserId=null;document.querySelector('#admin-tabs [data-tab="user-directory"]')?.click();});
      root.append(back,n('p','admin-empty','读取档案失败：'+(error.message || '未知错误')+'。请确认已执行 CSDC-user-directory-readonly.sql。'));
    });
  }
  async function render(root, client, dashboard) {
    if (selectedUserId) {
      const user = (dashboard?.users||[]).find(u=>u.id===selectedUserId);
      return showDetail(root,client,selectedUserId,user);
    }
    root.replaceChildren(n('p','user-overview-loading','正在读取完整注册账号列表…'));
    const {data:directory,error} = await client.rpc('admin_list_user_directory',{});
    if(error)throw error;
    if(!isActive())return;
    const allUsers = Array.isArray(directory) ? directory : [];
    const wrap = n('section','user-overview');
    wrap.append(n('h2','','用户档案总览'));
    wrap.append(n('p','user-overview-note','查看所有已注册账号的真实审核状态、权限与身份。昵称为主要名称，@ 后为用户名；此页面不会修改任何账号数据。'));
    const toolbar=n('div','user-overview-toolbar');
    const search=n('input','',''); search.type='search'; search.placeholder='搜索昵称 / @用户名 / 用户 ID';
    search.value=filters.keyword; search.setAttribute('aria-label','搜索用户');
    const choices = [
      ['account','账号审核',[['all','全部账号'],['approved','已通过'],['pending','待审核'],['rejected','已拒绝'],['suspended','已停用']]],
      ['role','管理员权限',[['all','所有权限'],['admin','管理员'],['user','普通用户']]],
      ['driver','车手资格',[['all','所有车手状态'],['approved','已认证'],['pending','待审核'],['revoked','已撤销'],['none','网站未登记']]]
    ];
    toolbar.append(search);
    const sels=[];
    for(const [field,label,options] of choices){
      const sel=n('select');sel.setAttribute('aria-label',label);
      for(const [value,text] of options)sel.append(new Option(text,value));
      sel.value=filters[field]; sels.push([field,sel]);toolbar.append(sel);
    }
    wrap.append(toolbar);
    const count=n('p','user-overview-count'); const list=n('div','user-overview-list');
    wrap.append(count,list);
    const users=allUsers;
    const drivers = new Map(allUsers.map(u=>[u.id,{driver_status:u.driver_status}]));
    const draw=()=>{
      const keyword=filters.keyword.toLowerCase().trim().replace(/^@/,'');
      const records=users.filter(u=>{
        const d=drivers.get(u.id);
        if(keyword && ![u.username,u.display_name,u.id].some(x=>String(x||'').toLowerCase().includes(keyword)))return false;
        if(filters.account!=='all' && u.account_status!==filters.account)return false;
        if(filters.role!=='all' && (u.role==='admin'?'admin':'user')!==filters.role)return false;
        if(filters.driver!=='all' && (d?.driver_status||'none')!==filters.driver)return false;
        return true;
      });
      count.textContent=`显示 ${records.length} / ${users.length} 个已注册账号`;
      list.replaceChildren();
      if(!records.length){list.append(n('p','admin-empty','没有符合条件的账号。'));return;}
      for(const u of records){
        const c=n('article','user-overview-card');
        c.append(identity(u,true));
        const states=n('div','user-overview-pills');
        const driver=drivers.get(u.id);
        states.append(pill('账号：'+status(u.account_status),u.account_status));
        states.append(pill('权限：'+roleState(u.role),u.role==='admin'?'approved':''));
        states.append(pill('车手：'+driverState(driver?.driver_status),driver?.driver_status));
        c.append(states);
        const bottom=n('div','user-overview-bottom');
        bottom.append(n('small','','注册：'+when(u.created_at)));
        const btn=n('button','admin-btn','查看完整档案');btn.type='button';
        btn.addEventListener('click',()=>{selectedUserId=u.id;showDetail(root,client,u.id,u);});
        bottom.append(btn);c.append(bottom);list.append(c);
      }
    };
    search.addEventListener('input',()=>{filters.keyword=search.value;draw();});
    for(const [field,sel] of sels)sel.addEventListener('change',()=>{filters[field]=sel.value;draw();});
    draw(); root.replaceChildren(wrap);
  }
  window.CSDCUserDirectory = { render, setTargetUser(id){selectedUserId=id||null;} };
})();
