/* ============================================================
 * AI Nav i18n (v13)
 * - 首次访问根据 navigator.language 加载（中文浏览器 → 中文；其他 → 英文）
 * - 右上角切换 zh / en，写 localStorage
 * - HTML 元素加 data-i18n / data-i18n-placeholder / data-i18n-title / data-i18n-content
 * - 分类名用 I18N.catName(catId, zhName) 渲染（catName 来自下方 CAT_EN 字典）
 * - 切换时触发 window 'langchange' 事件，app.js 监听后重渲染
 * ============================================================ */
(function () {
  "use strict";

  /* ---------- 32 个分类英文翻译（id 与 data.js CATEGORIES 一致） ---------- */
  const CAT_EN = {
    "chat":         "AI Chat",
    "writing":      "Text / Writing",
    "image":        "Image Generation",
    "video":        "Video Generation",
    "audio":        "Audio / Music",
    "code":         "Code Development",
    "design":       "Design / UI",
    "agent":        "AI Agents",
    "opensource":   "Open-source Models",
    "office":       "Office Productivity",
    "search":       "AI Search",
    "browser":      "AI Browsers",
    "translate":    "Translation",
    "edu":          "Education",
    "data":         "Data Analysis",
    "marketing":    "Marketing / Business",
    "3d":           "3D / Spatial",
    "world":        "World Models",
    "research":     "Research / Science",
    "meeting":      "Meetings / Notes",
    "resume":       "Resume / Recruiting",
    "podcast":      "Podcast / Voice",
    "photo":        "Photo Editing",
    "ppt":          "PPT Creation",
    "digitalhuman": "AI Digital Human",
    "input":        "AI Input Method",
    "gaming":       "Gaming / Entertainment",
    "health":       "Health / Medical",
    "legal":        "Legal",
    "finance":      "Finance",
    "weather":      "Weather / Life",
    "niche":        "Vertical / Niche"
  };

  /* ---------- UI 文案字典 ---------- */
  const DICTS = {
    zh: {
      siteTitle: "AI Nav · 全球 AI 工具导航",
      siteDesc:  "收录全球 280+ AI 工具的导航站，分类齐全，支持模糊搜索。涵盖聊天、绘画、视频、写作、代码、办公、设计等全部主流方向。",
      siteKeywords: "AI 工具,AI 导航,AI 工具大全,ChatGPT,Midjourney,Sora,Claude,DeepSeek,通义千问,文心一言,AI 写作,AI 绘画,AI 编程",
      brandSub:  "全球 AI 工具导航 · 持续更新",
      placeholder: "搜索工具名、关键词、分类…   如：gpt、绘画、国产、代码",
      statTools: "个工具",
      statCats:  "个分类",
      catAll:    "全部",
      emptyTitle: "没找到匹配的工具",
      emptyDesc:  "试试别的关键词，或者",
      emptyReset: "查看全部",
      footerCopyright: "收录于互联网公开信息，工具归各自作者所有",
      footerNote: "本站仅作导航整理",
      footerAbout:   "关于",
      footerPrivacy: "隐私政策",
      footerGithub:  "GitHub",
      backHome: "← 返回 AI Nav 首页",
      langLabel: "中",
      // about.html
      aboutTitle:    "关于 AI Nav · 全球 AI 工具导航",
      aboutMetaDesc: "AI Nav 是一个收录全球 AI 工具的静态导航站，分类齐全、支持模糊搜索、纯静态可一键部署到 GitHub Pages。",
      aboutH1:    "关于 AI Nav",
      aboutH1Sub: "一个收录全球 AI 工具的静态导航站",
      aboutWhatTitle: "这是什么",
      aboutWhatP1: "AI Nav 是一个纯静态的 AI 工具导航站，目前收录 533 个工具、32 个分类，涵盖聊天、写作、图像、视频、音频、代码、设计、Agent、开源模型、办公、搜索、翻译、教育、数据分析、营销、3D/空间、世界模型、科研、会议、简历、播客、修图、PPT、数字人、输入法、游戏、健康、法律、金融、天气、垂直小众等所有主流方向。",
      aboutWhatP2: "支持 Fuse.js 模糊搜索（中英文 / 拼音 / 缩写 / 关键词容错）、分类筛选、URL 分享搜索结果。整个站点只有 6 个文件，0 第三方运行时依赖（仅 jsDelivr CDN 加载 Fuse.js），加载即用。",
      aboutStackTitle:   "技术栈",
      aboutStackLi1: "纯静态：HTML + CSS + Vanilla JS，零构建",
      aboutStackLi2Prefix: "模糊搜索：",
      aboutStackLi2Suffix: "（CDN）",
      aboutStackLi3: "部署：GitHub Pages（CDN + HTTPS + 自定义域名支持）",
      aboutStackLi4: "分析：Google Analytics（G-SKES4GTDCS）",
      aboutStackLi5: "广告：Google AdSense（审核中）",
      aboutSourceTitle: "数据来源与免责",
      aboutSourceP1: "本站所有工具信息均来自互联网公开资料（官方主页、媒体报道、用户社区），按公开用途整理。本站仅作导航整理，不对第三方服务承担任何责任。工具归各自作者所有，访问相应服务时受其服务条款约束。",
      aboutSourceP2a: "如果你是某个工具的作者，认为收录有误或想下架，",
      aboutSourceP2b: "联系我们",
      aboutSourceP2c: "，我们会在 24 小时内处理。",
      aboutUpdatesTitle: "更新记录",
      aboutUpdatesLi1: "v8 · 2026-07-25 · 加 AdSense 占位 + Google Analytics + sitemap + robots",
      aboutUpdatesLi2: "v6 · 2026-07-25 · dedup 优化：跨分类同工具保留，删除 18 个纯冗余",
      aboutUpdatesLi3: "v4 · 2026-07-25 · 597 → 533 工具，分类导航改到右侧 sidebar，移动端顶部横排",
      aboutUpdatesLi4: "v3 · 2026-07-24 · 528 工具，28 分类上线",
      // privacy.html
      privacyTitle:    "隐私政策 · AI Nav · 全球 AI 工具导航",
      privacyMetaDesc: "AI Nav 隐私政策：关于 Google Analytics 流量统计、Google AdSense 广告投放、Cookie 使用、数据共享的完整说明。",
      privacyH1:    "隐私政策",
      privacyH1Sub: "最后更新：2026-07-25",
      privacyIntroTitle: "简介",
      privacyIntroP1: "AI Nav（以下简称\"本站\"）尊重并保护所有使用本站服务用户的个人隐私权。本隐私政策介绍我们在你访问本站时如何收集、使用、储存和分享你的信息。",
      privacyIntroP2: "本政策适用于",
      privacyIntroP2Domain: "https://aitools-nav.xyz/",
      privacyIntroP2Suffix: "下的所有页面。",
      // 1
      p1Title: "1. 我们收集的信息",
      p11Title: "1.1 自动收集（Google Analytics）",
      p11P: "本站使用 Google Analytics (GA4) 统计访问数据，衡量 ID 为",
      p11PDomain: "G-SKES4GTDCS",
      p11P2: "GA 会自动收集：",
      p11Li1: "设备与浏览器信息（操作系统、浏览器类型、屏幕尺寸）",
      p11Li2: "访问页面、停留时长、跳出率",
      p11Li3: "大致地理位置（国家/城市级，不含精确坐标）",
      p11Li4: "来源（搜索词、推荐链接）",
      p11Note: "我们开启了 IP 匿名化（Anonymize IP），GA 不会收到你的完整 IP。",
      p11PDot: "。",
      p12Title: "1.2 你主动提供",
      p12P: "本站不要求注册、不要求登录、不收集邮箱/手机号等个人信息。你在搜索框输入的关键词会通过 URL 参数同步（仅用于分享/恢复当前筛选状态），不会上传到任何服务器。",
      // 2
      p2Title: "2. Cookie 与本地存储",
      p2P: "本站使用以下 Cookie / 本地存储：",
      p2Li1: "语言偏好（ai-nav-lang）：localStorage，记住你选择的中文/英文。",
      p2Li2: "Google Analytics Cookie：_ga / _ga_xxxxxx，用于统计独立访客，13 个月后自动过期。",
      p2Li3: "Google AdSense Cookie：用于广告投放与频次控制。",
      p2Note: "你可以在浏览器设置中清除/禁用上述 Cookie，禁用后部分功能（如语言记忆、广告频次控制）将失效。",
      // 3
      p3Title: "3. 广告（Google AdSense）",
      p3P: "本站使用 Google AdSense 展示广告（Auto Ads 自动广告模式）。AdSense 可能使用 Cookie 推送与你兴趣相关的广告。",
      p3Li1: "Google 作为第三方供应商，会使用 Cookie 在本站或其他网站投放广告。",
      p3Li2: "Google 使用 DART Cookie 使 Google 合作伙伴（包括本站）能够基于用户访问本站或其他网站的情况展示广告。",
      p3Li3a: "你可以访问 ",
      p3Li3Link: "Google 广告设置",
      p3Li3b: " 关闭个性化广告。",
      p3Note: "本站不为任何第三方广告内容负责，点击广告产生的后果由广告主承担。",
      // 4
      p4Title: "4. 数据共享",
      p4P: "我们不向任何第三方出售你的个人信息。仅在以下场景共享：",
      p4Li1: "Google Analytics / AdSense 的自动化数据收集（见 1.1、3）。",
      p4Li2: "法律法规要求或保护人身安全的紧急情况。",
      // 5
      p5Title: "5. 儿童隐私",
      p5P: "本站面向全年龄段访客，但内容偏专业，不针对 14 岁以下儿童。我们不会故意收集 14 岁以下儿童的信息。如果发现，我们会在 24 小时内删除。",
      // 6
      p6Title: "6. 数据安全",
      p6P: "本站采用 HTTPS 加密传输。本地 localStorage 不含敏感信息。即便如此，没有任何系统是 100% 安全的，如发现安全漏洞请联系我们。",
      // 7
      p7Title: "7. 你的权利",
      p7P: "依据 GDPR / CCPA 等隐私法规，你享有以下权利：",
      p7Li1: "知情权：知道我们收集什么、怎么用。",
      p7Li2: "访问权：向 Google 申请 GA 数据的导出或删除（Google 提供 GA 数据删除工具）。",
      p7Li3: "删除权：清除浏览器 Cookie / localStorage 即可。",
      p7Li4a: "拒绝个性化广告：",
      p7Li4Link: "Google 广告设置",
      p7Li4b: "。",
      // 8
      p8Title: "8. 联系我们",
      p8P: "如有隐私相关问题或下架申请，请通过 GitHub Issues 或邮件联系：",
      p8MailLabel: "邮箱：",
      p8Mail: "aaron88915@users.noreply.github.com",
      p8GhLabel: "GitHub："
    },
    en: {
      siteTitle: "AI Nav · Global AI Tools Directory",
      siteDesc:  "A directory of 280+ AI tools worldwide with category browsing and fuzzy search. Covers chat, image, video, writing, code, office, design and more.",
      siteKeywords: "AI tools, AI directory, AI navigation, ChatGPT, Midjourney, Sora, Claude, DeepSeek, AI writing, AI image, AI coding",
      brandSub:  "Global AI Tools Directory · Updated regularly",
      placeholder: "Search tools, keywords, categories…   e.g.: gpt, image, open-source, code",
      statTools: "tools",
      statCats:  "categories",
      catAll:    "All",
      emptyTitle: "No matching tools found",
      emptyDesc:  "Try a different keyword, or",
      emptyReset: "view all",
      footerCopyright: "Compiled from public information. Tools belong to their respective authors.",
      footerNote: "For navigation purposes only",
      footerAbout:   "About",
      footerPrivacy: "Privacy",
      footerGithub:  "GitHub",
      backHome: "← Back to AI Nav",
      langLabel: "EN",
      // about.html
      aboutTitle:    "About AI Nav · Global AI Tools Directory",
      aboutMetaDesc: "AI Nav is a static directory of global AI tools with full categories, fuzzy search, and one-click GitHub Pages deployment.",
      aboutH1:    "About AI Nav",
      aboutH1Sub: "A static directory of global AI tools",
      aboutWhatTitle: "What is this",
      aboutWhatP1: "AI Nav is a static AI tools directory, currently featuring 533 tools across 32 categories, covering chat, writing, image, video, audio, code, design, agents, open-source models, office, search, translation, education, data analysis, marketing, 3D/spatial, world models, research, meetings, resumes, podcasts, photo editing, PPT, digital humans, input methods, gaming, health, legal, finance, weather, and niche verticals.",
      aboutWhatP2: "It supports Fuse.js fuzzy search (Chinese/English/pinyin/abbreviation/keyword tolerance), category filtering, and URL-shareable search results. The entire site is just 6 files with zero runtime dependencies (only Fuse.js loaded from jsDelivr CDN).",
      aboutStackTitle:   "Tech Stack",
      aboutStackLi1: "Pure static: HTML + CSS + Vanilla JS, zero build step",
      aboutStackLi2Prefix: "Fuzzy search: ",
      aboutStackLi2Suffix: " (CDN)",
      aboutStackLi3: "Hosting: GitHub Pages (CDN + HTTPS + custom domain)",
      aboutStackLi4: "Analytics: Google Analytics (G-SKES4GTDCS)",
      aboutStackLi5: "Ads: Google AdSense (under review)",
      aboutSourceTitle: "Data Sources & Disclaimer",
      aboutSourceP1: "All tool information is compiled from public sources (official sites, media, user communities). This site is for navigation only and takes no responsibility for any third-party services. Tools belong to their respective authors; by visiting them you agree to their own terms of service.",
      aboutSourceP2a: "If you are the author of a tool and want a correction or takedown,",
      aboutSourceP2b: "contact us",
      aboutSourceP2c: " — we will handle it within 24 hours.",
      aboutUpdatesTitle: "Changelog",
      aboutUpdatesLi1: "v8 · 2026-07-25 · AdSense placeholders + Google Analytics + sitemap + robots",
      aboutUpdatesLi2: "v6 · 2026-07-25 · dedup fix: keep cross-category entries, remove 18 pure duplicates",
      aboutUpdatesLi3: "v4 · 2026-07-25 · 597 → 533 tools, sidebar navigation, mobile horizontal chips",
      aboutUpdatesLi4: "v3 · 2026-07-24 · 528 tools across 28 categories launched",
      // privacy.html
      privacyTitle:    "Privacy Policy · AI Nav · Global AI Tools Directory",
      privacyMetaDesc: "AI Nav Privacy Policy: details on Google Analytics, Google AdSense, cookies, and data sharing.",
      privacyH1:    "Privacy Policy",
      privacyH1Sub: "Last updated: 2026-07-25",
      privacyIntroTitle: "Introduction",
      privacyIntroP1: "AI Nav (the \"Site\") respects and protects the personal privacy of all users. This Privacy Policy describes how we collect, use, store and share your information when you visit the Site.",
      privacyIntroP2: "This policy applies to all pages under",
      privacyIntroP2Domain: "https://aitools-nav.xyz/",
      privacyIntroP2Suffix: ".",
      // 1
      p1Title: "1. Information We Collect",
      p11Title: "1.1 Automatic collection (Google Analytics)",
      p11P: "This site uses Google Analytics (GA4) for traffic statistics, with measurement ID",
      p11PDomain: "G-SKES4GTDCS",
      p11P2: "GA automatically collects:",
      p11Li1: "Device and browser info (OS, browser type, screen size)",
      p11Li2: "Page views, time on site, bounce rate",
      p11Li3: "Coarse geographic location (country/city level, not precise coordinates)",
      p11Li4: "Traffic source (search keywords, referrer)",
      p11Note: "IP anonymization is enabled — GA never receives your full IP.",
      p11PDot: ".",
      p12Title: "1.2 Information you provide",
      p12P: "This site requires no registration or login, and does not collect email/phone numbers. Search keywords are synced via URL parameters (only for sharing/restoring current filter state) and are not uploaded to any server.",
      // 2
      p2Title: "2. Cookies & Local Storage",
      p2P: "This site uses the following cookies and local storage:",
      p2Li1: "Language preference (ai-nav-lang): localStorage, remembers your chosen Chinese/English.",
      p2Li2: "Google Analytics cookies: _ga / _ga_xxxxxx, for unique visitor counting, expire after 13 months.",
      p2Li3: "Google AdSense cookies: for ad serving and frequency capping.",
      p2Note: "You can clear or disable the above cookies in your browser settings. Disabling them may affect some features (language memory, ad frequency control).",
      // 3
      p3Title: "3. Advertising (Google AdSense)",
      p3P: "This site uses Google AdSense Auto Ads. AdSense may use cookies to serve ads relevant to your interests.",
      p3Li1: "Google, as a third-party vendor, uses cookies to serve ads on this site or other sites.",
      p3Li2: "Google's use of DART cookies enables Google and its partners (including this site) to serve ads based on your visit to this site and/or other sites.",
      p3Li3a: "You can opt out of personalized ads via ",
      p3Li3Link: "Google Ads Settings",
      p3Li3b: ".",
      p3Note: "This site is not responsible for any third-party ad content. Any consequences from clicking ads are borne by the advertiser.",
      // 4
      p4Title: "4. Data Sharing",
      p4P: "We do not sell your personal information to any third party. Sharing only occurs in the following scenarios:",
      p4Li1: "Automated collection by Google Analytics / AdSense (see 1.1, 3).",
      p4Li2: "When required by law or to protect personal safety in emergencies.",
      // 5
      p5Title: "5. Children's Privacy",
      p5P: "This site serves all age groups, but the content is professional and not targeted at children under 14. We do not knowingly collect information from children under 14. If discovered, we will delete it within 24 hours.",
      // 6
      p6Title: "6. Data Security",
      p6P: "This site uses HTTPS encryption in transit. Local localStorage contains no sensitive information. No system is 100% secure — if you find a security issue, please contact us.",
      // 7
      p7Title: "7. Your Rights",
      p7P: "Under privacy regulations like GDPR / CCPA, you have the following rights:",
      p7Li1: "Right to know: what we collect and how we use it.",
      p7Li2: "Right to access: request export or deletion of GA data from Google (Google provides GA data deletion tools).",
      p7Li3: "Right to delete: clear browser cookies / localStorage.",
      p7Li4a: "Right to opt out of personalized ads: ",
      p7Li4Link: "Google Ads Settings",
      p7Li4b: ".",
      // 8
      p8Title: "8. Contact Us",
      p8P: "For privacy questions or takedown requests, contact us via GitHub Issues or email:",
      p8MailLabel: "Email: ",
      p8Mail: "aaron88915@users.noreply.github.com",
      p8GhLabel: "GitHub: "
    }
  };

  /* ---------- 核心：lang 状态 + t/catName ---------- */
  function getInitialLang() {
    try {
      const saved = localStorage.getItem("ai-nav-lang");
      if (saved === "zh" || saved === "en") return saved;
    } catch (e) {}
    const browser = (navigator.language || "en").toLowerCase();
    return browser.startsWith("zh") ? "zh" : "en";
  }

  let currentLang = getInitialLang();

  function t(key) {
    return (DICTS[currentLang] && DICTS[currentLang][key])
        || (DICTS.zh[key])
        || key;
  }

  // 分类名：根据 id 选英文 fallback 中文
  function catName(id, zhName) {
    if (currentLang === "en") return CAT_EN[id] || zhName || id;
    return zhName || CAT_EN[id] || id;
  }

  /* ---------- 扫描 + 替换所有 data-i18n 元素 ---------- */
  function applyI18n() {
    // html lang
    document.documentElement.lang = (currentLang === "zh") ? "zh-CN" : "en";
    // text
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    // placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    // title 属性
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    // meta content（动态切换 description / keywords）
    document.querySelectorAll("[data-i18n-content]").forEach((el) => {
      el.setAttribute("content", t(el.getAttribute("data-i18n-content")));
    });
    // <title> 元素
    document.querySelectorAll("[data-i18n-html-title]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n-html-title"));
    });
    // 切换按钮 active 状态
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === currentLang);
    });
    // 通知 app.js 重渲染分类名
    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang: currentLang } }));
  }

  function setLang(lang) {
    if (lang !== "zh" && lang !== "en") return;
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem("ai-nav-lang", lang); } catch (e) {}
    applyI18n();
  }

  // 暴露
  window.I18N = {
    t, setLang, getLang: () => currentLang, catName, applyI18n,
    onReady: (cb) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", cb, { once: true });
      } else {
        cb();
      }
    }
  };

  // DOMContentLoaded 时执行首次 i18n 替换
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyI18n, { once: true });
  } else {
    applyI18n();
  }
})();
