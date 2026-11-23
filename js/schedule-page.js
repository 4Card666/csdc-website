/*
 * CSDC Schedule v1.0.1
 * Public presentation only. Existing js/data.js `schedule` remains the single
 * source of truth; no Supabase / registration / admin functions are touched.
 * To change the official current season when a new season begins, edit the
 * constant below. Year tabs appear automatically for years present in data.js.
 */
(() => {
  'use strict';

  const CURRENT_SEASON_YEAR = 2026;
  const root = document.getElementById('csdc-calendar');
  if (!root) return;

  const yearsHost = document.getElementById('cal-year-buttons');
  const stationHost = document.getElementById('cal-station-list');
  const yearSummary = document.getElementById('cal-year-summary');
  const currentLabel = document.getElementById('cal-current-year');
  const records = (typeof schedule !== 'undefined' && Array.isArray(schedule)) ? schedule : [];

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

  function parseRound(round) {
    const match = /^\s*(\d{4})\s+ROUND\s+(\d+)\s*$/i.exec(String(round || ''));
    return match ? {year:Number(match[1]), round:Number(match[2])} : null;
  }

  function stationLabel(round) {
    const digits = ['零','一','二','三','四','五','六','七','八','九'];
    if (round >= 1 && round <= 9) return `第${digits[round]}站`;
    if (round === 10) return '第十站';
    if (round >= 11 && round <= 19) return `第十${digits[round % 10]}站`;
    if (round >= 20 && round <= 99) {
      const tens = digits[Math.floor(round / 10)] + '十';
      return `第${tens}${round % 10 ? digits[round % 10] : ''}站`;
    }
    return `第${round}站`;
  }

  function stationBadge(round) {
    return String(round).padStart(2, '0');
  }

  function displayDate(raw) {
    const text = String(raw || '').trim();
    const m = /^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/.exec(text);
    return m ? `${m[1]}年${m[2].padStart(2,'0')}月${m[3].padStart(2,'0')}日` : (text || '待公布');
  }

  function extractVenue(item) {
    if (item.location || item.venue) return String(item.location || item.venue).trim();
    // Original schedule title already contains the official venue description.
    return String(item.title || '').replace(/(?:排位赛|追走赛)\s*$/, '').replace(/站\s*$/, '').trim() || '待公布';
  }

  function trackDetails(item) {
    const raw = String(item.track || '');
    const match = raw.match(/https?:\/\/[^\s，,<>"']+/i);
    const url = match ? match[0] : '';
    if (!url) return {url:'', code:''};
    let code = '';
    const byText = raw.match(/提取码\s*[:：]\s*([a-zA-Z0-9]+)/);
    if (byText) code = byText[1];
    if (!code) {
      try { code = new URL(url).searchParams.get('pwd') || ''; } catch (_) { /* no query code */ }
    }
    return {url, code};
  }

  function buildSeasons() {
    const byYear = new Map();
    for (const item of records) {
      const meta = parseRound(item.round);
      if (!meta || !Number.isInteger(meta.round) || meta.round < 1) continue;
      if (!byYear.has(meta.year)) byYear.set(meta.year,new Map());
      const byRound = byYear.get(meta.year);
      if (!byRound.has(meta.round)) {
        byRound.set(meta.round,{year:meta.year,round:meta.round,label:stationLabel(meta.round),badge:stationBadge(meta.round),name:'',phases:{}});
      }
      const station = byRound.get(meta.round);
      const phase = item.format === '排位赛' ? 'qualifying' : item.format === '追走赛' ? 'tandem' : null;
      if (!phase) continue;
      station.phases[phase] = item;
      if (!station.name) station.name = String(item.title || '').replace(/(?:排位赛|追走赛)\s*$/, '').trim();
    }
    return new Map([...byYear].map(([year,stationMap]) => [year,[...stationMap.values()].sort((a,b) => a.round-b.round)]));
  }

  const seasons = buildSeasons();
  const availableYears = [...seasons.keys()].sort((a,b) => a-b);
  let activeYear = seasons.has(CURRENT_SEASON_YEAR) ? CURRENT_SEASON_YEAR : (availableYears[availableYears.length-1] || CURRENT_SEASON_YEAR);
  let expandedRound = null;
  let activePhase = 'qualifying';
  currentLabel.textContent = `${CURRENT_SEASON_YEAR} 赛季`;

  function getStatus(station) {
    const statuses = [station.phases.qualifying,station.phases.tandem].filter(Boolean).map(x=>x.status).filter(Boolean);
    if (statuses.length === 0) return '待公布';
    if (statuses.every(x=>x===statuses[0])) return statuses[0];
    return '分阶段进行';
  }

  function formatStationDates(station) {
    const dates = [...new Set([station.phases.qualifying,station.phases.tandem].filter(Boolean).map(x => String(x.date || '').trim()).filter(Boolean))];
    return dates.length ? dates.map(displayDate).join(' — ') : '时间待公布';
  }

  function renderPhaseDetails(station) {
    const item = station.phases[activePhase];
    if (!item) return '<div class="cal-empty"><h3>赛程待公布</h3><p>该比赛阶段暂无官方资料。</p></div>';
    const track = trackDetails(item);
    const matchTime = String(item.startTime || item.time || '').trim();
    const date = displayDate(item.date);
    const venue = extractVenue(item);
    const phaseName = activePhase==='qualifying' ? '排位赛' : '追走赛';
    const status = String(item.status || '待公布');
    return `
      <dl class="cal-phase-info">
        <div class="cal-detail"><dt>赛事日期 / DATE</dt><dd>${escapeHTML(date)}</dd></div>
        <div class="cal-detail"><dt>开赛时间 / TIME</dt><dd>${escapeHTML(matchTime || '待公布')}</dd></div>
        <div class="cal-detail"><dt>比赛地点 / LOCATION</dt><dd>${escapeHTML(venue)}</dd></div>
        <div class="cal-detail"><dt>赛事阶段 / FORMAT</dt><dd>${escapeHTML(phaseName)} <small>· ${escapeHTML(status)}</small></dd></div>
      </dl>
      <div class="cal-track">
        <div>
          <p class="cal-track-title">赛道资源 / TRACK DOWNLOAD</p>
          <p class="cal-track-note">${track.url ? `提取码：${escapeHTML(track.code || '请查看下载页面')}` : '暂未公布赛道资源'}</p>
        </div>
        ${track.url ? `<a class="cal-link" href="${escapeHTML(track.url)}" target="_blank" rel="noopener noreferrer">前往下载赛道 ↗</a>` : ''}
      </div>`;
  }

  function renderYears() {
    yearsHost.innerHTML = availableYears.length ? availableYears.map(year => `
      <button type="button" class="cal-year-button" data-year="${year}" aria-pressed="${year===activeYear}">${year}</button>`).join('') :
      `<button type="button" class="cal-year-button" aria-pressed="true" disabled>${CURRENT_SEASON_YEAR}</button>`;
  }

  function renderStations() {
    const stations = seasons.get(activeYear) || [];
    yearSummary.textContent = `${activeYear} 赛季 · 已公布 ${stations.length} 个分站`;
    if (!stations.length) {
      stationHost.innerHTML = '<div class="cal-empty"><h3>该赛季暂无公开赛程</h3><p>待官方确认分站安排后将在这里公布。</p></div>';
      return;
    }
    stationHost.innerHTML = stations.map(station => {
      const isOpen = expandedRound===station.round;
      const name = station.name || '赛事详情待公布';
      return `<article class="cal-station${isOpen ? ' is-open' : ''}">
        <button type="button" class="cal-station-toggle" data-round="${station.round}" aria-expanded="${isOpen}" aria-controls="cal-panel-${station.year}-${station.round}">
          <span class="cal-letter" aria-hidden="true">${escapeHTML(station.badge)}</span>
          <span class="cal-station-info">
            <span class="cal-station-name">${escapeHTML(station.label)} · ${escapeHTML(name)}</span>
            <span class="cal-station-meta">ROUND ${String(station.round).padStart(2,'0')} · ${escapeHTML(formatStationDates(station))}</span>
          </span>
          <span class="cal-station-status">${escapeHTML(getStatus(station))}</span>
          <span class="cal-station-chevron" aria-hidden="true">⌄</span>
        </button>
        ${isOpen ? `<div class="cal-panel" id="cal-panel-${station.year}-${station.round}">
          <div class="cal-panel-heading">
            <p>选择赛事阶段 / EVENT SESSION</p>
            <div class="cal-phase-buttons" role="group" aria-label="选择比赛阶段">
              <button type="button" class="cal-phase-button" data-phase="qualifying" aria-pressed="${activePhase==='qualifying'}" ${station.phases.qualifying ? '' : 'disabled'}>排位赛</button>
              <button type="button" class="cal-phase-button" data-phase="tandem" aria-pressed="${activePhase==='tandem'}" ${station.phases.tandem ? '' : 'disabled'}>追走赛</button>
            </div>
          </div>
          <div class="cal-phase-content" aria-live="polite">${renderPhaseDetails(station)}</div>
        </div>` : ''}
      </article>`;
    }).join('');
  }

  yearsHost.addEventListener('click', event => {
    const target = event.target.closest('button[data-year]');
    if (!target) return;
    const year = Number(target.dataset.year);
    if (!seasons.has(year)) return;
    activeYear = year;
    expandedRound = null;
    activePhase = 'qualifying';
    renderYears();
    renderStations();
  });

  stationHost.addEventListener('click', event => {
    const phaseButton = event.target.closest('button[data-phase]');
    if (phaseButton) {
      const station = (seasons.get(activeYear)||[]).find(s=>s.round===expandedRound);
      if (!station || !station.phases[phaseButton.dataset.phase]) return;
      activePhase = phaseButton.dataset.phase;
      renderStations();
      const toFocus = stationHost.querySelector(`.cal-phase-button[data-phase="${activePhase}"]`);
      if (toFocus) toFocus.focus({preventScroll:true});
      return;
    }
    const toggle = event.target.closest('button[data-round]');
    if (!toggle) return;
    const round = Number(toggle.dataset.round);
    const station = (seasons.get(activeYear)||[]).find(s=>s.round===round);
    if (!station) return;
    expandedRound = expandedRound===round ? null : round;
    activePhase = station.phases.qualifying ? 'qualifying' : 'tandem';
    renderStations();
    const toFocus = stationHost.querySelector(`.cal-station-toggle[data-round="${round}"]`);
    if (toFocus) toFocus.focus({preventScroll:true});
  });

  renderYears();
  renderStations();
})();
