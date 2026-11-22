/* CSDC TOP10 administrator: direct bindings and identity-claim review.
   Uses existing SECURITY DEFINER RPCs; does not access protected TOP10 tables directly. */
(() => {
  'use strict';
  let generation = 0;
  let submitting = false;
  let adminUserId = null;
  const $ = id => document.getElementById(id);
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  };
  const when = value => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', {hour12:false});
  };
  const shown = value => value === undefined || value === null || value === '' ? '—' : String(value);
  const statusNames = {pending:'待审核',approved:'已批准',rejected:'已拒绝',suspended:'已停用'};
  const flag = (label, style='') => make('span', 'top10-admin-flag ' + style, label);
  const paragraph = (label, value) => {
    const p = make('p');
    p.append(make('strong','',label + '：'), document.createTextNode(shown(value)));
    return p;
  };
  function button(label, fn, kind='') {
    const b = make('button','admin-btn ' + kind,label);
    b.type = 'button';
    b.addEventListener('click',fn);
    return b;
  }
  function notify(message, error=false) {
    const box = $('admin-message');
    if (!box) return;
    box.textContent = message;
    box.className = 'auth-message ' + (error ? 'auth-error':'auth-success');
    box.hidden = !message;
  }
  async function rpc(client, name, args={}) {
    const {data,error} = await client.rpc(name,args);
    if (error) throw error;
    return data;
  }
  function active(view) {
    return document.querySelector('#admin-tabs [data-tab].active')?.dataset.tab === view;
  }
  async function reviewOrBind(client, view, run, notice) {
    if (submitting) return;
    submitting = true;
    notify('正在处理 TOP10 操作，请稍候…');
    try {
      const result = await run();
      if (result?.success !== true) throw new Error('数据库未确认操作成功');
      notify(notice);
      if (active(view)) await render(view,$('admin-content'),client);
    } catch (error) {
      notify('TOP10 操作失败：' + (error?.message||'未知错误'),true);
    } finally { submitting = false; }
  }
  async function bindAccount(client,view,identity,account,pendingClaims) {
    if (!identity || !account || account.bound_identity_id || adminUserId===account.user_id) return;
    const related = pendingClaims.filter(c => c.identity_id === identity.identity_id || c.user_id === account.user_id);
    let prompt = `确认将 TOP10 历史车手「${identity.identity_name}」绑定至账号「${account.username||account.user_id}」？\n\n绑定后不能通过当前后台直接解除，请核实车手身份。`;
    if (related.length) prompt += `\n\n注意：该操作将自动处理 ${related.length} 条相关的待审核认领申请。`;
    if (!window.confirm(prompt)) return;
    await reviewOrBind(client,view,()=>rpc(client,'top10_admin_bind_account',{
      p_identity_id:identity.identity_id,p_user_id:account.user_id
    }),`已将「${identity.identity_name}」绑定到账号「${account.username||account.user_id}」。`);
  }
  async function reviewClaim(client,view,claim,action) {
    if (!claim || claim.claim_status !== 'pending') return;
    let reason=null;
    if (action==='approve') {
      if (!window.confirm(`确认批准「${claim.username||claim.user_id}」认领「${claim.identity_name}」？\n批准后将建立永久 TOP10 身份绑定。`)) return;
    } else {
      const input=window.prompt(`请输入拒绝「${claim.username||claim.user_id}」认领「${claim.identity_name}」的原因：`);
      if(input===null)return;
      reason=input.trim();
      if(!reason){notify('拒绝申请必须填写原因。',true);return;}
      if(reason.length>2000){notify('拒绝原因过长，请控制在 2000 字以内。',true);return;}
      if (!window.confirm('确认拒绝这条 TOP10 身份认领申请？')) return;
    }
    await reviewOrBind(client,view,()=>rpc(client,'top10_admin_review_claim',{
      p_claim_id:claim.claim_id,p_action:action,p_reason:reason
    }),action==='approve'?'TOP10 身份认领已批准并建立绑定。':'TOP10 身份认领已拒绝。');
  }
  function controls() {
    const row=make('div','top10-admin-toolbar');
    const search=make('input');search.type='search';search.placeholder='搜索历史车手 / 用户名 / 年份';search.setAttribute('aria-label','搜索 TOP10 车手或用户名');
    const filter=make('select');filter.setAttribute('aria-label','选择状态');
    row.append(search,filter);
    return {row,search,filter};
  }
  function identitiesPanel(host, identities, accounts, claims, client, view) {
    const panel=make('section','top10-admin');
    panel.append(make('h2','','TOP10 历史身份管理'),make('p','top10-admin-lead','历史车手身份跨年度唯一。管理员可以为尚未绑定的历史身份选择已审核通过的网站账号并直接绑定；不会创建新的年度排名。'));
    const totalBound = identities.filter(i => i.bound_user_id).length;
    panel.append(make('p','top10-admin-count',`历史身份 ${identities.length} 位 · 已绑定 ${totalBound} 位 · 未绑定 ${identities.length-totalBound} 位`));
    const {row,search,filter}=controls();
    search.placeholder='搜索历史车手 / 已绑定用户名';
    [['全部身份',''],['尚未绑定','unbound'],['已绑定','bound']].forEach(([label,value])=>filter.add(new Option(label,value)));
    panel.append(row);
    const grid=make('div','top10-admin-grid');panel.append(grid);host.replaceChildren(panel);
    const eligibleAccounts=accounts.filter(a => a.account_status==='approved' && !a.bound_identity_id && a.user_id!==adminUserId);
    const pending=claims.filter(c=>c.claim_status==='pending');
    function draw() {
      grid.replaceChildren();
      const query=search.value.trim().toLowerCase();
      let shownCount=0;
      for(const identity of identities) {
        const bound=Boolean(identity.bound_user_id);
        if(filter.value==='bound'&&!bound || filter.value==='unbound'&&bound)continue;
        if(query&&!`${identity.identity_name} ${identity.bound_username||''} ${(identity.years||[]).join(' ')}`.toLowerCase().includes(query))continue;
        shownCount++;
        const card=make('article','top10-admin-card');
        card.append(make('h3','',identity.identity_name),flag(bound?'已绑定':'尚未绑定',bound?'bound':''));
        card.append(paragraph('入选年度',Array.isArray(identity.years)&&identity.years.length?identity.years.join('、'):'—'));
        if(bound){
          card.append(paragraph('绑定账号',identity.bound_username||'（未设置用户名）'),paragraph('账号审核状态',statusNames[identity.bound_account_status]||identity.bound_account_status),paragraph('绑定时间',when(identity.bound_at)));
        } else {
          const claimsForIdentity=pending.filter(c=>c.identity_id===identity.identity_id);
          if(claimsForIdentity.length)card.append(paragraph('待审核认领',claimsForIdentity.map(c=>c.username||c.user_id).join('、')));
          const label=make('label');label.append(make('span','','选择已审核通过、尚未绑定 TOP10 身份的网站账号'));
          const select=make('select');select.append(new Option('请选择账号…',''));
          for(const account of eligibleAccounts){
            const caption=(account.username||'无用户名')+(account.display_name?' · '+account.display_name:'')+' · '+account.user_id.slice(0,8);
            select.append(new Option(caption,account.user_id));
          }
          const action=button('确认直接绑定',()=>{
            const account=eligibleAccounts.find(a=>a.user_id===select.value);
            if(!account){notify('请选择一个未绑定且审核通过的账号。',true);return;}
            bindAccount(client,view,identity,account,pending);
          },'primary');
          action.disabled=!eligibleAccounts.length || submitting;
          label.append(select);card.append(label,action);
          if(!eligibleAccounts.length)card.append(make('p','top10-admin-count','暂无可绑定的已审核账号，或账号已全部绑定。'));
        }
        grid.append(card);
      }
      if(!shownCount)grid.append(make('p','admin-empty','没有符合条件的历史身份。'));
    }
    search.addEventListener('input',draw);filter.addEventListener('change',draw);draw();
  }
  function claimsPanel(host, claims, identities, accounts, client, view) {
    const panel=make('section','top10-admin');
    panel.append(make('h2','','TOP10 身份认领审核'),make('p','top10-admin-lead','仅待审核申请可以批准或拒绝。批准时数据库会再次验证申请人的账号状态、身份绑定和唯一性约束。'));
    const pendingCount=claims.filter(c=>c.claim_status==='pending').length;
    panel.append(make('p','top10-admin-count',`申请记录 ${claims.length} 条 · 待审核 ${pendingCount} 条`));
    const {row,search,filter}=controls();
    [['全部状态',''],['待审核','pending'],['已批准','approved'],['已拒绝','rejected']].forEach(([label,value])=>filter.add(new Option(label,value)));
    filter.value='pending';panel.append(row);
    const grid=make('div','top10-admin-grid');panel.append(grid);host.replaceChildren(panel);
    const boundByIdentity=new Map(identities.filter(i=>i.bound_user_id).map(i=>[i.identity_id,i.bound_user_id]));
    const boundByUser=new Map(accounts.filter(a=>a.bound_identity_id).map(a=>[a.user_id,a.bound_identity_id]));
    function draw() {
      grid.replaceChildren();let shownCount=0;
      const query=search.value.trim().toLowerCase();
      for(const claim of claims){
        if(filter.value && claim.claim_status!==filter.value)continue;
        if(query&&!`${claim.identity_name} ${claim.username||''} ${claim.user_id}`.toLowerCase().includes(query))continue;
        shownCount++;
        const card=make('article','top10-admin-card');
        card.append(make('h3','',claim.identity_name+' · '+(claim.username||'未设置用户名')));
        card.append(flag(statusNames[claim.claim_status]||claim.claim_status,claim.claim_status));
        card.append(paragraph('申请账号',claim.username||'—'),paragraph('账号 ID',claim.user_id),paragraph('账号审核状态',statusNames[claim.account_status]||claim.account_status),paragraph('申请时间',when(claim.created_at)));
        card.append(make('p','','认领理由：'),make('div','top10-admin-reason',claim.claim_reason||'—'));
        if(claim.claim_status==='pending'){
          const problems=[];
          if(claim.account_status!=='approved')problems.push('申请账号未审核通过或已停用');
          if(boundByIdentity.has(claim.identity_id))problems.push('历史身份已被绑定');
          if(boundByUser.has(claim.user_id))problems.push('账号已有其他历史身份');
          if(adminUserId===claim.user_id)problems.push('管理员不能在此界面审核自己的申请');
          if(problems.length)card.append(make('p','top10-admin-flag',problems.join('；')));
          const actions=make('div','top10-admin-actions');
          const approve=button('批准认领',()=>reviewClaim(client,view,claim,'approve'),'primary');
          approve.disabled=problems.length>0 || submitting;
          actions.append(approve,button('拒绝认领',()=>reviewClaim(client,view,claim,'reject'),'danger'));
          card.append(actions);
        }else{
          card.append(paragraph('审核时间',when(claim.reviewed_at)));
          if(claim.claim_status==='rejected')card.append(paragraph('拒绝原因',claim.rejection_reason||'—'));
        }
        grid.append(card);
      }
      if(!shownCount)grid.append(make('p','admin-empty',filter.value==='pending'?'目前没有待审核的 TOP10 身份认领申请。':'没有符合条件的申请。'));
    }
    search.addEventListener('input',draw);filter.addEventListener('change',draw);draw();
  }
  async function render(view,root,client){
    if(!root || !client || !['top10-identities','top10-claims'].includes(view))return;
    const id=++generation;
    root.replaceChildren(make('p','admin-help','正在读取 TOP10 数据…'));
    const [{data:who,error:whoError},identities,accounts,claims]=await Promise.all([
      client.auth.getUser(),
      rpc(client,'top10_admin_list_identities'),
      rpc(client,'top10_admin_list_accounts'),
      rpc(client,'top10_admin_list_claims')
    ]);
    if(whoError)throw whoError;
    if(id!==generation||!active(view))return;
    if(!who?.user)throw new Error('当前登录状态失效，请重新登录');
    adminUserId=who.user.id;
    if(!Array.isArray(identities)||!Array.isArray(accounts)||!Array.isArray(claims))throw new Error('TOP10 后台接口数据格式异常');
    if(view==='top10-identities')identitiesPanel(root,identities,accounts,claims,client,view);
    else claimsPanel(root,claims,identities,accounts,client,view);
  }
  window.CSDCTop10Admin={render};
})();
