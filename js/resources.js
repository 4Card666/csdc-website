document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

  const resources = Array.isArray(window.CSDCResources) ? window.CSDCResources : [];
  const searchInput = document.getElementById("resource-search-input");
  const list = document.getElementById("resource-list");
  const empty = document.getElementById("resource-empty");
  const count = document.getElementById("resource-count");
  const subfilters = document.getElementById("resource-subfilters");
  let selectedCategory = "all";
  let selectedType = "all";

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const categoryLabel = value => ({game:"游戏资源",rules:"赛事文件",media:"宣传与媒体"}[value] || "其他资源");
  const typeLabel = value => ({track:"赛道",csp:"CSP",document:"文件",image:"媒体"}[value] || "资源");
  const requirementLabel = value => ({required:"比赛必需",optional:"可选资源",dependency:"依赖资源"}[value] || "");
  const formatSize = item => {
    if (item.sizeMB === undefined || item.sizeMB === null || item.sizeMB === "") return "大小待确认";
    const mb = Number(item.sizeMB);
    if (!Number.isFinite(mb) || mb < 0) return "大小待确认";
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb} MB`;
  };
  const card = item => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const badges = [categoryLabel(item.category), typeLabel(item.type), requirementLabel(item.requirement), ...tags]
      .filter(Boolean).map(tag => `<span class="resource-tag">${escapeHTML(tag)}</span>`).join("");
    const detailParts = [];
    if (item.version) detailParts.push(`<span>版本：${escapeHTML(item.version)}</span>`);
    detailParts.push(`<span>大小：${escapeHTML(formatSize(item))}</span>`);
    if (item.updatedAt) detailParts.push(`<span>更新：${escapeHTML(item.updatedAt)}</span>`);
    const install = item.installGuide ? `<div class="resource-detail"><strong>安装说明</strong><p>${escapeHTML(item.installGuide)}</p></div>` : "";
    const notes = item.notes ? `<div class="resource-detail"><strong>注意事项</strong><p>${escapeHTML(item.notes)}</p></div>` : "";
    const code = item.accessCode ? `<p class="resource-access-code">网盘提取码：<code>${escapeHTML(item.accessCode)}</code></p>` : "";
    const download = item.downloadUrl && /^https?:\/\//i.test(item.downloadUrl)
      ? `<a class="button button-primary resource-download" href="${escapeHTML(item.downloadUrl)}" target="_blank" rel="noopener noreferrer">前往下载 <span>↗</span></a>`
      : `<span class="resource-link-pending">下载链接待补充</span>`;
    return `<article class="resource-card ${item.featured ? "resource-featured" : ""}">
      <div class="resource-card-top"><div class="resource-tags">${badges}</div>${item.featured ? '<span class="resource-pinned">置顶</span>' : ""}</div>
      <h3>${escapeHTML(item.title || "未命名资源")}</h3>
      <p class="resource-description">${escapeHTML(item.description || "暂无简介。")}</p>
      <div class="resource-meta">${detailParts.join("")}</div>
      ${install}${notes}${code}
      <div class="resource-card-footer">${download}</div>
    </article>`;
  };

  function render() {
    const query = (searchInput?.value || "").trim().toLocaleLowerCase();
    const filtered = resources.filter(item => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedCategory === "game" && selectedType !== "all" && item.type !== selectedType) return false;
      const haystack = [item.title, item.description, item.version, item.season, item.type, item.category, ...(item.tags || []), item.installGuide, item.notes]
        .filter(Boolean).join(" ").toLocaleLowerCase();
      return !query || haystack.includes(query);
    }).sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")) || String(a.title || "").localeCompare(String(b.title || ""), "zh-CN"));
    list.innerHTML = filtered.map(card).join("");
    empty.hidden = filtered.length > 0;
    if (filtered.length === 0 && resources.length > 0) {
      empty.querySelector("h3").textContent = "没有找到匹配的资源";
      empty.querySelector("p").textContent = "请尝试更换关键词或分类。";
    } else if (resources.length === 0) {
      empty.querySelector("h3").textContent = "资源正在整理中";
      empty.querySelector("p").textContent = "首批公开资源上线后，将在这里提供资源说明、版本信息、安装指南与网盘下载入口。";
    }
    count.textContent = resources.length ? `显示 ${filtered.length} / ${resources.length} 项` : "资源整理中";
  }

  document.querySelectorAll(".resource-filter").forEach(button => button.addEventListener("click", () => {
    selectedCategory = button.dataset.category || "all";
    if (selectedCategory !== "game") selectedType = "all";
    document.querySelectorAll(".resource-filter").forEach(el => {
      const active = el === button;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
    });
    subfilters.hidden = selectedCategory !== "game";
    document.querySelectorAll(".resource-chip").forEach(el => {
      const active = (el.dataset.type || "all") === selectedType;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
    });
    render();
  }));
  document.querySelectorAll(".resource-chip").forEach(button => button.addEventListener("click", () => {
    selectedType = button.dataset.type || "all";
    document.querySelectorAll(".resource-chip").forEach(el => {
      const active = el === button;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
    });
    render();
  }));
  searchInput?.addEventListener("input", render);
  render();
});
