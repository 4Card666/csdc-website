/* CSDC TOP10 annual ranking manager, Phase 5.
   Only calls admin-guarded Supabase RPC; no direct privileged table access. */
(() => {
  'use strict';
  const TAB = 'top10-years';
  const minYear = 2000, maxYear = 2200;
  const $ = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = String(text);
    return n;
  };
  const btn = (text, action, className='') => {
    const n = $('button','admin-btn '+className,text);
    n.type='button'; n.addEventListener('click',action); return n;
  };
  const option = (label,value) => new Option(label,String(value));
  const asYear = value => {
    const s = String(value ?? '');
    const y = Number(s);
    if (!/^\d{4}$/.test(s) || !Number.isInteger(y) || y<minYear || y>maxYear) throw new Error('年度必须是 2000–2200 的四位整数');
    return y;
  };
  const fmt = value => value ? new Date(value).toLocaleString('zh-CN',{hour12:false}) : '—';
  let generation = 0;
  let busy = false;
  let dirty = false;
  let currentYear = null;
  let draftUpdatedAt = null;
  let hasDraft = false;
  let publishedCount = 0;
  let identities = [];
  let years = [];
  let rows = [];
  let report = null;
  let lastPanel = null;
  const active = () => document.querySelector('#admin-tabs [data-tab].active')?.dataset.tab === TAB;
  const rpc = async(client,name,args={}) => {
    const {data,error} = await client.rpc(name,args);
    if(error) throw error;
    return data;
  };
  function feedback(panel,text,bad=false) {
    const el=panel.querySelector('.top10-year-feedback');
    if(!el)return;
    el.textContent=text;
    el.dataset.error=bad?'true':'false';
    el.hidden=!text;
  }
  function controlsBusy(panel,value) {
    busy=value;
    panel.querySelectorAll('button[data-mutate]').forEach(b=>b.disabled=value);
  }
  function updateSummary(panel) {
    const s=panel.querySelector('.top10-year-summary');
    if(!s)return;
    s.textContent = `当前年度 ${currentYear} · 正式排名 ${publishedCount} 条 · ${hasDraft?'有未发布草稿':'无草稿'}${hasDraft?' · 保存于 '+fmt(draftUpdatedAt):''}${dirty?' · 有未保存的修改':''}`;
    const check=panel.querySelector('[data-action="check"]');
    const publish=panel.querySelector('[data-action="publish"]');
    const discard=panel.querySelector('[data-action="discard"]');
    if(check)check.disabled=busy||dirty||!hasDraft;
    if(publish)publish.disabled=busy||dirty||!hasDraft||!report?.valid||report?.changed_since_draft;
    if(discard)discard.disabled=busy||!hasDraft;
  }
  function markDirty(panel) {
    dirty=true; report=null;
    const out=panel.querySelector('.top10-year-validation');
    if(out)out.replaceChildren($('p','','有未保存的修改。请先保存草稿，再运行服务端检查。'));
    updateSummary(panel);
  }
  function newRow(rank, data, panel) {
    const article=$('article','top10-year-row');
    const title=$('strong','top10-year-rank','#'+rank);
    const kindLabel=$('label','top10-year-field top10-year-source');kindLabel.append($('span','','车手来源'));
    const kind=$('select');
    [['暂不填写','empty'],['选择历史车手','existing'],['创建全新车手','new']].forEach(([name,value])=>kind.add(option(name,value)));
    kind.value = ['existing','new'].includes(data?.kind) ? data.kind : 'empty';
    kindLabel.append(kind);

    const identityLabel=$('label','top10-year-field top10-year-existing');identityLabel.append($('span','','已有车手身份（永久 ID）'));
    const identity=$('select');identity.append(option('选择历史车手…',''));
    for(const item of identities) {
      const label=item.identity_name + (item.years?.length?`（${item.years.join('、')}）`:'（尚无年度记录）');
      identity.append(option(label,item.identity_id));
    }
    identity.value=data?.identity_id||'';
    identityLabel.append(identity);

    const newLabel=$('label','top10-year-field top10-year-new');newLabel.append($('span','','新车手姓名'));
    const newName=$('input');newName.type='text';newName.maxLength=100;newName.placeholder='首次进入 TOP10 的车手名称';
    newName.value=data?.new_name||'';
    newLabel.append(newName);

    const pointsLabel=$('label','top10-year-field top10-year-points');pointsLabel.append($('span','','年度总积分'));
    const points=$('input');points.type='text';points.inputMode='decimal';points.placeholder='如 390 或 390.50';
    points.maxLength=14;points.value=data?.points==null?'':String(data.points);
    pointsLabel.append(points);

    const help=$('p','top10-year-inline-help','');
    const visibility=() => {
      identityLabel.hidden=kind.value!=='existing';
      newLabel.hidden=kind.value!=='new';
      help.textContent=kind.value==='new'?'新身份将在正式发布时才创建；如与历史选手同名，请人工确认。':kind.value==='existing'?'重复进入 TOP10 的车手必须选择原有身份。':'草稿可以留空，但发布时必须填满全部 10 名。';
    };
    kind.addEventListener('change',()=>{visibility();markDirty(panel);});
    for(const input of [identity,newName,points]) input.addEventListener('input',()=>markDirty(panel));
    identity.addEventListener('change',()=>markDirty(panel));
    article.append(title,kindLabel,identityLabel,newLabel,pointsLabel,help);
    visibility();
    return {article,kind,identity,newName,points,rank};
  }
  function entriesFromControls() {
    return rows.map(r => {
      const item={rank:r.rank,kind:r.kind.value,points:r.points.value.trim()};
      if(item.kind==='existing') item.identity_id=r.identity.value||null;
      if(item.kind==='new') item.new_name=r.newName.value.trim();
      return item;
    });
  }
  function renderValidation(panel,validation) {
    const host=panel.querySelector('.top10-year-validation');host.replaceChildren();
    if(!validation){host.append($('p','','请先保存草稿，然后点击“检查草稿”。'));return;}
    const errors=Array.isArray(validation.errors)?[...validation.errors]:[];
    const collisions=Array.isArray(validation.name_collisions)?validation.name_collisions:[];
    if(validation.changed_since_draft) errors.unshift('已发布的年度排名在建立草稿后发生变化。请丢弃旧草稿并重新加载。');
    host.append($('p',errors.length?'top10-year-check-error':'top10-year-check-ok',
      errors.length?`未通过检查：共 ${errors.length} 个问题`:'通过完整性检查：可以准备发布。'));
    for(const e of errors)host.append($('p','top10-year-issue','• '+e));
    if(collisions.length){host.append($('p','top10-year-check-warning','发现同名历史身份，需要发布前单独确认：'));for(const c of collisions)host.append($('p','top10-year-issue','• '+c));}
    if(validation.published_count>0)host.append($('p','top10-year-check-warning',`警告：该年度已经发布 ${validation.published_count} 条排名。再次发布将完整替换该年度排名，且必须进行二次确认。`));
  }
  function paintRows(panel,entries) {
    const grid=panel.querySelector('.top10-year-grid');grid.replaceChildren();rows=[];
    const byRank=new Map((entries||[]).map(r=>[Number(r.rank),r]));
    for(let rank=1;rank<=10;rank++) {
      const r=byRank.get(rank)||{kind:'empty',points:''};
      const loaded=r.kind ? r : {kind:'existing',identity_id:r.identity_id,points:r.points};
      const built=newRow(rank,loaded,panel);rows.push(built);grid.append(built.article);
    }
  }
  function yearList(panel) {
    const bar=panel.querySelector('.top10-year-yearlist');bar.replaceChildren();
    if(!years.length){bar.append($('span','top10-year-muted','数据库尚无已发布年度或草稿。'));return;}
    for(const y of years) {
      const suffix=y.has_draft?' · 草稿':` · 已发布 ${y.published_count}`;
      const b=btn(`${y.season_year}${suffix}`,()=>loadYear(panel._client,panel,y.season_year),'top10-year-chip');
      if(Number(y.season_year)===currentYear)b.classList.add('is-current');
      bar.append(b);
    }
  }
  async function refreshYears(client,panel) {
    years=await rpc(client,'top10_admin_list_years');
    if(!Array.isArray(years))throw new Error('年度列表返回格式异常');
    yearList(panel);
  }
  async function loadYear(client,panel,year,internal=false) {
    if(busy && !internal) return;
    try {
      year=asYear(year);
      if(dirty && !window.confirm('当前年度有未保存的修改。确定放弃修改并加载其他年度吗？'))return;
      controlsBusy(panel,true);
      feedback(panel,'正在读取该年度…');
      const result=await rpc(client,'top10_admin_get_year',{p_year:year});
      if(!result||!Array.isArray(result.published))throw new Error('年度详情返回格式异常');
      if(!active()||lastPanel!==panel)return;
      currentYear=year;hasDraft=Boolean(result.has_draft);
      draftUpdatedAt=result.draft_updated_at||null;
      publishedCount=result.published.length;
      dirty=false;report=null;
      panel.querySelector('[data-year-input]').value=String(year);
      paintRows(panel,hasDraft ? result.draft : result.published);
      panel.querySelector('.top10-year-validation').replaceChildren($('p','','本页仅是草稿编辑。正式榜单不会因保存草稿而改变。'));
      yearList(panel);
      feedback(panel,hasDraft?`已加载 ${year} 年草稿。`:`已加载 ${year} 年${publishedCount?'已发布排名':'空白表单'}。`);
    } catch(e) {feedback(panel,'读取年度失败：'+(e.message||e),true);} finally {controlsBusy(panel,false);updateSummary(panel);}
  }
  async function save(client,panel) {
    if(busy||currentYear===null)return;
    controlsBusy(panel,true);
    try {
      const res=await rpc(client,'top10_admin_save_year_draft',{
        p_year:currentYear,p_entries:entriesFromControls(),p_expected_updated_at:draftUpdatedAt
      });
      if(!res?.success)throw new Error('数据库未确认草稿保存成功');
      draftUpdatedAt=res.updated_at;
      hasDraft=true;dirty=false;report=null;
      renderValidation(panel,null);
      await refreshYears(client,panel);
      feedback(panel,`${currentYear} 年草稿已保存。尚未公开，也没有创建新的历史车手身份。`);
    }catch(e){feedback(panel,'保存草稿失败：'+(e.message||e),true);}
    finally{controlsBusy(panel,false);updateSummary(panel);}
  }
  async function check(client,panel) {
    if(busy||dirty||!hasDraft)return;
    controlsBusy(panel,true);
    try {
      report=await rpc(client,'top10_admin_check_year',{p_year:currentYear});
      if(!report||typeof report.valid!=='boolean')throw new Error('核验接口返回格式异常');
      renderValidation(panel,report);
      feedback(panel,report.valid&&!report.changed_since_draft?'服务端检查通过。请认真核对后再发布。':'服务端检查未通过，请查看下方错误。',!report.valid||report.changed_since_draft);
    }catch(e){report=null;feedback(panel,'检查失败：'+(e.message||e),true);}finally{controlsBusy(panel,false);updateSummary(panel);}
  }
  async function publish(client,panel) {
    if(busy||dirty||!hasDraft||!report?.valid||report.changed_since_draft)return;
    controlsBusy(panel,true);
    try {
      const latest=await rpc(client,'top10_admin_check_year',{p_year:currentYear});
      if(!latest?.valid||latest.changed_since_draft){report=latest;renderValidation(panel,latest);throw new Error('草稿检查状态已改变，请重新核对');}
      const entries=entriesFromControls();
      const summary=entries.map(e=>{
        const person=e.kind==='existing'?(identities.find(i=>i.identity_id===e.identity_id)?.identity_name||'未知历史车手'):(e.new_name||'未命名');
        return `#${e.rank} ${person} · ${e.points} 分${e.kind==='new'?'（新增身份）':''}`;
      }).join('\n');
      if(!window.confirm(`正式发布 ${currentYear} 年度 TOP10 排名？\n\n${summary}\n\n发布后公开页面立即读取新排名。`))return;
      let confirmReplace=false,confirmCollision=false;
      if(Number(latest.published_count)>0) {
        const typed=window.prompt(`危险操作：该年度已有 ${latest.published_count} 条公开记录，重新发布将完整替换当年排名。\n请输入 ${currentYear} 以确认覆盖：`);
        if(typed!==String(currentYear))return;
        confirmReplace=true;
      }
      if(Array.isArray(latest.name_collisions)&&latest.name_collisions.length) {
        const text=latest.name_collisions.join('\n');
        if(!window.confirm(`发现同名历史身份：\n${text}\n\n请确认确实是不同的人。否则应取消并选择“已有历史车手”。\n\n确认创建全新身份？`))return;
        confirmCollision=true;
      }
      const res=await rpc(client,'top10_admin_publish_year',{
        p_year:currentYear,p_confirm_replace:confirmReplace,p_confirm_name_collision:confirmCollision
      });
      if(!res?.success||res.published_entries!==10)throw new Error('数据库未确认成功发布完整 10 人榜单');
      const savedYear=currentYear;
      identities=await rpc(client,'top10_admin_list_identities');
      await refreshYears(client,panel);
      // 正式发布后草稿自动删除；重新读取以加载永久 identity_id。
      dirty=false;
      await loadYear(client,panel,savedYear,true);
      feedback(panel,`${savedYear} 年榜单已正式发布（10 人）；本次创建 ${res.new_identities?.length||0} 个新身份。请刷新 TOP10 公开页面核对。`);
    }catch(e){feedback(panel,'发布失败：'+(e.message||e),true);}
    finally{controlsBusy(panel,false);updateSummary(panel);}
  }
  async function discard(client,panel) {
    if(busy||!hasDraft)return;
    if(!window.confirm(`确认丢弃 ${currentYear} 年的未发布草稿？\n\n已发布榜单、历史身份及设备资料完全保留。`))return;
    controlsBusy(panel,true);
    try{
      const res=await rpc(client,'top10_admin_discard_year_draft',{
        p_year:currentYear,p_expected_updated_at:draftUpdatedAt
      });
      if(!res?.success)throw new Error('数据库未确认草稿已丢弃');
      const year=currentYear;
      hasDraft=false;dirty=false;draftUpdatedAt=null;report=null;
      await refreshYears(client,panel);
      await loadYear(client,panel,year,true);
      feedback(panel,`${year} 年未发布草稿已丢弃，正式榜单未改变。`);
    }catch(e){feedback(panel,'丢弃草稿失败：'+(e.message||e),true);}
    finally{controlsBusy(panel,false);updateSummary(panel);}
  }
  async function render(view,root,client) {
    if(view!==TAB||!root||!client)return;
    const id=++generation;
    root.replaceChildren($('p','admin-help','正在读取年度 TOP10 管理数据…'));
    const [list,people]=await Promise.all([
      rpc(client,'top10_admin_list_years'),rpc(client,'top10_admin_list_identities')
    ]);
    if(id!==generation||!active())return;
    if(!Array.isArray(list)||!Array.isArray(people))throw new Error('年度榜单管理接口返回格式异常');
    years=list;identities=people;
    identities.sort((a,b)=>a.identity_name.localeCompare(b.identity_name,'zh-CN'));
    const panel=$('section','top10-year-admin');panel._client=client;lastPanel=panel;
    panel.append($('h2','','年度 TOP10 排名管理'),$('p','top10-year-lead','为年度榜单录入十名车手及总积分。重复入选的车手必须选择既有身份；全新车手仅在正式发布时建立永久身份。草稿不会公开，也不会改动当前榜单。'));
    const yearlist=$('div','top10-year-yearlist');panel.append(yearlist);
    const toolbar=$('div','top10-year-toolbar');
    const label=$('label');label.append($('span','','年度（2000–2200）'));
    const yearInput=$('input');yearInput.type='number';yearInput.min=String(minYear);yearInput.max=String(maxYear);yearInput.step='1';yearInput.dataset.yearInput='';
    label.append(yearInput);toolbar.append(label,btn('加载 / 新建年度',()=>loadYear(client,panel,yearInput.value)));
    panel.append(toolbar);
    const status=$('p','top10-year-summary');panel.append(status);
    const note=$('p','top10-year-note','编辑已发布年度时，保存草稿不影响线上榜单。只有完成核验并明确确认覆盖，才会更新该年度正式排名。');panel.append(note);
    const feedbackBox=$('p','top10-year-feedback');feedbackBox.hidden=true;feedbackBox.setAttribute('role','status');feedbackBox.setAttribute('aria-live','polite');panel.append(feedbackBox);
    const grid=$('div','top10-year-grid');panel.append(grid);
    const actions=$('div','top10-year-actions');
    const saveButton=btn('保存草稿',()=>save(client,panel),'primary');
    const checkButton=btn('检查草稿',()=>check(client,panel));
    const publishButton=btn('正式发布',()=>publish(client,panel),'top10-year-publish');
    const discardButton=btn('丢弃草稿',()=>discard(client,panel),'top10-year-danger');
    saveButton.dataset.mutate='';checkButton.dataset.mutate='';publishButton.dataset.mutate='';discardButton.dataset.mutate='';
    checkButton.dataset.action='check';publishButton.dataset.action='publish';discardButton.dataset.action='discard';
    actions.append(saveButton,checkButton,publishButton,discardButton);panel.append(actions);
    const validation=$('div','top10-year-validation');panel.append(validation);
    const foot=$('p','top10-year-muted','正式发布后，TOP10 公开页面会从现有 top10_get_public_leaderboard() 读取当年最新数据；无需手动修改 top10-data.js。历史年度修改会保留身份账号绑定和设备资料。');panel.append(foot);
    root.replaceChildren(panel);
    const currentMax=years.reduce((n,v)=>Math.max(n,Number(v.season_year)||0),2025);
    const startYear=years.find(v=>v.has_draft)?.season_year || Math.max(2026,currentMax+1);
    currentYear=null;draftUpdatedAt=null;hasDraft=false;publishedCount=0;dirty=false;report=null;
    yearList(panel);
    await loadYear(client,panel,startYear);
  }
  // Prevent accidentally leaving the editor with unsaved changes.
  document.addEventListener('DOMContentLoaded',()=>{
    const tabs=document.getElementById('admin-tabs');
    tabs?.addEventListener('click',event=>{
      const button=event.target.closest('[data-tab]');
      if(button&&button.dataset.tab!==TAB&&active()&&dirty){
        if(!window.confirm('年度 TOP10 有未保存的修改，确定离开吗？')){
          event.preventDefault();event.stopImmediatePropagation();
        }else dirty=false;
      }
    },true);
  });
  window.CSDCTop10YearAdmin={render};
})();
