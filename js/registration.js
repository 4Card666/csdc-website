(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const client = window.supabase?.createClient?.(window.CSDC_SUPABASE_URL, window.CSDC_SUPABASE_PUBLISHABLE_KEY);
  const statusNames = {pending:'待审核',approved:'已通过',rejected:'已拒绝',cancelled:'已取消',published:'已发布',closed:'报名关闭',completed:'已结束'};
  let user = null, profile = null, driver = null, applications = [], busy = false;
  const fmt = v => v ? new Date(v).toLocaleString('zh-CN',{hour12:false}) : '待定';
  const node = (tag,cls,text) => {const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
  function message(s,err=false){const e=$('registration-message');e.textContent=s;e.className='registration-message'+(err?' error':'');e.hidden=false;}
  function field(dl,label,value){dl.append(node('dt','',label),node('dd','',value));}
  function eligible(){return !!user && profile?.account_status==='approved' && driver?.driver_status==='approved';}
  function eventState(e){const now=Date.now();if(e.status!=='published')return '赛事未开放报名';if(!e.registration_start||!e.registration_end)return '报名时间未设置';if(now<new Date(e.registration_start).getTime())return '报名尚未开始';if(now>new Date(e.registration_end).getTime())return '报名已截止';return '报名开放中';}
  function render(events){const root=$('registration-events');root.replaceChildren();if(!events.length){root.append(node('p','registration-empty','暂无已发布或已结束的分站赛事，请稍后再来。'));return;}
    for(const e of events){const card=node('article','registration-card');card.append(node('p','eyebrow','CSDC EVENT'),node('h3','',e.title||'未命名赛事'));
      const dl=node('dl','registration-meta');field(dl,'赛道',e.track_name||'待公布');field(dl,'比赛时间',fmt(e.event_date));field(dl,'报名开始',fmt(e.registration_start));field(dl,'报名截止',fmt(e.registration_end));field(dl,'人数上限',e.max_participants==null?'未限制':String(e.max_participants));field(dl,'赛事状态',statusNames[e.status]||e.status);card.append(dl);
      if(e.description)card.append(node('p','registration-description',e.description));const mine=applications.find(a=>a.event_id===e.id);const state=eventState(e);
      card.append(node('p','registration-status-text',mine?'我的报名：'+(statusNames[mine.status]||mine.status):state));
      const button=node('button','registration-apply',mine?'已提交报名':!user?'登录后报名':!eligible()?'暂不符合报名资格':'申请报名');button.type='button';button.disabled=busy||!!mine||!eligible()||state!=='报名开放中';
      if(!user && state==='报名开放中'){button.disabled=false;button.textContent='登录后报名';button.addEventListener('click',()=>{location.href='login.html';});}
      else if(!mine && eligible() && state==='报名开放中')button.addEventListener('click',()=>submit(e));
      card.append(button);root.append(card);
    }
  }
  async function submit(e){if(busy)return;if(!confirm('确认申请报名「'+e.title+'」？提交后需等待管理员审核。'))return;busy=true;try{const {error}=await client.rpc('submit_registration',{p_event_id:e.id});if(error)throw error;message('报名申请已提交，等待管理员审核。');await load();}catch(err){message('报名失败：'+(err.message||'未知错误'),true);}finally{busy=false;}}
  async function load(){if(!client){message('Supabase 初始化失败，请检查配置或网络。',true);return;}const root=$('registration-events');root.textContent='正在加载赛事…';try{
      const {data:auth,error:authErr}=await client.auth.getUser();if(authErr)throw authErr;user=auth?.user||null;profile=null;driver=null;applications=[];
      if(user){const [p,d,r]=await Promise.all([client.from('profiles').select('account_status,role').eq('id',user.id).maybeSingle(),client.from('drivers').select('driver_status').eq('user_id',user.id).maybeSingle(),client.from('registrations').select('event_id,status').eq('user_id',user.id)]);for(const result of [p,d,r])if(result.error)throw result.error;profile=p.data;driver=d.data;applications=r.data||[];}
      $('registration-account').textContent=!user?'未登录：可以浏览赛事，登录后才能报名。':`账号：${statusNames[profile?.account_status]||profile?.account_status||'未知'} · 正式车手资格：${driver?.driver_status==='approved'?'已通过':'未获得或未通过'}`;
      const {data,error}=await client.from('events').select('id,title,description,track_name,event_date,registration_start,registration_end,max_participants,status').in('status',['published','closed','completed']).order('event_date',{ascending:false});if(error)throw error;render(data||[]);
    }catch(err){root.replaceChildren(node('p','registration-empty','读取赛事失败，请刷新重试。'));message('读取失败：'+(err.message||'未知错误'),true);}}
  document.addEventListener('DOMContentLoaded',()=>{$('registration-refresh').addEventListener('click',load);load();});
})();
