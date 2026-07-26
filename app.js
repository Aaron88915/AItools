/* ============================================================
 * AI Nav app logic (v14)
 * - 分类导航 + 卡片渲染
 * - Fuse.js 模糊搜索（容错、支持多关键词）
 * - 分类筛选 + / 快捷键
 * - i18n：分类名按当前语言渲染，desc 走 descEn，监听 langchange 重渲染
 * ============================================================ */
(function () {
  "use strict";

  const { CATEGORIES, TOOLS } = window.AI_NAV;
  const I18N = window.I18N;

  // 工具：按 id 取分类元数据
  const catById = (id) => CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: "✨" };

  // 工具：去重（按 name+url+category，保留跨分类同工具）
  const dedup = (() => {
    const seen = new Set();
    return TOOLS.filter((t) => {
      const key = `${t.name} ${t.url} ${t.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // 工具：分组
  const groupByCategory = (tools) => {
    const map = new Map();
    for (const t of tools) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category).push(t);
    }
    return map;
  };

  // 渲染：分类导航（桌面 chips + 移动 select 同步；按当前语言取名）
  const catNavEl = document.getElementById("catNav");
  const catSelectEl = document.getElementById("catSelect");
  function renderCatNav() {
    // chips（桌面端显示）
    catNavEl.innerHTML = "";
    // "全部" 按钮
    const allBtn = document.createElement("button");
    allBtn.className = "cat-chip";
    allBtn.dataset.cat = "all";
    allBtn.textContent = I18N.t("catAll");
    catNavEl.appendChild(allBtn);
    // 32 个分类
    CATEGORIES.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "cat-chip";
      btn.dataset.cat = c.id;
      const name = I18N.catName(c.id, c.name);
      btn.innerHTML = `<span class="cat-emoji">${c.icon}</span><span>${name}</span>`;
      catNavEl.appendChild(btn);
    });
    // select（移动端显示）
    catSelectEl.innerHTML = "";
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = I18N.t("catAll");
    catSelectEl.appendChild(allOpt);
    CATEGORIES.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.icon} ${I18N.catName(c.id, c.name)}`;
      catSelectEl.appendChild(opt);
    });
    // 恢复 active
    syncCatUI();
  }

  // 同步 chips.active / select.value 跟随 currentCat
  function syncCatUI() {
    catNavEl.querySelectorAll(".cat-chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.cat === currentCat);
    });
    if (catSelectEl.value !== currentCat) catSelectEl.value = currentCat;
  }

  // 渲染：统计
  function renderStats() {
    document.getElementById("stat-total").textContent = dedup.length;
    document.getElementById("stat-cat").textContent = CATEGORIES.length;
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  // 渲染：主体（按分类分组展示）
  const contentEl = document.getElementById("content");
  const emptyEl = document.getElementById("empty");

  function renderSections(tools) {
    contentEl.innerHTML = "";
    if (!tools.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    const grouped = groupByCategory(tools);
    // 保持 CATEGORIES 原始顺序
    CATEGORIES.forEach((c) => {
      const list = grouped.get(c.id);
      if (!list || !list.length) return;

      const sec = document.createElement("section");
      sec.className = "cat-section";
      sec.id = `cat-${c.id}`;
      const name = I18N.catName(c.id, c.name);
      sec.innerHTML = `
        <h2 class="cat-title">
          <span class="cat-emoji">${c.icon}</span>
          <span class="cat-name">${name}</span>
          <span class="cat-count">${list.length}</span>
        </h2>
        <div class="tool-grid"></div>
      `;
      const grid = sec.querySelector(".tool-grid");
      list.forEach((t) => grid.appendChild(buildCard(t)));
      contentEl.appendChild(sec);
    });
  }

  // 渲染：单个工具卡
  function buildCard(t) {
    const a = document.createElement("a");
    a.className = "tool-card";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.name = t.name;
    a.dataset.category = t.category;
    // 根据当前语言选 desc（en 时优先用 descEn，回落到 desc）
    const desc = I18N.getLang() === "en" ? (t.descEn || t.desc || "") : (t.desc || "");
    a.title = `${t.name} · ${desc}`;
    a.innerHTML = `
      <div class="tool-name">${escapeHTML(t.name)}</div>
      <div class="tool-desc">${escapeHTML(desc)}</div>
    `;
    return a;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // 搜索：Fuse.js 模糊搜索
  // 字段权重: name > tags > desc > category
  const fuse = new Fuse(dedup, {
    keys: [
      { name: "name",     weight: 0.55 },
      { name: "tags",     weight: 0.30 },
      { name: "desc",     weight: 0.10 },
      { name: "category", weight: 0.05 }
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: false
  });

  // 当前过滤状态
  let currentCat = "all";
  let currentQuery = "";

  function applyFilter() {
    let list = dedup;
    if (currentCat !== "all") list = list.filter((t) => t.category === currentCat);
    const q = currentQuery.trim();
    if (q) {
      const results = fuse.search(q).map((r) => r.item);
      list = list.filter((t) => results.includes(t));
    }
    renderSections(list);
  }

  // 事件：分类 chip（桌面端）
  catNavEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".cat-chip");
    if (!chip) return;
    currentCat = chip.dataset.cat;
    syncCatUI();
    // 同步 ?cat= 到 URL（sitemap 分类 URL 真正可用）
    try {
      const url = new URL(window.location.href);
      if (currentCat !== "all") url.searchParams.set("cat", currentCat);
      else url.searchParams.delete("cat");
      history.replaceState(null, "", url.toString());
    } catch (e) { /* ignore */ }
    applyFilter();
    if (currentCat !== "all") {
      const sec = document.getElementById(`cat-${currentCat}`);
      if (sec) {
        const top = sec.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // 事件：分类 select（移动端）
  catSelectEl.addEventListener("change", () => {
    currentCat = catSelectEl.value;
    syncCatUI();
    try {
      const url = new URL(window.location.href);
      if (currentCat !== "all") url.searchParams.set("cat", currentCat);
      else url.searchParams.delete("cat");
      history.replaceState(null, "", url.toString());
    } catch (e) { /* ignore */ }
    applyFilter();
    if (currentCat !== "all") {
      const sec = document.getElementById(`cat-${currentCat}`);
      if (sec) {
        const top = sec.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // 事件：搜索框（带防抖）
  const searchEl = document.getElementById("search");
  let searchTimer = null;
  searchEl.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value;
      if (currentQuery && currentCat !== "all") {
        currentCat = "all";
        catNavEl.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
        catNavEl.querySelector('[data-cat="all"]').classList.add("active");
      }
      try {
        const url = new URL(window.location.href);
        if (currentQuery) url.searchParams.set("q", currentQuery);
        else url.searchParams.delete("q");
        history.replaceState(null, "", url.toString());
      } catch (e) { /* ignore */ }
      applyFilter();
    }, 80);
  });

  // 初始化：URL ?q= 和 ?cat= 参数
  (function initFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        searchEl.value = q;
        currentQuery = q;
      }
      const cat = params.get("cat");
      if (cat && cat !== "all") {
        // 验证 cat 是合法分类 id
        const valid = CATEGORIES.find((c) => c.id === cat);
        if (valid) currentCat = cat;
      }
    } catch (e) { /* ignore */ }
  })();

  // 事件：清空（ESC）
  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchEl.value = "";
      currentQuery = "";
      applyFilter();
    }
  });

  // 事件：/ 快捷键聚焦
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchEl) {
      e.preventDefault();
      searchEl.focus();
      searchEl.select();
    }
  });

  // 事件：空状态中"查看全部"链接
  document.getElementById("resetLink").addEventListener("click", (e) => {
    e.preventDefault();
    searchEl.value = "";
    currentQuery = "";
    currentCat = "all";
    syncCatUI();
    applyFilter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // 事件：语言切换（langchange 由 i18n.js 触发）
  window.addEventListener("langchange", () => {
    renderCatNav();
    applyFilter();
  });

  // 事件：语言切换按钮
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      I18N.setLang(btn.dataset.lang);
    });
  });

  // 首次渲染
  renderCatNav();
  renderStats();
  applyFilter();
})();
