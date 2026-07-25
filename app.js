/* ============================================================
 * AI Nav · 主逻辑
 * - 分类导航 + 卡片渲染
 * - Fuse.js 模糊搜索（容错、支持多关键词）
 * - 分类筛选 + / 快捷键
 * ============================================================ */
(function () {
  "use strict";

  const { CATEGORIES, TOOLS } = window.AI_NAV;

  // ---------- 工具：按分类查名字 ----------
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
  const catEmoji = (id) => (CATEGORIES.find((c) => c.id === id) || {}).icon || "✨";

  // ---------- 工具：去重（按 name+url 唯一 key，保留跨分类的同工具） ----------
  const dedup = (() => {
    const seen = new Set();
    return TOOLS.filter((t) => {
      // 跨分类的同工具（name+url 相同）会被去重一次，只保留首次出现；
      // 跨分类的条目（name+url 相同但 category 不同）则会被保留为多分类入口
      const key = `${t.name} ${t.url} ${t.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // ---------- 工具：分组 ----------
  const groupByCategory = (tools) => {
    const map = new Map();
    for (const t of tools) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category).push(t);
    }
    return map;
  };

  // ---------- 渲染：分类导航 ----------
  const catNavEl = document.getElementById("catNav");
  CATEGORIES.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "cat-chip";
    btn.dataset.cat = c.id;
    btn.innerHTML = `<span>${c.icon}</span> ${c.name}`;
    catNavEl.appendChild(btn);
  });

  // ---------- 渲染：统计 ----------
  document.getElementById("stat-total").textContent = dedup.length;
  document.getElementById("stat-cat").textContent = CATEGORIES.length;
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- 渲染：主体（按分类分组展示） ----------
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
      sec.innerHTML = `
        <h2 class="cat-title">
          <span class="cat-emoji">${c.icon}</span>
          <span>${c.name}</span>
          <span class="cat-count">${list.length} 个</span>
        </h2>
        <div class="tool-grid"></div>
      `;
      const grid = sec.querySelector(".tool-grid");
      list.forEach((t) => grid.appendChild(buildCard(t)));
      contentEl.appendChild(sec);
    });
  }

  // ---------- 渲染：单个卡片 ----------
  function buildCard(t) {
    const a = document.createElement("a");
    a.className = "tool-card";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.name = t.name;
    a.dataset.category = t.category;
    a.title = `${t.name} · ${t.desc}`;
    a.innerHTML = `
      <div class="tool-name">${escapeHTML(t.name)}</div>
      <div class="tool-desc">${escapeHTML(t.desc || "")}</div>
    `;
    return a;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // ---------- 搜索（Fuse.js 模糊搜索） ----------
  // 字段权重: name > tags > desc > category
  const fuse = new Fuse(dedup, {
    keys: [
      { name: "name",     weight: 0.55 },
      { name: "tags",     weight: 0.30 },
      { name: "desc",     weight: 0.10 },
      { name: "category", weight: 0.05 }
    ],
    threshold: 0.4,        // 模糊度：值越大越"模糊"
    ignoreLocation: true,  // 不强制位置匹配
    minMatchCharLength: 1,
    includeScore: false
  });

  // ---------- 当前过滤状态 ----------
  let currentCat = "all";
  let currentQuery = "";

  function applyFilter() {
    let list = dedup;
    // 分类筛选
    if (currentCat !== "all") list = list.filter((t) => t.category === currentCat);
    // 搜索
    const q = currentQuery.trim();
    if (q) {
      const results = fuse.search(q).map((r) => r.item);
      list = list.filter((t) => results.includes(t));
    }
    renderSections(list);
  }

  // ---------- 事件：分类 chip ----------
  catNavEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".cat-chip");
    if (!chip) return;
    catNavEl.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentCat = chip.dataset.cat;
    applyFilter();
    // 滚动到对应锚点（如果是"全部"，滚到顶部）
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

  // ---------- 事件：搜索框（带防抖） ----------
  const searchEl = document.getElementById("search");
  let searchTimer = null;
  searchEl.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value;
      // 搜索时自动切到"全部"，避免看不到结果
      if (currentQuery && currentCat !== "all") {
        currentCat = "all";
        catNavEl.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
        catNavEl.querySelector('[data-cat="all"]').classList.add("active");
      }
      // 同步 URL（方便分享 / 浏览器后退）
      try {
        const url = new URL(window.location.href);
        if (currentQuery) url.searchParams.set("q", currentQuery);
        else url.searchParams.delete("q");
        history.replaceState(null, "", url.toString());
      } catch (e) { /* ignore */ }
      applyFilter();
    }, 80);
  });

  // ---------- 初始化：URL ?q= 参数 ----------
  (function initFromURL() {
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) {
        searchEl.value = q;
        currentQuery = q;
      }
    } catch (e) { /* ignore */ }
  })();

  // ---------- 事件：清空（ESC） ----------
  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchEl.value = "";
      currentQuery = "";
      applyFilter();
    }
  });

  // ---------- 事件：/ 快捷键聚焦 ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchEl) {
      e.preventDefault();
      searchEl.focus();
      searchEl.select();
    }
  });

  // ---------- 事件：空状态中的"查看全部"链接 ----------
  document.getElementById("resetLink").addEventListener("click", (e) => {
    e.preventDefault();
    searchEl.value = "";
    currentQuery = "";
    currentCat = "all";
    catNavEl.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
    catNavEl.querySelector('[data-cat="all"]').classList.add("active");
    applyFilter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- 首次渲染 ----------
  applyFilter();
})();
