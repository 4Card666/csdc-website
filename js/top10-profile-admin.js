/* CSDC TOP10 equipment profile review UI.
   All writes are through admin-guarded top10_admin_review_profile RPC. */
(() => {
  'use strict';
  const kit=window.CSDCTop10ProfileFields;
  const $=id=>document.getElementById(id);
  let sequence=0;
  let saving=false;
  let adminId=null;
  const make=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el;};
  const stateText={pending:'待审核',approved:'已批准',rejected:'已拒绝'};
  const norm=value=>value===undefined||value===null?'':typeof value==='string'?value:JSON.stringify(value);
  const shown=value=>norm(value)||'—';
  const active=()=>document.querySelector('#admin-tabs [data-tab].active')?.dataset.tab==='top10-profiles';
  async function rpc(client,name,args){const {data,error}=await client.rpc(name,args||{});if(error)throw error;return data;}
  function notify(text,error=false){const host=$('admin-message');if(!host)return;host.textContent=text;host.hidden=!text;host.className='auth-message '+(error?'auth-error':'auth-success');}
  function info(label,value){const p=make('p');p.append(make('strong','',label+'：'),document.createTextNode(shown(value)));return p;}
  function block(title,oldData,newData,groupFields){
    const el=make('section','top10-review-group');el.append(make('h4','',title));
    const oldObj=kit.cleanObject(oldData),newObj=kit.cleanObject(newData);
    const fields=new Set([...Object.keys(oldObj),...Object.keys(newObj)]);
    let changes=0;
    for(const key of fields){
      const oldVal=oldObj[key],newVal=newObj[key];
      if(JSON.stringify(oldVal)===JSON.stringify(newVal))continue;
      changes++;
      const labels=(groupFields||[]).filter(f=>f.key===key).map(f=>f.title);
      const label=labels[0]|| (key==='images'?'图片记录':key);
      const row=make('div','top10-review-diff');
      row.append(make('strong','',label));
      row.append(info('原资料',oldVal===undefined?'（未填写）':norm(oldVal)));
      row.append(info('新资料',newVal===undefined?'（已清空）':norm(newVal)));
      el.append(row);
    }
    return changes?el:null;
  }
  function compareProfiles(previous,submitted){
    const old=kit.cleanObject(previous),now=kit.cleanObject(submitted);
    const wrap=make('div','top10-review-comparison');
    let count=0;
    for(const group of kit.groups){
      const section=block(group.title,old[group.key],now[group.key],group.fields);
      if(section){wrap.append(section);count++;}
    }
    if(norm(old.otherSettings)!==norm(now.otherSettings)){
      const el=make('section','top10-review-group');el.append(make('h4','','其他设置与说明'));
      el.append(info('原资料',old.otherSettings||'（未填写）'),info('新资料',now.otherSettings||'（已清空）'));
      wrap.append(el);count++;
    }
    // Unexpected additional JSON keys must be visible to admins as well.
    const known=new Set([...kit.groups.map(g=>g.key),'otherSettings','updatedAt']);
    const extras=new Set([...Object.keys(old),...Object.keys(now)].filter(k=>!known.has(k)));
    for(const key of extras){
      if(JSON.stringify(old[key])===JSON.stringify(now[key]))continue;
      const el=make('section','top10-review-group');el.append(make('h4','',`附加字段：${key}`));
      el.append(info('原资料',norm(old[key])||'（未填写）'),info('新资料',norm(now[key])||'（已清空）'));
      wrap.append(el);count++;
    }
    if(!count)wrap.append(make('p','top10-review-dim','本次提交的公开资料字段与当前版本相同。'));
    return wrap;
  }
  async function review(client,row,action){
    if(saving || row.submission_status!=='pending')return;
    if(row.user_id===adminId){notify('不允许在此后台审核自己的设备资料申请。',true);return;}
    let reason=null;
    if(action==='approve'){
      if(!window.confirm(`确认批准「${row.identity_name}」的设备资料修改？\n批准后将立即更新此历史身份在所有年度的公开设备资料。`))return;
    }else{
      const entered=window.prompt(`请输入拒绝「${row.identity_name}」设备资料申请的原因：`);
      if(entered===null)return;
      reason=entered.trim();
      if(!reason){notify('拒绝操作必须填写原因。',true);return;}
      if(reason.length>2000){notify('拒绝原因不能超过 2000 字。',true);return;}
      if(!window.confirm('确认拒绝该设备资料修改申请？公开资料将保持不变。'))return;
    }
    saving=true;notify('正在处理 TOP10 设备资料申请…');
    try{
      const result=await rpc(client,'top10_admin_review_profile',{
        p_submission_id:row.submission_id,p_action:action,p_reason:reason
      });
      if(!result?.success)throw new Error('数据库未确认审核成功');
      notify(action==='approve'?'设备资料已批准并更新公开档案。':'设备资料申请已拒绝，公开档案未修改。');
      if(active())await render('top10-profiles',$('admin-content'),client);
    }catch(error){notify('TOP10 设备资料审核失败：'+(error?.message||'未知错误'),true);}
    finally{saving=false;}
  }
  function drawCard(row,profiles,client){
    const article=make('article','top10-admin-card top10-review-card');
    article.append(make('h3','',`${row.identity_name||'未知历史身份'} · ${row.username||'账号未命名'}`));
    const state=make('span','top10-admin-flag '+row.submission_status,stateText[row.submission_status]||shown(row.submission_status));
    article.append(state, info('提交时间',kit.stamp(row.created_at)), info('账号 ID',row.user_id));
    if(row.reviewed_at)article.append(info('审核时间',kit.stamp(row.reviewed_at)));
    if(row.rejection_reason)article.append(info('拒绝原因',row.rejection_reason));
    const published=profiles.get(row.identity_id)?.profile_data;
    article.append(compareProfiles(published,row.profile_data));
    const full=make('details','top10-review-raw');
    full.append(make('summary','','查看本次提交的完整 JSON（包括图片路径）'));
    full.append(make('pre','',JSON.stringify(row.profile_data,null,2)));
    article.append(full);
    if(row.submission_status==='pending'){
      const actions=make('div','top10-admin-actions');
      const approve=make('button','admin-btn primary','批准并更新公开资料');approve.type='button';
      const reject=make('button','admin-btn danger','拒绝申请');reject.type='button';
      approve.disabled=saving||row.user_id===adminId;
      reject.disabled=saving||row.user_id===adminId;
      approve.addEventListener('click',()=>review(client,row,'approve'));
      reject.addEventListener('click',()=>review(client,row,'reject'));
      actions.append(approve,reject);article.append(actions);
      if(row.user_id===adminId)article.append(make('p','top10-review-dim','当前登录管理员不能在此界面审核自己的申请。'));
    }
    return article;
  }
  async function render(view,root,client){
    if(view!=='top10-profiles'||!root||!client||!kit)return;
    const seq=++sequence;
    root.replaceChildren(make('p','admin-help','正在读取 TOP10 设备资料审核列表…'));
    const [{data:user,error:authError},submissions,published]=await Promise.all([
      client.auth.getUser(),rpc(client,'top10_admin_list_profile_submissions'),rpc(client,'top10_get_public_profiles')
    ]);
    if(authError)throw authError;
    if(seq!==sequence||!active())return;
    if(!user?.user)throw new Error('登录状态已失效，请重新登录');
    if(!Array.isArray(submissions)||!Array.isArray(published))throw new Error('设备资料审核接口返回的数据格式不正确');
    adminId=user.user.id;
    const profiles=new Map(published.map(p=>[p.identity_id,p]));
    const panel=make('section','top10-admin');
    panel.append(make('h2','','TOP10 设备资料审核'));
    panel.append(make('p','top10-admin-lead','批准后新资料将覆盖该历史身份的公开设备资料，并用于全部年度；拒绝后继续公开旧资料。以下逐项对比修改内容，图片路径也纳入比较。'));
    panel.append(make('p','top10-admin-count',`申请记录 ${submissions.length} 条 · 待审核 ${submissions.filter(s=>s.submission_status==='pending').length} 条`));
    const toolbar=make('div','top10-admin-toolbar');
    const search=make('input');search.type='search';search.placeholder='搜索历史车手 / 申请用户名';
    const filter=make('select');
    [['待审核','pending'],['全部状态',''],['已批准','approved'],['已拒绝','rejected']].forEach(([text,value])=>filter.add(new Option(text,value)));
    toolbar.append(search,filter);panel.append(toolbar);
    const grid=make('div','top10-admin-grid');panel.append(grid);
    function draw(){
      grid.replaceChildren();
      const q=search.value.trim().toLowerCase();let count=0;
      for(const row of submissions){
        if(filter.value&&row.submission_status!==filter.value)continue;
        if(q&&!`${row.identity_name} ${row.username||''} ${row.user_id}`.toLowerCase().includes(q))continue;
        grid.append(drawCard(row,profiles,client));count++;
      }
      if(!count)grid.append(make('p','admin-empty',filter.value==='pending'?'目前没有待审核的 TOP10 设备资料申请。':'没有符合条件的设备资料申请。'));
    }
    search.addEventListener('input',draw);filter.addEventListener('change',draw);
    root.replaceChildren(panel);draw();
  }
  window.CSDCTop10ProfilesAdmin={render};
})();
