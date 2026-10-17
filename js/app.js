document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const driverCard = driver => `
    <article class="driver-card">
      <div class="driver-visual">
        <span class="driver-tag">${escapeHTML(driver.tag || "DRIVER")}</span>
        <span class="driver-number">${escapeHTML(driver.number)}</span>
        <span class="driver-visual-caption">CSDC / DRIVER</span>
      </div>
      <div class="driver-info">
        <div><p class="card-kicker">${escapeHTML(driver.team)}</p><h3>${escapeHTML(driver.name)}</h3></div>
        <p class="driver-car">${escapeHTML(driver.car)}</p>
      </div>
    </article>`;

  const newsCard = item => `
    <article class="news-card ${item.pinned ? "news-pinned" : ""}">
      <div class="news-card-top"><span class="pill">${escapeHTML(item.type)}</span>${item.pinned ? '<span class="pinned-label">置顶</span>' : ""}</div>
      <p class="news-date">${escapeHTML(item.date)}</p>
      <h3>${escapeHTML(item.title)}</h3>
      <p class="news-summary">${escapeHTML(item.summary)}</p>
      <span class="news-arrow">↗</span>
    </article>`;

  const homeDrivers = document.getElementById("home-drivers");

if (homeDrivers) {
  // 复制车手列表，避免打乱完整名单
  const shuffledDrivers = [...drivers];

  // Fisher-Yates 洗牌算法：随机打乱车手顺序
  for (let i = shuffledDrivers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDrivers[i], shuffledDrivers[j]] =
      [shuffledDrivers[j], shuffledDrivers[i]];
  }

  // 每次页面加载时随机展示 3 位车手
  homeDrivers.innerHTML = shuffledDrivers
    .slice(0, 3)
    .map(driverCard)
    .join("");

  document.getElementById("driver-count").textContent =
    `${drivers.length} 位车手`;
}

  const allDrivers = document.getElementById("drivers-list");
  if (allDrivers) {
    allDrivers.innerHTML = drivers.map(driverCard).join("");
    document.getElementById("drivers-total").textContent = `${drivers.length} 位车手`;
  }

  const homeNews = document.getElementById("home-news");
  if (homeNews) homeNews.innerHTML = news.slice(0, 3).map(newsCard).join("");

  const allNews = document.getElementById("news-list");
  if (allNews) allNews.innerHTML = news.map(newsCard).join("");

  const scheduleList = document.getElementById("schedule-list");
  if (scheduleList) {
    scheduleList.innerHTML = schedule.map(item => `
      <article class="schedule-card">
        <div class="round-label">${escapeHTML(item.round)}</div>
        <div class="schedule-main"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.track)}</p><div class="schedule-meta"><span>◷ ${escapeHTML(item.date)}</span><span>▤ ${escapeHTML(item.format)}</span></div></div>
        <div class="schedule-status status-${escapeHTML(item.statusType)}">${escapeHTML(item.status)}</div>
      </article>`).join("") || emptyState("暂未公布赛程", "确认赛程后，在 js/data.js 的 schedule 数组中添加分站信息。");
  }

  const sponsorCard = item => `
    <article class="sponsor-card">
      <div class="sponsor-logo-wrap">${item.logo ? `<img class="sponsor-logo" src="${escapeHTML(item.logo)}" alt="${escapeHTML(item.name)} Logo" loading="lazy">` : `<span class="sponsor-logo-placeholder">${escapeHTML((item.name || "CSDC").slice(0, 2))}</span>`}</div>
      <div class="sponsor-info"><span class="sponsor-level">${escapeHTML(item.level || "官方合作伙伴")}</span><h3>${escapeHTML(item.name)}</h3>${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}${item.url ? `<a class="text-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">访问品牌网站 ↗</a>` : ""}</div>
    </article>`;
  const homeSponsors = document.getElementById("home-sponsors");
  if (homeSponsors) homeSponsors.innerHTML = sponsors.length ? sponsors.slice(0, 4).map(sponsorCard).join("") : emptyState("合作伙伴即将公布", "正式赞助商资料确认后，将在这里展示。", "empty-state-wide");
  const allSponsors = document.getElementById("sponsors-list");
  if (allSponsors) {
    allSponsors.innerHTML = sponsors.length ? sponsors.map(sponsorCard).join("") : emptyState("合作伙伴即将公布", "请在 js/data.js 的 sponsors 数组中添加已确认的赞助商资料。", "empty-state-wide");
    const total = document.getElementById("sponsors-total");
    if (total) total.textContent = `${sponsors.length} 家合作伙伴`;
  }

  const standingsTable = (items, compact = false) => {
    if (!items.length) return emptyState("积分榜尚未发布", "将主办方核定的车手积分录入 js/data.js 的 standings 数组。", "empty-state-wide");
    const rounds = standingsRounds || [];
    return `<div class="table-scroll"><table class="standings-table"><thead><tr><th>排名</th><th>车手</th><th>车队</th>${compact ? "" : rounds.map(r => `<th>${escapeHTML(r)}</th>`).join("")}<th>总积分</th></tr></thead><tbody>${[...items].sort((a,b) => Number(a.rank || 999) - Number(b.rank || 999)).map(item => `<tr><td><span class="rank-number ${Number(item.rank) <= 3 ? "rank-top" : ""}">${escapeHTML(item.rank)}</span></td><td><strong>${escapeHTML(item.name)}</strong><span class="table-sub">#${escapeHTML(item.number || "—")}</span></td><td>${escapeHTML(item.team || "—")}</td>${compact ? "" : rounds.map((_,i) => `<td>${escapeHTML((item.rounds || [])[i] ?? "—")}</td>`).join("")}<td class="points-cell">${escapeHTML(item.total ?? "—")}</td></tr>`).join("")}</tbody></table></div>`;
  };
  const homeStandings = document.getElementById("home-standings");
  if (homeStandings) homeStandings.innerHTML = standingsTable(standings.slice(0, 5), true);
  const allStandings = document.getElementById("standings-table");
  if (allStandings) allStandings.innerHTML = standingsTable(standings, false);
  const seasonLabel = document.getElementById("standings-season");
  if (seasonLabel) seasonLabel.textContent = standingsSeason || "赛季积分";
});

function emptyState(title, description, extraClass = "") {
  return `<div class="empty-state ${extraClass}"><span class="empty-state-mark">C/</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></div>`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
