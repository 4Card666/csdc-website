/* CSDC Certified Driver Roster Search v1.0
 * Reads already-rendered driver cards from js/app.js.
 * No backend calls, and does not change roster data or verification status.
 */
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("drivers-list");
  const input = document.getElementById("driver-search-input");
  const reset = document.getElementById("driver-search-reset");
  const emptyReset = document.getElementById("driver-search-empty-reset");
  const empty = document.getElementById("driver-search-empty");
  const summary = document.getElementById("driver-search-summary");
  const total = document.getElementById("drivers-total");
  if (!list || !input || !reset || !empty || !summary) return;

  const normalize = value => String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/\s+/g, " ")
    .trim();

  // app.js renders and sorts these cards before this listener is called.
  const cards = [...list.querySelectorAll(".driver-card")].map(element => ({
    element,
    haystack: normalize([
      element.querySelector(".driver-info h3")?.textContent,
      element.querySelector(".card-kicker")?.textContent,
      element.querySelector(".driver-number")?.textContent
    ].filter(Boolean).join(" "))
  }));
  const count = cards.length;
  if (total) total.textContent = `${count} 位已认证车手`;

  function render() {
    const keyword = normalize(input.value);
    const terms = keyword.split(" ").filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const matched = terms.every(term => card.haystack.includes(term));
      card.element.hidden = !matched;
      if (matched) visible++;
    }
    reset.hidden = keyword.length === 0;
    empty.hidden = visible !== 0;
    summary.textContent = terms.length
      ? `找到 ${visible} 位符合条件的认证车手 · 总计 ${count} 位`
      : `当前展示全部 ${count} 位认证车手`;
  }

  function clearSearch() {
    input.value = "";
    render();
    input.focus();
  }
  input.addEventListener("input", render);
  input.addEventListener("search", render);
  reset.addEventListener("click", clearSearch);
  if (emptyReset) emptyReset.addEventListener("click", clearSearch);
  render();
});
