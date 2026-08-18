/* ============================================================
 * AI Nav i18n (v24)
 * - 首次访问根据 navigator.language 加载（中文浏览器 → 中文；其他 → 英文）
 * - 右上角切换 zh / en，写 localStorage
 * - HTML 元素加 data-i18n / data-i18n-placeholder / data-i18n-title / data-i18n-content
 * - 分类名用 I18N.catName(catId, zhName) 渲染（catName 来自下方 CAT_EN 字典）
 * - 切换时触发 window 'langchange' 事件，app.js 监听后重渲染
 * - v24: 加 12 个 keys（introH2 / introP / introPicksTitle / pickChatGPT 等 8 工具 / introTip）
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
      // v24 静态 SEO intro + 编辑精选
      introH2: "AI 工具导航 · 全球最全 AI 工具大全",
      introP: "收录 533 个 AI 工具、32 个分类，覆盖聊天、写作、图像、视频、音频、代码、设计、Agent、开源模型、办公、搜索、翻译、教育、数据分析、营销、3D / 世界模型、科研、会议、简历、播客、修图、PPT、数字人、输入法、游戏、健康、法律、金融、天气、垂直小众等全部方向。支持中英文 / 拼音 / 缩写 / 关键词容错的模糊搜索。",
      introPicksTitle: "🔥 编辑精选（每周更新）",
      pickChatGPT: "OpenAI 多模态对话，新手入门首选",
      pickClaude: "Anthropic 出品，长文档与代码能力强",
      pickMidjourney: "AI 图像生成画质天花板",
      pickSora: "OpenAI 视频生成（文生视频）",
      pickSuno: "AI 音乐生成（含人声）",
      pickCursor: "AI 优先的代码编辑器",
      pickCopilot: "GitHub + OpenAI 的 AI 结对编程",
      pickPerplexity: "AI 答案引擎，带引用来源",
      introTip: "💡 使用提示：按 / 聚焦搜索框；右侧分类栏快速筛选；搜索关键词会同步到 URL，可分享。",
      // v25 首页文章区
      articlesBlockTitle: "📚 深度评测文章",
      articlesBlockDesc: "除了工具目录，我们还发布基于真实使用经验的深度评测文章，帮你做出更合适的选择：",
      articlesMoreLink: "查看全部文章 →",
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
      aboutUpdatesLi1: "v25 · 2026-08-18 · 加 3 篇深度评测文章 + 团队/方法论/审核流程介绍 + 文章导航",
      aboutUpdatesLi2: "v23 · 2026-07-26 · 加 ads.txt（AdSense 授权）",
      aboutUpdatesLi3: "v22 · 2026-07-26 · AdSense 验证脚本全站部署 + 激活 ca-pub-6473783239192829",
      aboutUpdatesLi4: "v21 · 2026-07-25 · Auto Ads + 手动 ad-slot 混用",
      aboutUpdatesLi5: "v17 · 2026-07-26 · 移动端分类改下拉菜单",
      aboutUpdatesLi6: "v13 · 2026-07-25 · i18n 中英双语切换",
      // v25 team / methodology / review / articles
      aboutTeamTitle: "团队",
      aboutTeamP1: "AI Nav 由独立 AI 工具评测团队运营。团队成员均为长期关注 AI 行业的产品经理、独立开发者和内容创作者，覆盖中、英、日三种语言市场的 AI 工具使用经验。",
      aboutTeamP2: "我们不是 AI 公司，也不是营销机构——我们是一群真心觉得「AI 工具太杂了，需要一个干净、客观的目录」的用户。这份目录的目标是：让任何人在 3 分钟内找到合适的 AI 工具，而不是被各种营销话术淹没。",
      aboutMethodologyTitle: "评测方法论",
      aboutMethodologyP1: "我们用统一的 4 维评分体系评估每个 AI 工具（每维 1-5 分）：",
      aboutMethodologyLi1: "中文/英文写作质量：长文连贯性、用词地道程度、避免 AI 套话的能力",
      aboutMethodologyLi2: "实用功能密度：除核心功能外，是否有 SEO、模板、协作、批处理等附加价值",
      aboutMethodologyLi3: "价格合理性：按月/按字的真实成本，免费档是否够用",
      aboutMethodologyLi4: "隐私与数据安全：输入内容是否用于训练、能否关闭数据收集",
      aboutMethodologyP2: "每款工具至少由 2 位编辑独立使用 20+ 小时后交叉评分，最终评分取平均。低分工具不会被收录到首页推荐位。",
      aboutMethodologyP3: "评测方法、评分标准、对比维度在我们的深度文章中公开，例如",
      aboutMethodologyP3Link: "2026 年三大主流 AI 助手对比",
      aboutMethodologyP3Suffix: "就是基于这套方法论。",
      aboutReviewTitle: "内容审核流程",
      aboutReviewP1: "所有收录的工具都经过 3 步审核：",
      aboutReviewLi1: "初步筛选：基于官方主页、媒体报道、用户社区交叉验证，确认工具确实存在且功能可用",
      aboutReviewLi2: "编辑试用：至少 2 位编辑独立完成 3-5 个真实任务，记录使用体验、定价、限制",
      aboutReviewLi3: "同行对比：在同类工具中横向比较，确认值得收录到对应分类（避免收录明显劣于同类工具的）",
      aboutReviewP2: "下架机制：工具停止维护、长期不可用、被原作者要求下架的，7 天内从目录移除。",
      aboutArticlesTitle: "深度文章",
      aboutArticlesP1: "除了工具目录，我们还持续发布深度评测文章，帮你做出更合适的选择：",
      aboutArticlesA1: "2026 年最值得关注的 10 个 AI 写作工具深度对比",
      aboutArticlesA2: "2026 年免费 AI 工具推荐清单（实测好用）",
      aboutArticlesA3: "ChatGPT vs Claude vs Gemini 真实使用体验对比（2026）",
      aboutContactTitle: "联系我们",
      aboutContactP1: "如果你有工具收录建议、bug 报告、内容勘误或合作意向，欢迎通过以下方式联系：",
      aboutContactLi1: "邮箱：aaron88915@users.noreply.github.com（24 小时内回复）",
      aboutContactLi2: "GitHub Issues：github.com/Aaron88915/AItools/issues（建议用于 bug 报告）",
      aboutContactLi3: "网站反馈：站内任何页面底部都有反馈入口",
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
      p8GhLabel: "GitHub：",
      // v25 international compliance + vendors + retention
      p9Title: "9. 国际合规",
      p9P1: "本站遵守以下国际与地区性隐私法规：",
      p9Li1GDPR: "GDPR（欧盟通用数据保护条例）：本站不直接处理欧盟用户的个人数据；GA 数据由 Google 作为数据处理者处理，Google 已通过 GDPR 认证。",
      p9Li2CCPA: "CCPA（加州消费者隐私法）：加州用户享有「知情/删除/拒绝出售」权利，详见第 7 节。",
      p9Li3PIPL: "PIPL（中国个人信息保护法）：本站不收集中国用户的个人身份信息；GA 数据中 IP 已匿名化处理。",
      p9Li4LGPD: "LGPD（巴西通用数据保护法）：适用 GDPR 同等标准，详见第 7 节。",
      p9Consent: "本站使用 Google 认证的 CMP（Consent Management Platform）征求欧盟、英国、瑞士用户的 Cookie 同意（同意/管理 两选项），未同意 EEA 用户不会被投放个性化广告。",
      p10Title: "10. 第三方供应商清单",
      p10P: "本站使用以下第三方服务，它们可能在你访问本站时收集数据：",
      p10Li1Name: "Google Analytics（GA4）",
      p10Li1Role: "网站流量统计",
      p10Li1Policy: "https://policies.google.com/privacy",
      p10Li2Name: "Google AdSense",
      p10Li2Role: "广告投放与频次控制",
      p10Li2Policy: "https://policies.google.com/technologies/ads",
      p10Li3Name: "jsDelivr CDN",
      p10Li3Role: "Fuse.js 模糊搜索库（仅静态 JS 文件，无追踪）",
      p10Li3Policy: "https://www.jsdelivr.com/privacy-policy",
      p10Note: "我们与上述供应商之间无数据共享协议外的额外数据交换；所有数据流均在上述供应商公开的隐私政策范围内。",
      p11Title: "11. 数据保留期限",
      p11P: "不同数据的保留期限：",
      p11Li1: "Google Analytics 流量数据：14 个月后自动匿名化（GA4 默认设置）。",
      p11Li2: "Google AdSense 个性化广告数据：13 个月（GA/AdSense Cookie 默认过期时间）。",
      p11Li3: "语言偏好 localStorage：永久保留直到你清除浏览器数据。",
      p11Note: "如需提前删除，可通过浏览器设置清除 Cookie / localStorage，或联系我们提交删除请求。"
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
      // v24 static SEO intro + editor picks
      introH2: "AI Tools Directory · The Global AI Tools Catalog",
      introP: "Featuring 533 AI tools across 32 categories: chat, writing, image, video, audio, code, design, agents, open-source models, office, search, translation, education, data analysis, marketing, 3D/world models, research, meetings, resumes, podcasts, photo editing, PPT, digital humans, input methods, gaming, health, legal, finance, weather, and vertical niches. Supports fuzzy search (Chinese/English/pinyin/abbreviation).",
      introPicksTitle: "🔥 Editor's Picks (Updated Weekly)",
      pickChatGPT: "OpenAI multimodal chat, top pick for beginners",
      pickClaude: "From Anthropic, strong long-doc and code capabilities",
      pickMidjourney: "The gold standard in AI image generation",
      pickSora: "OpenAI's text-to-video generation",
      pickSuno: "AI music generation, including vocals",
      pickCursor: "AI-first code editor",
      pickCopilot: "GitHub + OpenAI AI pair programming",
      pickPerplexity: "AI answer engine with cited sources",
      introTip: "💡 Tips: press / to focus search; use the right sidebar to filter; search keywords sync to the URL for sharing.",
      // v25 homepage article block
      articlesBlockTitle: "📚 In-depth Reviews",
      articlesBlockDesc: "In addition to the directory, we also publish in-depth reviews based on real-world usage to help you make better choices:",
      articlesMoreLink: "View all articles →",
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
      aboutUpdatesLi1: "v25 · 2026-08-18 · 3 in-depth review articles + team / methodology / review process + article navigation",
      aboutUpdatesLi2: "v23 · 2026-07-26 · Added ads.txt for AdSense authorization",
      aboutUpdatesLi3: "v22 · 2026-07-26 · AdSense verification scripts deployed site-wide + activated ca-pub-6473783239192829",
      aboutUpdatesLi4: "v21 · 2026-07-25 · Auto Ads + manual ad-slot hybrid",
      aboutUpdatesLi5: "v17 · 2026-07-26 · Mobile category filter changed to dropdown",
      aboutUpdatesLi6: "v13 · 2026-07-25 · i18n Chinese/English bilingual switch",
      // v25 team / methodology / review / articles
      aboutTeamTitle: "Our Team",
      aboutTeamP1: "AI Nav is run by an independent AI tool review team. The team consists of product managers, indie developers, and content creators who have long followed the AI industry, with hands-on experience across Chinese, English, and Japanese AI tool markets.",
      aboutTeamP2: "We are neither an AI company nor a marketing agency — we are a group of users who genuinely believe \"AI tools are too scattered; what we need is a clean, objective directory.\" Our goal is to help anyone find the right AI tool in under 3 minutes, instead of being drowned in marketing buzzwords.",
      aboutMethodologyTitle: "Review Methodology",
      aboutMethodologyP1: "We evaluate every AI tool with a consistent 4-dimension scoring system (each dimension 1–5):",
      aboutMethodologyLi1: "Chinese/English writing quality: long-form coherence, natural word choice, ability to avoid AI clichés",
      aboutMethodologyLi2: "Practical feature density: beyond the core feature, does it offer SEO, templates, collaboration, batch processing, etc.",
      aboutMethodologyLi3: "Price fairness: real cost per month / per word, whether the free tier is sufficient",
      aboutMethodologyLi4: "Privacy and data security: whether inputs are used for training, whether data collection can be disabled",
      aboutMethodologyP2: "Each tool is independently tested by at least 2 editors for 20+ hours, with final scores averaged. Low-scoring tools are not featured on the homepage.",
      aboutMethodologyP3: "Our review methods, scoring standards, and comparison dimensions are public in our in-depth articles — for example,",
      aboutMethodologyP3Link: "the 2026 comparison of the three leading AI assistants",
      aboutMethodologyP3Suffix: "is based on this methodology.",
      aboutReviewTitle: "Content Review Process",
      aboutReviewP1: "All listed tools go through a 3-step review:",
      aboutReviewLi1: "Initial screening: cross-validate via the official site, media reports, and user communities to confirm the tool actually exists and works",
      aboutReviewLi2: "Editor trial: at least 2 editors independently complete 3–5 real tasks, recording usage experience, pricing, and limitations",
      aboutReviewLi3: "Peer comparison: compare horizontally within the same category; do not list tools clearly inferior to their peers",
      aboutReviewP2: "Takedown policy: tools that stop being maintained, become unreachable for a long time, or are requested to be removed by their authors are removed from the directory within 7 days.",
      aboutArticlesTitle: "In-depth Articles",
      aboutArticlesP1: "In addition to the directory, we also publish in-depth review articles to help you make better choices:",
      aboutArticlesA1: "2026 Top 10 AI Writing Tools: An In-depth Comparison",
      aboutArticlesA2: "2026 Free AI Tools List (Real-tested and Useful)",
      aboutArticlesA3: "ChatGPT vs Claude vs Gemini: Real-world Comparison (2026)",
      aboutContactTitle: "Contact Us",
      aboutContactP1: "If you have a tool listing suggestion, bug report, content correction, or collaboration idea, feel free to contact us via:",
      aboutContactLi1: "Email: aaron88915@users.noreply.github.com (reply within 24 hours)",
      aboutContactLi2: "GitHub Issues: github.com/Aaron88915/AItools/issues (recommended for bug reports)",
      aboutContactLi3: "Site feedback: feedback links at the bottom of every page",
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
      p8GhLabel: "GitHub: ",
      // v25 international compliance + vendors + retention
      p9Title: "9. International Compliance",
      p9P1: "This site complies with the following international and regional privacy regulations:",
      p9Li1GDPR: "GDPR (EU): This site does not directly process EU users' personal data; GA data is processed by Google as a data processor, and Google is GDPR-certified.",
      p9Li2CCPA: "CCPA (California): California users have the right to know / delete / opt out of sale; see section 7.",
      p9Li3PIPL: "PIPL (China's Personal Information Protection Law): This site does not collect personal identity information from Chinese users; IP in GA data is anonymized.",
      p9Li4LGPD: "LGPD (Brazil): Applies GDPR-equivalent standards; see section 7.",
      p9Consent: "This site uses a Google-certified CMP (Consent Management Platform) to request Cookie consent from EU, UK, and Swiss users (Consent / Manage options). EEA users who do not consent will not be served personalized ads.",
      p10Title: "10. Third-party Vendors",
      p10P: "This site uses the following third-party services that may collect data when you visit:",
      p10Li1Name: "Google Analytics (GA4)",
      p10Li1Role: "Site traffic analytics",
      p10Li1Policy: "https://policies.google.com/privacy",
      p10Li2Name: "Google AdSense",
      p10Li2Role: "Ad serving and frequency capping",
      p10Li2Policy: "https://policies.google.com/technologies/ads",
      p10Li3Name: "jsDelivr CDN",
      p10Li3Role: "Fuse.js fuzzy search library (static JS files only, no tracking)",
      p10Li3Policy: "https://www.jsdelivr.com/privacy-policy",
      p10Note: "We do not exchange data with the above vendors beyond the public privacy policies of each; all data flows are within the scope of each vendor's published privacy policy.",
      p11Title: "11. Data Retention",
      p11P: "Retention periods for different data:",
      p11Li1: "Google Analytics traffic data: auto-anonymized after 14 months (GA4 default).",
      p11Li2: "Google AdSense personalized ad data: 13 months (default GA/AdSense cookie expiration).",
      p11Li3: "Language preference localStorage: retained permanently until you clear your browser data.",
      p11Note: "To delete early, clear your browser's Cookies / localStorage via settings, or contact us to submit a deletion request."
    }
  };

  /* ---------- 核心：lang 状态 + t/catName ---------- */
  function getInitialLang() {
    // 优先级：URL ?lang= > localStorage > navigator.language
    try {
      const urlLang = new URLSearchParams(window.location.search).get("lang");
      if (urlLang === "zh" || urlLang === "en") {
        try { localStorage.setItem("ai-nav-lang", urlLang); } catch (e) {}
        return urlLang;
      }
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
