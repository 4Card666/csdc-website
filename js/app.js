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
    homeDrivers.innerHTML = drivers.slice(0, 3).map(driverCard).join("");
    document.getElementById("driver-count").textContent = `${drivers.length} 位车手`;
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
      </article>`).join("");
  }
});

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
