(() => {
'use strict';
const $=id=>document.getElementById(id);
const client=window.supabase?.createClient?.(window.CSDC_SUPABASE_URL,window.CSDC_SUPABASE_PUBLISHABLE_KEY);
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e;};
const message=(s,err=false)=>{const e=$('admin-message');e.hidden=false;e.textContent=s;e.className='auth-message '+(err?'auth-error':'auth-success');};
const fmt=d=>d?new Date(d).toLocaleString('zh-CN'):'—';
let loading=false;
async function rpc(name,args){const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
async function manage(args,success){if(loading)return;loading=true;try{await rpc('admin_manage_season',args);message(success);await refresh();}catch(e){message('操作失败：'+e.message,true);}finally{loading=false;}}
function btn(label,fn,kind=''){const b=node('button',label,'admin-btn '+kind);b.type='button';b.onclick=fn;return b;}
async function refresh(){if(!client)return;const active=document.querySelector('#admin-tabs [data-tab].active')?.dataset.tab;if(active!=='seasons'&&active!=='numbers')return;const target=$('admin-content');target.replaceChildren(node('p','正在读取…','admin-help'));try{if(active==='seasons')await seasons(target);else await numbers(target);}catch(e){target.replaceChildren(node('p','读取失败：'+e.message,'admin-empty'));}}
async function seasons(root){
  const {data,error}=await client.from('seasons').select('id,name,starts_on,ends_on,number_registration_open,created_at').order('starts_on',{ascending:false});
  if(error)throw error;
  const wrap=node('div');
  wrap.append(node('h2','创建赛季'));
  const form=node('form',undefined,'admin-form');
  const fields=[['name','赛季名称','text'],['start','开始日期','date'],['end','结束日期（可留空）','date']];
  for(const [id,label,type] of fields){
    const l=node('label');l.append(node('span',label));
    const inp=node('input');inp.name=id;inp.type=type;inp.required=id!=='end';
    if(id==='name')inp.maxLength=100;
    l.append(inp);form.append(l);
  }
  const submit=btn('创建赛季',()=>{},'primary full');submit.type='submit';form.append(submit);
  form.onsubmit=e=>{
    e.preventDefault();const f=new FormData(form);
    const name=String(f.get('name')||'').trim(),start=String(f.get('start')||''),end=String(f.get('end')||'');
    if(!name||!start||(end&&start>end)){message('请检查赛季名称和日期范围',true);return;}
    if(confirm('确认创建赛季「'+name+'」？'))manage({p_action:'create',p_name:name,p_starts_on:start,p_ends_on:end||null},'赛季创建成功');
  };
  wrap.append(form,node('h2','现有赛季'));
  if(!data?.length)wrap.append(node('p','尚无赛季，请先创建。','admin-help'));
  const tableWrap=node('div',undefined,'season-table-wrap'),table=node('table',undefined,'season-table');
  const head=node('tr');for(const label of ['赛季','日期范围','选号状态','操作'])head.append(node('th',label));table.append(head);
  for(const s of data||[]){
    const row=node('tr');
    row.append(node('td',s.name),node('td',s.starts_on+' — '+(s.ends_on||'待定')),node('td',s.number_registration_open?'开放中':'已关闭'));
    const actions=node('td');
    actions.append(btn('编辑赛季',()=>showSeasonEditor(wrap,s)));
    actions.append(btn(s.number_registration_open?'关闭选号':'开放选号',()=>{
      if(confirm('确认'+(s.number_registration_open?'关闭':'开放')+'「'+s.name+'」的车号申请？'))
        manage({p_action:s.number_registration_open?'close':'open',p_season_id:s.id},'赛季状态已更新');
    },s.number_registration_open?'':'primary'));
    actions.append(btn('强制删除',()=>window.CSDCForceDelete.open('season',s.id),'danger'));row.append(actions);table.append(row);
  }
  tableWrap.append(table);wrap.append(tableWrap);root.replaceChildren(wrap);
}
function showSeasonEditor(wrap,s){
  wrap.querySelector('#season-edit-panel')?.remove();
  const panel=node('section',undefined,'season-edit-panel');panel.id='season-edit-panel';
  panel.append(node('h2','编辑赛季：'+s.name));
  panel.append(node('p','修改日期或名称不会更换赛季 ID，也不会清除已审核车号。','admin-help'));
  const form=node('form',undefined,'admin-form');
  const values=[['name','赛季名称','text',s.name],['start','开始日期','date',s.starts_on],['end','结束日期（可留空，表示待定）','date',s.ends_on||'']];
  for(const [id,label,type,value] of values){
    const l=node('label');l.append(node('span',label));
    const inp=node('input');inp.name=id;inp.type=type;inp.value=value;inp.required=id!=='end';
    if(id==='name')inp.maxLength=100;
    l.append(inp);form.append(l);
  }
  const save=btn('保存修改',()=>{},'primary');save.type='submit';
  const cancel=btn('取消编辑',()=>panel.remove());
  const actions=node('div',undefined,'season-edit-actions');actions.append(save,cancel);form.append(actions);
  form.onsubmit=e=>{
    e.preventDefault();const f=new FormData(form);
    const name=String(f.get('name')||'').trim(),start=String(f.get('start')||''),end=String(f.get('end')||'');
    if(!name||!start||(end&&start>end)){message('请检查赛季名称和日期范围',true);return;}
    if(confirm('确认修改「'+s.name+'」？已绑定车号及历史报名将保留。'))
      manage({p_action:'edit',p_season_id:s.id,p_name:name,p_starts_on:start,p_ends_on:end||null},'赛季修改成功');
  };
  panel.append(form);
  wrap.querySelector('.season-table-wrap')?.before(panel);
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function numbers(root){
  // If context RPC is unavailable, do not offer an approval action.
  const [rs,context,ss]=await Promise.all([
    rpc('admin_list_driver_number_requests',{}),
    rpc('admin_get_number_review_context',{}),
    client.from('seasons').select('id,name').order('starts_on',{ascending:false})
  ]);
  if(ss.error)throw ss.error;
  const contextById=new Map((context||[]).map(c=>[c.request_id,c]));
  const wrap=node('div');wrap.append(node('h2','车号申请审核'));
  wrap.append(node('p','首次申请必须先核实会费；上一赛季同号车手享有优先权，存在冲突时需人工确认释放。所有批准条件最终由数据库再次校验。','admin-help'));
  const toolbar=node('div',undefined,'season-toolbar');
  const season=node('select'),status=node('select'),search=node('input');
  season.append(new Option('全部赛季',''));
  for(const s of ss.data||[])season.append(new Option(s.name,s.id));
  for(const [label,val] of [['全部状态',''],['待审核','pending'],['已通过','approved'],['已驳回','rejected']])status.append(new Option(label,val));
  search.placeholder='搜索车手 / 车号';toolbar.append(season,status,search);wrap.append(toolbar);
  const host=node('div',undefined,'season-table-wrap');wrap.append(host);
  const rows=rs||[];
  const conflict=c=>Boolean(c?.previous_user_id);
  const isOtherOwner=(r,c)=>conflict(c)&&c.previous_user_id!==r.user_id;
  function draw(){
    host.replaceChildren();
    const table=node('table',undefined,'season-table'),tr=node('tr');
    for(const t of ['赛季','用户名','显示名称','申请车号','状态','会费/资格','上一赛季优先权','同号待审','申请时间','审核时间','原因','操作'])tr.append(node('th',t));
    table.append(tr);let count=0;
    for(const r of rows){
      if((season.value&&r.season_id!==season.value)||(status.value&&r.status!==status.value))continue;
      const q=search.value.trim().toLowerCase();
      if(q&&![r.username,r.display_name,r.driver_number].some(v=>String(v||'').toLowerCase().includes(q)))continue;
      count++;const c=contextById.get(r.request_id),line=node('tr');
      const qualified=c?.driver_status==='approved';
      const feeText=qualified?'已有车手资格 · 免重复缴费':c?.driver_status==='revoked'?'资格已撤销 · 不可批准':c?.fee_verified?'首次会费已核实':'首次会费待核实';
      let priorityText='无上一赛季同号归属';
      if(conflict(c))priorityText=isOtherOwner(r,c)?`原车手：${c.previous_username||'未知'} · ${c.priority_decision==='released'?'已确认放弃':c.priority_decision==='reserved'?'确认保留':'尚未确认'}`:'申请人是上赛季原车手';
      for(const value of [r.season_name,r.username,r.display_name,r.driver_number,({pending:'待审核',approved:'已通过',rejected:'已驳回'})[r.status]||r.status,feeText,priorityText,c?.same_number_pending??'—',fmt(r.created_at),fmt(r.reviewed_at),r.rejection_reason||'—'])line.append(node('td',value??'—'));
      const action=node('td');
      if(r.status==='pending'){
        if(!qualified&&c?.driver_status!=='revoked'&&!c?.fee_verified)action.append(btn('核实会费',()=>verifyFee(r)));
        if(isOtherOwner(r,c))action.append(btn('确认优先权',()=>confirmPriority(r,c)));
        const blocked=!c||(!qualified&&!c.fee_verified)||c.driver_status==='revoked'||(isOtherOwner(r,c)&&c.priority_decision!=='released');
        const approve=btn('批准',()=>review(r,'approve'),'primary');approve.disabled=blocked;approve.title=blocked?'请先完成会费或车号优先权核实':'数据库将再次校验';action.append(approve,btn('驳回',()=>review(r,'reject'),'danger'));
      }
      action.append(btn('强制删除',()=>window.CSDCForceDelete.open('number_request',r.request_id),'danger'));
      line.append(action);table.append(line);
    }
    host.append(table);if(!count)host.append(node('p','没有符合条件的申请','admin-help'));
  }
  async function verifyFee(r){
    if(!confirm('请先在指定收款账户核实款项确已到账。确认已收到 '+(r.display_name||r.username)+' 的首次会费？'))return;
    try{await rpc('admin_verify_driver_fee',{p_request_id:r.request_id});message('会费核实已记录');await refresh();}catch(e){message('会费核实失败：'+e.message,true);}
  }
  async function confirmPriority(r,c){
    const choice=prompt(`申请车号 #${r.driver_number}\n上赛季原车手：${c.previous_username||c.previous_user_id}\n输入 released 表示原车手明确放弃；输入 reserved 表示原车手继续保留。\n尚未联系到原车手请点击取消。`);
    if(choice===null)return;
    const decision=choice.trim().toLowerCase();
    if(!['released','reserved'].includes(decision)){message('请输入 released 或 reserved',true);return;}
    const notes=prompt('请输入人工确认依据（例如联系日期、方式和原车手明确答复）。请勿填写支付密码等敏感信息：');
    if(notes===null)return;
    if(!notes.trim()){message('必须填写确认依据',true);return;}
    if(!confirm(`确认记录 ${decision==='released'?'原车手明确放弃':'原车手继续保留'} #${r.driver_number} 的优先权？`))return;
    try{await rpc('admin_confirm_number_priority',{p_request_id:r.request_id,p_decision:decision,p_notes:notes.trim()});message('优先权人工确认已记录');await refresh();}catch(e){message('优先权确认失败：'+e.message,true);}
  }
  async function review(r,action){
    let reason=null;
    if(action==='reject'){
      reason=prompt('请输入驳回原因：');if(reason===null)return;
      reason=reason.trim();if(!reason){message('驳回必须填写原因',true);return;}
    }else if(!confirm('确认批准 '+(r.display_name||r.username)+' 的车号 '+r.driver_number+'？数据库会再次检查会费、资格及优先权。'))return;
    try{await rpc('admin_review_driver_number',{p_request_id:r.request_id,p_action:action,p_reason:reason});message('审核完成');await refresh();}catch(e){message('审核失败：'+e.message,true);}
  }
  season.onchange=status.onchange=search.oninput=draw;draw();root.replaceChildren(wrap);
}
document.addEventListener('DOMContentLoaded',()=>{const tabs=$('admin-tabs');if(!tabs)return;tabs.addEventListener('click',e=>{if(e.target.closest('[data-tab="seasons"], [data-tab="numbers"]'))setTimeout(refresh,0);});$('admin-refresh')?.addEventListener('click',()=>setTimeout(refresh,0));});
})();
