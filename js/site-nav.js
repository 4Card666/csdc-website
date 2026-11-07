/* CSDC shared navigation v1.0. All menu items are defined here. */
(() => {
  const groups = [
    {label:'首页',href:'index.html'},
    {label:'赛事',items:[
      ['赛事安排','schedule.html'],['分站报名（开发中）',null],['赛事积分','standings.html'],
      ['年度车手 TOP 10','top10.html'],['赛事历史','history.html']]},
    {label:'车手列表',href:'drivers.html'},
    {label:'资源下载',href:'resources.html'},
    {label:'公告与新闻',href:'news.html'},
    {label:'更多',items:[['赞助商','sponsors.html'],['赛会介绍','organization.html']]}
  ];
  function init(){
    const header=document.querySelector('.site-header');if(!header)return;
    const old=header.querySelector('.nav');if(old)old.remove();
    const oldToggle=header.querySelector('.menu-toggle');if(oldToggle)oldToggle.remove();
    const nav=document.createElement('nav');nav.className='nav csdc-nav';nav.id='csdc-main-nav';nav.setAttribute('aria-label','网站主导航');
    const current=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
    for(const group of groups){
      if(group.href){const a=document.createElement('a');a.href=group.href;a.textContent=group.label;if(current===group.href){a.classList.add('active');a.setAttribute('aria-current','page')}nav.append(a);continue}
      const wrap=document.createElement('div');wrap.className='csdc-nav-group';
      const btn=document.createElement('button');btn.type='button';btn.className='csdc-nav-trigger';btn.setAttribute('aria-expanded','false');btn.textContent=group.label+' ';const arrow=document.createElement('span');arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');btn.append(arrow);
      const menu=document.createElement('div');menu.className='csdc-nav-dropdown';
      let active=false;
      for(const [label,url] of group.items){
        if(!url){const span=document.createElement('span');span.className='csdc-nav-unavailable';span.textContent=label;menu.append(span);continue}
        const a=document.createElement('a');a.href=url;a.textContent=label;if(current===url){a.classList.add('active');a.setAttribute('aria-current','page');active=true}menu.append(a);
      }
      if(active)btn.classList.add('active');wrap.append(btn,menu);nav.append(wrap);
      btn.addEventListener('click',()=>{const opened=wrap.classList.contains('is-open');closeGroups();wrap.classList.toggle('is-open',!opened);btn.setAttribute('aria-expanded',String(!opened))});
      wrap.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover) and (min-width: 981px)').matches){closeGroups();wrap.classList.add('is-open');btn.setAttribute('aria-expanded','true')}});
      wrap.addEventListener('mouseleave',()=>{if(matchMedia('(hover:hover) and (min-width: 981px)').matches){wrap.classList.remove('is-open');btn.setAttribute('aria-expanded','false')}});
      wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){wrap.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.focus()}});
    }
    const toggle=document.createElement('button');toggle.type='button';toggle.className='menu-toggle csdc-menu-toggle';toggle.setAttribute('aria-label','打开导航菜单');toggle.setAttribute('aria-controls','csdc-main-nav');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';
    const auth=header.querySelector('.auth-nav-link');header.insertBefore(toggle,auth||null);header.insertBefore(nav,auth||null);
    function closeGroups(){nav.querySelectorAll('.csdc-nav-group.is-open').forEach(w=>{w.classList.remove('is-open');w.querySelector('button').setAttribute('aria-expanded','false')})}
    toggle.addEventListener('click',()=>{const open=nav.classList.toggle('nav-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');if(!open)closeGroups()});
    document.addEventListener('click',e=>{if(!nav.contains(e.target))closeGroups();if(!header.contains(e.target)){nav.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false')}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeGroups();nav.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false')}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
