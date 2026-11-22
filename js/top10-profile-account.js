/* Self-service equipment-profile editing. Existing published equipment stays visible
   until an admin approves top10_profile_submissions via SECURITY DEFINER RPC. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const root=$('top10-profile-section');
  if(!root)return;
  const kit=window.CSDCTop10ProfileFields;
  const status=$('top10-profile-status');
  const current=$('top10-profile-current');
  const submission=$('top10-profile-submission');
  const form=$('top10-profile-form');
  const fields=$('top10-profile-fields');
  const send=$('top10-profile-submit');
  const feedback=$('top10-profile-feedback');
  const refresh=$('top10-profile-refresh');
  const reset=$('top10-profile-reset');
  let client=null;
  let canEdit=false;
  let pending=false;
  let approvedData={};
  let draftData={};
  let sending=false;
  const make=(tag,cls,text)=>{
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(text!==undefined)n.textContent=String(text);
    return n;
  };
  function notice(text,error=false){
    feedback.textContent=text;
    feedback.className='auth-message '+(error?'auth-error':'auth-success');
    feedback.hidden=!text;
  }
  const value=kit.pickValue;
  function equipmentSummary(host, profile, label) {
    host.replaceChildren();
    const data=kit.cleanObject(profile);
    const contents=kit.sections(data);
    host.append(make('h3','',label));
    let hasData=false;
    const grid=make('div','top10-profile-preview-grid');
    for(const section of contents){
      const rows=section.fields.filter(f=>{
        const v=section.data[f.key];return v!==undefined&&v!==null&&String(v).trim()!=='';
      });
      if(!rows.length && !section.imageCount)continue;
      hasData=true;
      const block=make('section','top10-profile-preview-block');
      block.append(make('h4','',section.title));
      for(const f of rows){
        const p=make('p');p.append(make('strong','',f.title+'：'),document.createTextNode(value(section.data[f.key])));block.append(p);
      }
      if(section.imageCount)block.append(make('p','top10-profile-dim',`已登记图片 ${section.imageCount} 张（图片文件需要单独上传到网站资源目录）`));
      grid.append(block);
    }
    if(data.otherSettings && String(data.otherSettings).trim()){
      hasData=true;
      const block=make('section','top10-profile-preview-block');
      block.append(make('h4','','其他设置与说明'),make('p','',String(data.otherSettings)));grid.append(block);
    }
    if(hasData)host.append(grid);
    else host.append(make('p','top10-profile-dim','目前没有已审核通过的设备文字资料。'));
    host.hidden=false;
  }
  function buildForm(data) {
    const draft=kit.cleanObject(data);
    fields.replaceChildren();
    for(const section of kit.groups) {
      const group=make('fieldset','top10-profile-group');
      const legend=make('legend','',section.title);group.append(legend);
      const vals=kit.cleanObject(draft[section.key]);
      for(const f of section.fields){
        const label=make('label','top10-profile-field');
        label.append(make('span','',f.title));
        const input=make(f.multiline?'textarea':'input');
        if(!f.multiline)input.type='text';
        else input.rows=3;
        input.dataset.group=section.key;
        input.dataset.field=f.key;
        input.maxLength=f.multiline?1600:240;
        input.value=typeof vals[f.key]==='string'?vals[f.key]:vals[f.key]==null?'':String(vals[f.key]);
        input.autocomplete='off';
        label.append(input);group.append(label);
      }
      const imageCount=Array.isArray(vals.images)?vals.images.length:0;
      if(imageCount)group.append(make('p','top10-profile-dim',`现有 ${imageCount} 条图片记录将保留；此页面暂不支持上传图片。`));
      fields.append(group);
    }
    // 与公开 TOP10 档案一致：其他设置独立成第六个分类。
    const otherGroup=make('fieldset','top10-profile-group');
    otherGroup.append(make('legend','','其他设置与说明'));
    const label=make('label','top10-profile-field top10-profile-other');
    label.append(make('span','','其他游戏设置或调校心得'));
    const text=make('textarea');text.dataset.field='otherSettings';text.rows=5;text.maxLength=2000;
    text.value=typeof draft.otherSettings==='string'?draft.otherSettings:'';
    label.append(text);otherGroup.append(label);fields.append(otherGroup);
  }
  async function rpc(name, params){const {data,error}=await client.rpc(name,params||{});if(error)throw error;return data;}
  async function load() {
    form.hidden=true;current.hidden=true;submission.hidden=true;
    status.textContent='正在读取历史身份及设备资料…';
    const data=await rpc('top10_get_my_profile');
    if(!data?.success)throw new Error('服务器未确认查询成功');
    if(data.status==='unbound'){
      status.textContent='尚未绑定 TOP10 历史身份。请先在上方申请认领，待管理员审核通过后即可编辑设备资料。';
      return;
    }
    if(data.status!=='bound')throw new Error('返回的设备资料状态异常');
    canEdit=data.can_edit===true;
    approvedData=kit.cleanObject(data.profile?.profile_data);
    const latest=data.latest_submission;
    pending=latest?.status==='pending';
    status.textContent=`已绑定历史车手「${data.identity_name||'—'}」`+(canEdit?'，可以提交设备资料审核。':'；当前账号未通过审核，暂不能编辑。');
    equipmentSummary(current, approvedData, '当前公开的设备资料');
    if(data.profile?.updated_at)current.append(make('p','top10-profile-dim',`最近审核更新：${kit.stamp(data.profile.updated_at)}`));
    if(latest){
      const box=make('div','top10-profile-submission-card');
      const states={pending:'待管理员审核',approved:'已批准',rejected:'未通过审核'};
      box.append(make('h3','',`最近一次修改申请：${states[latest.status]||latest.status}`));
      box.append(make('p','',`提交时间：${kit.stamp(latest.created_at)}`));
      if(latest.reviewed_at)box.append(make('p','',`审核时间：${kit.stamp(latest.reviewed_at)}`));
      if(latest.status==='rejected')box.append(make('p','top10-profile-rejection',`拒绝原因：${latest.rejection_reason||'管理员未填写原因'}`));
      if(pending){
        box.append(make('p','top10-profile-dim','新提交的资料仍在审核；页面继续公开上一份已审核资料。'));
        const preview=make('div');equipmentSummary(preview,latest.profile_data,'待审核资料预览');box.append(preview);
      }
      submission.replaceChildren(box);submission.hidden=false;
    }
    draftData=latest?.status==='rejected'?kit.cleanObject(latest.profile_data):approvedData;
    if(canEdit && !pending){
      buildForm(draftData);form.hidden=false;send.disabled=false;
    }else if(pending){
      status.textContent+=' 当前已有一条待审核的修改申请，不能重复提交。';
    }
  }
  async function init(){
    if(!kit || !window.CSDCAuth?.client)throw new Error('设备资料组件或 Supabase 客户端尚未加载');
    client=window.CSDCAuth.client;
    const {data,error}=await client.auth.getUser();
    if(error)throw error;
    if(!data?.user){status.textContent='请登录后使用设备资料功能。';return;}
    await load();
  }
  refresh.addEventListener('click',async()=>{
    if(sending)return;
    refresh.disabled=true;notice('');
    try{await load();}catch(e){notice('刷新失败：'+(e.message||'未知错误'),true);}
    finally{refresh.disabled=false;}
  });
  reset.addEventListener('click',()=>{
    if(!form.hidden && window.confirm('将编辑框恢复为当前已审核通过的设备资料？尚未提交的修改会丢失。')){
      draftData=approvedData;buildForm(approvedData);notice('已恢复为公开资料。');
    }
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(sending||!canEdit||pending||!client||!form.reportValidity())return;
    const data=kit.prepareSubmission(draftData, fields);
    if(!Object.keys(data).length){notice('请至少填写一项设备或设置资料。',true);return;}
    if(new TextEncoder().encode(JSON.stringify(data)).length>16384){notice('设备资料超过 16 KB，请缩短文字后重试。',true);return;}
    if(!window.confirm('确认提交设备资料修改申请？提交后需要管理员审核，通过前公开资料不会改变。'))return;
    sending=true;send.disabled=true;notice('');
    try{
      const result=await rpc('top10_submit_profile',{p_profile_data:data});
      if(!result?.success)throw new Error('数据库未确认提交成功');
      await load();notice('设备资料申请已提交，等待管理员审核。');
    }catch(e){notice('提交失败：'+(e.message||'未知错误'),true);}
    finally{sending=false;if(!form.hidden)send.disabled=false;}
  });
  document.addEventListener('DOMContentLoaded',()=>{
    init().catch(error=>{status.textContent='设备资料读取失败';notice('无法加载资料：'+(error?.message||'未知错误'),true);});
  });
})();
