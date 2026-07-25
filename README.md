# AI Nav · 全球 AI 工具导航

> 一个纯静态的 AI 工具导航站，分类齐全、模糊搜索。GitHub Pages 一键部署。

🔗 **在线访问**：https://aaron88915.github.io/AItools/

## 特性

- **597 个 AI 工具**，覆盖 32 个分类（聊天、写作、图像、视频、音频、代码、设计、Agent、开源模型、办公、搜索、浏览器、翻译、教育、数据分析、营销、3D/空间、世界模型、科研、会议、简历、播客、修图、PPT、数字人、输入法、游戏、健康、法律、金融、天气、垂直小众）
- **Fuse.js 模糊搜索**：支持中文/拼音/缩写/同义词容错，4 字段加权（name 0.55 / tags 0.30 / desc 0.10 / category 0.05）
- **分类筛选**：右侧 sidebar 桌面端 / 顶部横排移动端（同一 DOM 自适应）
- **URL 分享搜索结果**：`?q=xxx`
- **/ 快捷键聚焦搜索** · **ESC 清空**
- **暗色科技感主题**（青-靛-紫渐变），玻璃拟态，0 第三方运行时依赖（仅 jsDelivr CDN 加载 Fuse.js）
- **响应式**：桌面 1480px 容器 / 平板 900px 切换 / 手机 480px 单列
- **零构建** · 零后端 · 0 JS 框架 · 加载即用

## 文件结构

```
ai-nav/
├── index.html        # 入口
├── styles.css        # 主题 + 布局
├── app.js            # 渲染 + 搜索逻辑
├── data.js           # 597 工具 + 32 分类
├── logo.svg          # logo
├── README.md
└── .gitignore
```

## 本地预览

```bash
# 需要 Python 3
py -m http.server 8765
# 浏览器打开 http://localhost:8765
```

## 部署到 GitHub Pages

1. Push 到 `main` 分支
2. 仓库 Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`
3. 等待 1-2 分钟，访问 `https://<user>.github.io/<repo>/`

## 维护

更新 `data.js` 中的 `CATEGORIES` 和 `TOOLS` 数组即可。改完别忘了给 `index.html` 里的 `?v=N` 升个号强制刷缓存。

## SEO

- `sitemap.xml`：自动包含首页 + 32 分类 + 50 热门工具搜索 URL（用 PowerShell 从 data.js 重新生成）
- `robots.txt`：允许全站收录，指向 sitemap
- 提交到 Google Search Console / 百度站长平台 后，收录速度会快很多

## 致谢

数据收录自互联网公开信息。工具归各自作者所有。本站仅作导航整理，不对第三方服务承担责任。
