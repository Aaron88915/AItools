# AI Nav · 全球 AI 工具导航

> 一个纯静态的 AI 工具导航站，分类齐全、模糊搜索、i18n 中英双语。GitHub Pages 一键部署。

🔗 **在线访问**：https://aitools-nav.xyz/

## 特性

- **533 个 AI 工具**（按 name+url+category 去重后），覆盖 **32 个分类**（聊天、写作、图像、视频、音频、代码、设计、Agent、开源模型、办公、搜索、浏览器、翻译、教育、数据分析、营销、3D/空间、世界模型、科研、会议、简历、播客、修图、PPT、数字人、输入法、游戏、健康、法律、金融、天气、垂直小众）
- **Fuse.js 模糊搜索**：支持中文/拼音/缩写/同义词容错，4 字段加权（name 0.55 / tags 0.30 / desc 0.10 / category 0.05）
- **分类筛选**：右侧 sidebar（桌面端）/ 顶部横排 sticky（移动端），同一 DOM 自适应
- **URL 分享搜索结果**：`?q=xxx`
- **/ 快捷键聚焦搜索** · **ESC 清空**
- **i18n 中英双语**：右上角「中 / EN」切换；首次访问按浏览器语言自动加载；533 个工具的 desc 全部双语；支持 `?lang=zh|en` URL 参数强制指定
- **暗色科技感主题**（青-靛-紫渐变），玻璃拟态，0 第三方运行时依赖（仅 jsDelivr CDN 加载 Fuse.js）
- **响应式**：桌面 1480px 容器 / 平板 900px 切换 / 手机 480px 单列
- **零构建** · 零后端 · 0 JS 框架 · 加载即用
- **Google Analytics** (G-SKES4GTDCS) + **Google AdSense** Auto Ads（ca-pub 占位，审核通过后 sed 替换）

## 文件结构

```
ai-nav/
├── index.html        # 入口（含 lang 切换、搜索、分类、工具卡片）
├── about.html        # 关于页（双语）
├── privacy.html      # 隐私政策（双语）
├── styles.css        # 主题 + 布局 + 移动端适配
├── i18n.js           # 中英字典 + 32 分类翻译 + 自动检测
├── app.js            # 渲染 + 搜索 + 分类筛选 + langchange 监听
├── data.js           # 533 工具 + 32 分类（每条含 desc + descEn）
├── logo.svg          # 神经网络 logo
├── sitemap.xml       # 85 URL（首页 + about + privacy + 32 分类 + 50 工具）
├── robots.txt        # 允许全站收录
├── CNAME             # aitools-nav.xyz
├── README.md
└── .gitignore
```

## 本地预览

```bash
# 任意静态 server（python / npx serve / PowerShell HttpListener 都行）
py -m http.server 8765
# 浏览器打开 http://localhost:8765
```

## 部署到 GitHub Pages

1. Push 到 `main` 分支
2. 仓库 Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`
3. Custom domain: `aitools-nav.xyz`（DNS：A 记录 4 个 + CNAME www；详见 commit `900797e`）
4. Enforce HTTPS 启用（Let's Encrypt 自动签发）
5. 等待 1-2 分钟，访问 `https://aitools-nav.xyz/`

## 维护

### 加新工具
编辑 `data.js`，在 `TOOLS` 数组里复制一个对象，改字段：
```js
{ name: "工具名", desc: "中文描述", descEn: "English description", url: "https://...", category: "分类id", tags: ["关键词"] }
```
分类 id 见上方 `CATEGORIES` 数组。

### 改文案/翻译
- UI 文案（按钮/标题/footer/空状态）→ 改 `i18n.js` 里的 `DICTS.zh` / `DICTS.en`
- 32 个分类中英对照 → 改 `i18n.js` 里的 `CAT_EN`
- about / privacy 全文翻译 → 改 `i18n.js` 对应 key + `about.html` / `privacy.html` 加 `data-i18n` 属性

### 改完 push
- 给 `index.html` / `styles.css` / `app.js` / `data.js` / `i18n.js` / `about.html` / `privacy.html` 里的 `?v=N` 升个号（当前 v15）
- commit + push，等 1-2 分钟 GitHub Pages 部署

## SEO

- `sitemap.xml`：自动包含首页 + about + privacy + 32 分类 + 50 热门工具搜索 URL
- `robots.txt`：允许全站收录，指向 sitemap
- `about.html` / `privacy.html`：双语静态页，提升 SEO + AdSense 审核必需要求
- 提交到 Google Search Console / 百度站长平台 后，收录速度会快很多

## 致谢

数据收录自互联网公开信息。工具归各自作者所有。本站仅作导航整理，不对第三方服务承担责任。
