(()=>{'use strict';
const typeNames={vehicle_review:'车辆数据审核',registration:'分站报名',event:'分站赛事',season:'赛季',number_request:'车号申请'};
const countNames={seasons:'赛季',events:'分站',registrations:'报名',vehicle_reviews:'车检',number_requests:'车号申请',season_numbers:'正式车号'};
const client=window.supabase?.createClient?.(window.CSDC_SUPABASE_URL,window.CSDC_SUPABASE_PUBLISHABLE_KEY);
let running=false;
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
function message(text,isError){const n=document.getElementById('admin-message');if(n){n.hidden=false;n.textContent=text;n.className='auth-message '+(isError?'auth-error':'auth-success');}}
async function rpc(name,args){const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
async function open(type,id){if(running)return;if(!client||!typeNames[type]||!(/^[a-f0-9-]{36}$/i.test(id||''))){message('删除目标无效',true);return;}
  running=true;let overlay;
  try{const data=await rpc('admin_preview_force_delete',{p_target_type:type,p_target_id:id});
    overlay=node('div','csdc-delete-overlay');overlay.setAttribute('role','presentation');const dialog=node('section','csdc-delete-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','csdc-delete-title');
    dialog.append(node('h2','', '强制删除 · '+typeNames[type]));const label=node('p','',data.target_name||'未命名记录');dialog.append(label);
    dialog.append(node('p','csdc-delete-warning','此操作将永久删除以下业务数据，不能通过网站撤销。预览为当前快照，执行时数据库会重新检查。'));
    const counts=node('ul','csdc-delete-counts');for(const [key,title] of Object.entries(countNames)){const value=Number(data.affected?.[key]||0);if(value>0)counts.append(node('li','',title+'：'+value+' 条'));}dialog.append(counts);
    if(type==='number_request')dialog.append(node('p','csdc-delete-warning','已批准车号若存在该赛季报名或车检，数据库将拒绝单独删除。请先处理关联记录。'));
    if(type==='season'||type==='event')dialog.append(node('p','csdc-delete-warning','注意：删除整个赛季或分站可能同时清除多个车手的历史记录。'));
    const expected='DELETE '+id;dialog.append(node('p','', '目标 UUID：'+id));dialog.append(node('p','', '请输入以下完整确认文字：'));
    const code=node('code','csdc-delete-code',expected);dialog.append(code);const input=node('input','csdc-delete-input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.placeholder='输入 DELETE + UUID';input.setAttribute('aria-label','删除确认文字');dialog.append(input);
    const actions=node('div','csdc-delete-actions');const cancel=node('button','admin-btn','取消');cancel.type='button';const execute=node('button','admin-btn danger','确认永久删除');execute.type='button';execute.disabled=true;
    input.addEventListener('input',()=>{execute.disabled=input.value!==expected;});const close=()=>{overlay.remove();document.removeEventListener('keydown',esc);};const esc=e=>{if(e.key==='Escape'&&!execute.disabled){/* Allow cancellation even if confirmed */}if(e.key==='Escape')close();};cancel.onclick=close;
    execute.onclick=async()=>{if(execute.disabled||input.value!==expected)return;execute.disabled=true;cancel.disabled=true;input.disabled=true;try{const result=await rpc('admin_force_delete',{p_target_type:type,p_target_id:id,p_confirmation:expected});close();message('删除成功：'+JSON.stringify(result.deleted||{}),false);document.getElementById('admin-refresh')?.click();const active=document.querySelector('#admin-tabs [data-tab].active');if(active&&['seasons','numbers','inspection'].includes(active.dataset.tab))active.click();}catch(err){message('删除失败：'+err.message,true);cancel.disabled=false;input.disabled=false;execute.disabled=false;}};
    actions.append(cancel,execute);dialog.append(actions);overlay.append(dialog);document.body.append(overlay);document.addEventListener('keydown',esc);cancel.focus();
  }catch(err){message('无法预览删除：'+err.message,true);overlay?.remove();}finally{running=false;}
}
window.CSDCForceDelete={open};
})();