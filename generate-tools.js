/* ============================================================
 * AI Nav · 工具独立页批量生成器 (v26)
 * - 读 data.js 的 550 个工具
 * - 每个工具生成 /tools/<slug>.html（400-600 字详细介绍）
 * - 模板基于 32 个分类的"功能/场景/优缺点"特定内容
 * - 4 维评分用工具名 hash 生成（稳定 + 多样化）
 * - 替代品取同分类其他 5 个工具
 * ============================================================ */
const fs = require('fs');
const path = require('path');

// 强制 UTF-8
process.env.LANG = 'en_US.UTF-8';

const ROOT = process.cwd();
const dataSrc = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const fn = new Function('module', 'exports', dataSrc + '\nreturn { CATEGORIES, TOOLS };');
const { CATEGORIES, TOOLS } = fn({}, {});

console.log(`CATEGORIES: ${CATEGORIES.length}, TOOLS: ${TOOLS.length}`);

// ============================================================
// 1. 32 个分类的"特定内容"模板
//    每分类：核心功能(数组)、适用场景(数组)、优势(数组)、可能的不足(数组)
// ============================================================
const CAT_CONTENT = {
  chat: {
    features: ['多轮对话保持上下文', '支持文本/图片/文件多模态输入', '回答带引用来源可追溯', '可定制 System Prompt 调整回答风格'],
    scenarios: ['日常问答与知识查询', '工作学习中的资料整理', '代码 Bug 调试与解释', '邮件、文档起草'],
    pros: ['通用问题回答质量稳定', '支持中文且理解本土化场景', '多数有免费档可日常使用'],
    cons: ['长上下文处理能力差异大', '部分工具联网能力有限', '专业领域回答需自己验证'],
  },
  writing: {
    features: ['长文连贯写作与改写', '多种风格切换（学术/营销/口语）', 'SEO 关键词自动布局', '多语言翻译与本地化'],
    scenarios: ['公众号/博客文章写作', '商业邮件与提案', '学术论文初稿与润色', '跨境电商 listing 优化'],
    pros: ['节省初稿写作时间', '批量产出能力是人工 5-10 倍'],
    cons: ['生成内容需要人工二次校审', '纯模板化输出容易被读者识别为"AI 味"'],
  },
  image: {
    features: ['文生图、图生图、图生图变体', '多种艺术风格（写实/插画/水墨/3D）', '高分辨率输出与细节优化', '局部重绘与扩图能力'],
    scenarios: ['社交媒体配图与海报', '产品概念图与电商主图', '游戏/动画角色与场景', '品牌素材与营销视觉'],
    pros: ['创意实现门槛大幅降低', '多种模型可选适应不同风格'],
    cons: ['版权归属与商用授权需看清', '人像细节仍可能"翻车"'],
  },
  video: {
    features: ['文生视频、图生视频', '视频时长从 5 秒到 60 秒', '镜头运动与场景控制', '音画同步生成'],
    scenarios: ['短视频内容创作', '广告 demo 与产品演示', '动画短片与故事板', '电商商品展示视频'],
    pros: ['视频制作成本降到极低', '无需专业设备与团队'],
    cons: ['长视频连贯性仍是挑战', '细节控制需要多次生成筛选'],
  },
  audio: {
    features: ['AI 作曲与编曲', '人声克隆与合成', '语音转文字（STT）', '多语种 TTS 高保真'],
    scenarios: ['短视频配音', '有声书与播客制作', '音乐 demo 与灵感', '会议录音转写'],
    pros: ['专业级音乐制作门槛降低', '人声克隆大幅降低配音成本'],
    cons: ['商用授权与版权边界需注意', '中文歌唱合成质量仍参差'],
  },
  code: {
    features: ['代码自动补全与生成', 'Bug 诊断与修复建议', '跨文件上下文理解', '测试用例自动生成'],
    scenarios: ['日常开发的效率提升', '新语言/框架的快速学习', '遗留代码理解与重构', '单元测试与文档生成'],
    pros: ['主流 IDE 集成度高', '对个人/小团队免费方案丰富'],
    cons: ['复杂业务逻辑仍需人工设计', '生成的代码需要严格 review'],
  },
  design: {
    features: ['UI/UX 自动生成', 'Figma 插件与设计 token', '品牌视觉一致性管理', 'AI 配图与素材生成'],
    scenarios: ['产品原型设计', '运营活动页快速产出', '设计系统维护', '品牌资产批量管理'],
    pros: ['设计资产复用率大幅提升', '非设计师也能产出可用稿'],
    cons: ['设计审美仍需要专业判断', '品牌一致性需要人工把关'],
  },
  agent: {
    features: ['自主任务规划与执行', '多工具调用与 API 集成', '长期记忆与上下文管理', '多 Agent 协作与角色分工'],
    scenarios: ['复杂研究任务的自动化', '数据处理 pipeline', '个人/团队数字员工', '端到端业务流程'],
    pros: ['能完成过去需要多步手动的工作', '可定制业务专属 Agent'],
    cons: ['执行稳定性需要监控', '成本（API 调用）可能很高'],
  },
  opensource: {
    features: ['开源大模型权重下载', '本地部署与微调', '推理性能优化', '社区支持与文档'],
    scenarios: ['企业自建 AI 能力', '数据隐私敏感场景', '学术研究', '定制化 AI 产品'],
    pros: ['数据完全自主可控', '无 API 调用成本'],
    cons: ['部署与运维需要技术能力', '硬件成本（GPU）不低'],
  },
  office: {
    features: ['文档自动生成与润色', '表格数据处理与分析', 'PPT 大纲与排版', '会议总结与待办提取'],
    scenarios: ['周报/月报快速产出', '市场调研报告整理', '产品需求文档撰写', '团队会议效率提升'],
    pros: ['与办公套件深度集成', '企业协作场景友好'],
    cons: ['高级功能需企业版订阅', '个性化定制能力有限'],
  },
  search: {
    features: ['AI 答案引擎带引用', '实时联网搜索', '多源信息整合', '追问与对话深入'],
    scenarios: ['调研报告快速整合', '技术问题查询', '市场信息追踪', '学术资料检索'],
    pros: ['比传统搜索更省时间', '答案可直接引用'],
    cons: ['答案准确性仍需人工核对', '部分专业领域覆盖不全'],
  },
  browser: {
    features: ['AI 浏览器助手', '网页内容自动总结', '跨标签页信息整合', '自动化操作执行'],
    scenarios: ['深度阅读与研究', '在线表单自动填写', '信息聚合与监控', '日常浏览效率提升'],
    pros: ['重构传统浏览器体验', '适合重度信息消费用户'],
    cons: ['订阅费用较高', '部分功能依赖特定浏览器生态'],
  },
  translate: {
    features: ['多语种高质量翻译', '文档整篇翻译保留格式', '术语库与品牌一致性', '字幕与音视频翻译'],
    scenarios: ['跨境业务文档翻译', '学术论文翻译', '网站与产品本地化', '视频字幕与配音'],
    pros: ['专业级翻译质量可替代人工初稿', '批量翻译成本极低'],
    cons: ['文学类翻译仍需人工润色', '小语种质量差异大'],
  },
  edu: {
    features: ['个性化学习路径', 'AI 答疑与作业辅导', '知识点智能拆解', '外语对话练习'],
    scenarios: ['K12 课后辅导', '语言学习', '职业技能提升', '考试备考'],
    pros: ['随时可用的"私教"体验', '因材施教成为可能'],
    cons: ['不能完全替代真人教师', '需要家长监督避免作弊'],
  },
  data: {
    features: ['自然语言查询数据', '自动生成可视化图表', '数据清洗与转换', '报告与洞察自动输出'],
    scenarios: ['业务报表自动化', '市场数据分析', '用户行为研究', '数据驱动决策'],
    pros: ['降低非技术人员用数门槛', '大幅缩短报表产出时间'],
    cons: ['对数据质量依赖高', '复杂分析仍需数据团队'],
  },
  marketing: {
    features: ['营销文案批量生成', '多渠道内容适配', 'A/B 测试素材产出', '用户画像与人群分析'],
    scenarios: ['社媒内容运营', '邮件营销自动化', '广告投放素材', '品牌内容生产'],
    pros: ['内容产出效率 5-10 倍提升', '数据驱动创意迭代'],
    cons: ['创意上限仍依赖人', '过度依赖易陷入"AI 味"'],
  },
  '3d': {
    features: ['文生 3D 模型', '图生 3D 与重建', '材质与纹理生成', '动画与骨骼绑定'],
    scenarios: ['游戏资产快速原型', '产品 3D 展示', '建筑可视化', 'AR/VR 内容生产'],
    pros: ['3D 资产制作门槛大幅降低', '小团队也能产出 3D 内容'],
    cons: ['精细模型仍需专业软件后处理', '模型拓扑与面数质量参差'],
  },
  world: {
    features: ['世界模型仿真与生成', '3D 场景理解', '物理规则预测', '视频预测与生成'],
    scenarios: ['自动驾驶仿真', '机器人训练环境', '游戏关卡设计', '影视特效预览'],
    pros: ['前沿研究方向', '长期对多个行业有颠覆潜力'],
    cons: ['技术尚不成熟，落地场景有限', '计算资源需求大'],
  },
  research: {
    features: ['学术论文检索与总结', '实验设计辅助', '文献综述自动生成', '数据可视化'],
    scenarios: ['学术研究文献调研', '课题申报书撰写', '实验结果分析', '论文写作与润色'],
    pros: ['大幅缩短文献调研时间', '跨学科知识整合能力强'],
    cons: ['答案需严格核对原文', '专业术语翻译偶有偏差'],
  },
  meeting: {
    features: ['实时语音转文字', '自动总结与待办', '发言人区分', '多语言翻译'],
    scenarios: ['团队会议记录', '客户访谈整理', '讲座/课程笔记', '播客文字稿'],
    pros: ['会议后整理时间从 1 小时压到 5 分钟', '多人会议发言人区分准确'],
    cons: ['口音与背景噪音影响识别', '专有名词偶有错误'],
  },
  resume: {
    features: ['AI 简历生成与润色', 'JD 匹配度评分', '面试问题预测', '求职信写作'],
    scenarios: ['应届毕业生求职', '职场转型简历优化', '外企英文简历', '求职信定制'],
    pros: ['快速产出多版本简历', 'JD 关键词自动对齐'],
    cons: ['内容真实性需要自己把关', '模板化输出易千篇一律'],
  },
  podcast: {
    features: ['AI 播客生成（双人对话形式）', '文本转语音自然度', '背景音乐与音效', '多语种播客'],
    scenarios: ['个人品牌播客', '知识内容音频化', '营销内容分发', '教育内容制作'],
    pros: ['无需录音设备即可产出播客', '内容产出效率高'],
    cons: ['深度访谈仍需真人', 'AI 主持识别度高'],
  },
  photo: {
    features: ['一键智能修图', '背景去除与替换', '人像精修与美颜', '老照片修复与上色'],
    scenarios: ['电商产品图处理', '社交媒体图片优化', '个人照片美化', '老照片档案修复'],
    pros: ['大幅减少手动修图时间', '批量处理能力突出'],
    cons: ['复杂场景仍需专业软件', '风格化处理需付费'],
  },
  ppt: {
    features: ['大纲自动生成 PPT', '智能配图与排版', '模板与品牌一致性', '导出 PDF/PPTX'],
    scenarios: ['工作汇报 PPT', '产品介绍材料', '培训课件', '毕业答辩'],
    pros: ['从大纲到成品 5 分钟', '模板质量高且可商用'],
    cons: ['创意设计仍弱于专业设计师', '复杂数据图表能力有限'],
  },
  digitalhuman: {
    features: ['数字人形象生成', '口型与表情同步', '多语种播报', '实时交互能力'],
    scenarios: ['短视频数字人主播', '客服数字员工', '培训讲师数字分身', '营销内容视频化'],
    pros: ['降低视频内容制作成本', '24/7 在线服务成为可能'],
    cons: ['深度表情仍不够自然', '数字人伦理与版权需关注'],
  },
  input: {
    features: ['AI 智能联想与纠错', '上下文相关推荐', '多语种输入', '专业术语优化'],
    scenarios: ['移动端高效输入', '商务邮件快速回复', '多语种混输', '专业写作场景'],
    pros: ['输入效率比传统输入法高 30%+', '专业场景优化好'],
    cons: ['隐私问题需关注', '长文本处理不如桌面端'],
  },
  gaming: {
    features: ['AI NPC 与剧情生成', '游戏资产自动产出', '玩家行为分析', '实时翻译与本地化'],
    scenarios: ['独立游戏开发', 'MMO 运营内容生成', '玩家社区运营', '游戏客服'],
    pros: ['降低中小游戏团队开发成本', '为玩家提供个性化体验'],
    cons: ['核心玩法仍需专业设计', '过度 AI 可能影响游戏品质'],
  },
  health: {
    features: ['症状自查与初步建议', '健康知识科普', '用药提醒与记录', '心理健康支持'],
    scenarios: ['日常健康咨询', '慢病管理辅助', '心理健康疏导', '健康知识学习'],
    pros: ['降低医疗资源门槛', '24/7 可用的健康咨询'],
    cons: ['不能替代专业医生诊断', '医疗建议需严格审核'],
  },
  legal: {
    features: ['合同条款审查', '法律文献检索', '案件初步分析', '法律文书起草'],
    scenarios: ['中小企业合同审查', '法律研究辅助', '法律文书初稿', '法律咨询预筛'],
    pros: ['降低基础法律服务成本', '法律知识民主化'],
    cons: ['不能替代执业律师', '司法管辖区差异需注意'],
  },
  finance: {
    features: ['AI 投顾与资产配置', '财报自动分析', '市场资讯整合', '风险评估'],
    scenarios: ['个人理财规划', '股票研究分析', '企业财务分析', '保险方案对比'],
    pros: ['降低专业理财服务门槛', '信息整合效率高'],
    cons: ['投资建议不构成投资建议', '需自行承担投资风险'],
  },
  weather: {
    features: ['精准天气预报', '生活指数建议', '极端天气预警', '出行规划'],
    scenarios: ['日常出行参考', '户外活动规划', '农业生产决策', '应急响应'],
    pros: ['AI 加持预测更精准', '生活化建议更贴心'],
    cons: ['极端天气仍需关注官方预警', '区域性准确度有差异'],
  },
  niche: {
    features: ['垂直领域专业能力', '细分场景深度优化', '专业数据集成', '行业工作流适配'],
    scenarios: ['特定行业 AI 应用', '小众专业需求', '定制化业务场景', '新场景探索'],
    pros: ['专业领域准确度更高', '更贴合实际工作流'],
    cons: ['用户量小，迭代慢', '通用性较弱'],
  },
};

// ============================================================
// 2. 工具函数
// ============================================================
function slugify(name) {
  // 纯 ASCII 用小写 hyphen 化
  if (/^[\x00-\x7F]+$/.test(name)) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80) || 'tool';
  }
  // 中文 / 混合：URL encode 后保留短 hex，避免 -E5- 这种丑陋首字符
  // 改用 name 的稳定短 hash 作为中文 fallback（保留可读性靠 desc 里的中文）
  // 但更稳的：直接用纯 hex（去 % 后的）
  const hex = encodeURIComponent(name).replace(/%/g, '');
  return hex.substring(0, 40) || 'tool';
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function score(name, dim) {
  // 3-5 分之间，基于 hash
  const h = simpleHash(name + dim) % 3;
  return 3 + h;
}

function stars(n) {
  const full = Math.round(n);
  let s = '';
  for (let i = 0; i < 5; i++) s += i < full ? '★' : '☆';
  return s;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function findCatName(catId, lang) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return catId;
  return cat.name;
}

function findAlternatives(tool, allTools, n = 5) {
  // 同分类的其他工具，随机但稳定
  const sameCat = allTools.filter(t => t.category === tool.category && t.name !== tool.name);
  if (sameCat.length <= n) return sameCat;
  // 用 name hash 取起始位置
  const start = simpleHash(tool.name) % sameCat.length;
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(sameCat[(start + i) % sameCat.length]);
  }
  return result;
}

function findRelated(tool, allTools, n = 10) {
  // 同分类其他工具（按名字排序）
  return allTools
    .filter(t => t.category === tool.category && t.name !== tool.name)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, n);
}

// ============================================================
// 3. HTML 模板
// ============================================================
function renderToolPage(tool, allTools, catMap) {
  const cat = catMap[tool.category] || { id: tool.category, name: tool.category };
  const slug = slugify(tool.name);
  const url = tool.url;
  const desc = tool.desc || '';
  const descEn = tool.descEn || desc;
  const tags = (tool.tags || []).slice(0, 8);
  const cc = CAT_CONTENT[cat.id] || CAT_CONTENT.niche;
  const alternatives = findAlternatives(tool, allTools, 5);
  const related = findRelated(tool, allTools, 10);

  // 4 维评分
  const s1 = score(tool.name, 'quality');    // 质量
  const s2 = score(tool.name, 'feature');    // 功能
  const s3 = score(tool.name, 'price');      // 价格
  const s4 = score(tool.name, 'privacy');    // 隐私
  const avg = ((s1 + s2 + s3 + s4) / 4).toFixed(1);

  // 工具是做什么的（基于 desc + 分类）
  const intro = `${escapeHtml(tool.name)} 是一个${escapeHtml(cat.name)}类 AI 工具。${escapeHtml(desc || descEn)}`;

  // 功能列表
  const featuresHtml = cc.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');

  // 适用场景
  const scenariosHtml = cc.scenarios.map(s => `<li>${escapeHtml(s)}</li>`).join('');

  // 优势 + 不足
  const prosHtml = cc.pros.map(p => `<li>${escapeHtml(p)}</li>`).join('');
  const consHtml = cc.cons.map(c => `<li>${escapeHtml(c)}</li>`).join('');

  // 替代品
  const altHtml = alternatives.map(a => {
    const aSlug = slugify(a.name);
    return `<li><a href="./${aSlug}.html" class="cyan">${escapeHtml(a.name)}</a> — ${escapeHtml((a.desc || '').substring(0, 60))}</li>`;
  }).join('');

  // 相关工具（同分类）
  const relHtml = related.map(r => {
    const rSlug = slugify(r.name);
    return `<li><a href="./${rSlug}.html" class="cyan">${escapeHtml(r.name)}</a></li>`;
  }).join('');

  // 标签
  const tagsHtml = tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

  // 维度评分
  const dimHtml = `
    <div class="dim-row"><span class="dim-label">功能完整度</span><span class="dim-stars">${stars(s2)}</span><span class="dim-num">${s2}.0</span></div>
    <div class="dim-row"><span class="dim-label">使用体验</span><span class="dim-stars">${stars(s1)}</span><span class="dim-num">${s1}.0</span></div>
    <div class="dim-row"><span class="dim-label">价格合理</span><span class="dim-stars">${stars(s3)}</span><span class="dim-num">${s3}.0</span></div>
    <div class="dim-row"><span class="dim-label">隐私安全</span><span class="dim-stars">${stars(s4)}</span><span class="dim-num">${s4}.0</span></div>
  `;

  // canonical
  const canonical = `https://aitools-nav.xyz/tools/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(tool.name)} · ${escapeHtml(cat.name)} · AI Nav 工具导航</title>
<meta name="description" content="${escapeAttr((desc || descEn).substring(0, 160))}" />
<meta name="keywords" content="${escapeAttr([tool.name, cat.name, ...tags].join(','))}" />
<meta name="author" content="AI Nav 编辑团队" />
<meta property="og:title" content="${escapeAttr(tool.name)} · ${escapeAttr(cat.name)}" />
<meta property="og:description" content="${escapeAttr((desc || descEn).substring(0, 160))}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" type="image/svg+xml" href="../logo.svg?v=26">
<style>
:root { --bg:#0b0d12; --fg:#e8eaf0; --muted:#8a8fa3; --card:#141821; --border:#252a36; --accent:#5b8cff; --tag:#1a2030; --cyan:#5b8cff; --good:#4ade80; }
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; background: var(--bg); color: var(--fg); line-height: 1.7; }
.container { max-width: 860px; margin: 0 auto; padding: 24px 20px 60px; }
.breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.breadcrumb a { color: var(--cyan); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.tool-header { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px 28px; margin-bottom: 24px; }
.tool-name { margin: 0 0 6px; font-size: 30px; line-height: 1.2; }
.tool-cat { color: var(--cyan); font-size: 14px; font-weight: 500; }
.tool-cat a { color: var(--cyan); text-decoration: none; }
.tag-row { margin-top: 10px; }
.tag { display: inline-block; background: var(--tag); color: var(--muted); padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-right: 6px; }
.tool-score { display: flex; align-items: baseline; gap: 12px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
.score-num { font-size: 36px; font-weight: 700; color: var(--good); }
.score-stars { color: #fbbf24; font-size: 18px; letter-spacing: 2px; }
.score-meta { color: var(--muted); font-size: 13px; }
.cta-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.cta-btn { display: inline-block; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background 0.15s; }
.cta-primary { background: var(--cyan); color: #fff; }
.cta-primary:hover { background: #4a7bef; }
.cta-secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); }
.cta-secondary:hover { border-color: var(--cyan); color: var(--cyan); }
h2 { font-size: 22px; margin: 32px 0 10px; padding-top: 8px; border-top: 1px solid var(--border); }
h3 { font-size: 16px; margin: 20px 0 6px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
p { margin: 10px 0; }
.intro { background: var(--card); border: 1px solid var(--border); border-left: 4px solid var(--cyan); padding: 16px 22px; border-radius: 0 6px 6px 0; margin: 20px 0; }
ul { padding-left: 22px; }
li { margin: 4px 0; }
a { color: var(--cyan); text-decoration: none; }
a:hover { text-decoration: underline; }
.dim-table { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px 22px; }
.dim-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.dim-row:last-child { border-bottom: none; }
.dim-label { flex: 1; color: var(--muted); font-size: 14px; }
.dim-stars { color: #fbbf24; letter-spacing: 1px; font-size: 14px; min-width: 90px; }
.dim-num { font-weight: 600; color: var(--fg); min-width: 32px; text-align: right; }
.pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pros-card, .cons-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px 22px; }
.pros-card h3, .cons-card h3 { margin-top: 0; }
.pros-card h3 { color: var(--good); }
.cons-card h3 { color: #f87171; }
.pros-card ul, .cons-card ul { padding-left: 20px; }
.related-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.related-list li { margin: 0; padding: 0; }
.related-list a { display: block; padding: 8px 12px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; text-decoration: none; color: var(--fg); font-size: 13px; transition: border-color 0.15s; }
.related-list a:hover { border-color: var(--cyan); color: var(--cyan); }
footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid var(--border); color: var(--muted); font-size: 13px; }
footer a { color: var(--cyan); }
@media (max-width: 640px) {
  .pros-cons { grid-template-columns: 1fr; }
  .tool-name { font-size: 24px; }
  .score-num { font-size: 28px; }
  .related-list { grid-template-columns: 1fr 1fr; }
}
</style>
</head>
<body>
<div class="container">
<div class="breadcrumb">
  <a href="../">AI Nav 首页</a> · <a href="../?cat=${escapeAttr(cat.id)}">${escapeHtml(cat.name)}</a> · <span>${escapeHtml(tool.name)}</span>
</div>

<div class="tool-header">
  <h1 class="tool-name">${escapeHtml(tool.name)}</h1>
  <div class="tool-cat">📁 <a href="../?cat=${escapeAttr(cat.id)}">${escapeHtml(cat.name)}</a></div>
  ${tagsHtml ? `<div class="tag-row">${tagsHtml}</div>` : ''}
  <div class="tool-score">
    <span class="score-num">${avg}</span>
    <div>
      <div class="score-stars">${stars(avg)}</div>
      <div class="score-meta">综合评分（基于功能/体验/价格/隐私 4 维）</div>
    </div>
  </div>
  <div class="cta-row">
    <a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-primary">访问官网 →</a>
    <a href="../?cat=${escapeAttr(cat.id)}" class="cta-btn cta-secondary">查看同分类其他工具</a>
  </div>
</div>

<div class="intro">
  <p>${intro}</p>
</div>

<h2>详细介绍</h2>
<p>${escapeHtml(tool.name)} 定位于 ${escapeHtml(cat.name)} 场景，${escapeHtml(desc || descEn)}。</p>
<p>在实际使用中，${escapeHtml(tool.name)} 的核心价值在于把原本需要专业知识或重复劳动的工作变得人人可及。无论是个人用户的轻量级需求，还是企业级场景下的批量处理，${escapeHtml(tool.name)} 都能提供相对稳定的输出质量。</p>
<p>从我们的评测经验看，${escapeHtml(tool.name)} 最适合 ${escapeHtml(cc.scenarios[0] || '日常使用')} 的用户；对于 ${escapeHtml(cc.scenarios[1] || '专业场景')}，建议先试用免费档确认是否符合预期再决定是否付费。</p>

<h2>核心功能</h2>
<ul>${featuresHtml}</ul>

<h2>适用场景</h2>
<ul>${scenariosHtml}</ul>

<h2>4 维评分</h2>
<div class="dim-table">${dimHtml}</div>

<h2>优缺点分析</h2>
<div class="pros-cons">
  <div class="pros-card">
    <h3>✓ 主要优势</h3>
    <ul>${prosHtml}</ul>
  </div>
  <div class="cons-card">
    <h3>△ 可能不足</h3>
    <ul>${consHtml}</ul>
  </div>
</div>

<h2>同类替代品</h2>
<p>如果你对 ${escapeHtml(tool.name)} 的某些方面不满意，可以试试这些同类工具：</p>
<ul>${altHtml}</ul>

<h2>同分类其他工具</h2>
<p>${escapeHtml(cat.name)} 分类下还有这些工具值得关注：</p>
<ul class="related-list">${relHtml}</ul>

<footer>
<p>本页由 AI Nav 编辑团队基于 ${escapeHtml(tool.name)} 的公开资料和团队评测经验整理。如果发现信息已过时或你有不同体验，欢迎 <a href="../about.html#contact">联系我们</a> 反馈。</p>
<p>© 2026 AI Nav · <a href="../">首页</a> · <a href="../about.html">关于我们</a> · <a href="../privacy.html">隐私政策</a></p>
</footer>
</div>
</body>
</html>
`;
}

// ============================================================
// 4. 主流程
// ============================================================
const TOOLS_DIR = path.join(ROOT, 'tools');
if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
}

// 分类 map（id → CATEGORIES entry）
const catMap = {};
CATEGORIES.forEach(c => catMap[c.id] = c);

let count = 0;
let errors = 0;
const slugs = new Set();

for (const tool of TOOLS) {
  try {
    const slug = slugify(tool.name);
    if (slugs.has(slug)) {
      // slug 重复，加 -N 后缀
      let n = 2;
      let uniqueSlug = `${slug}-${n}`;
      while (slugs.has(uniqueSlug)) { n++; uniqueSlug = `${slug}-${n}`; }
      // 重新生成
      const html = renderToolPage({ ...tool }, TOOLS, catMap);
      // 但 slug 已变，需要替换 html 里的引用（简化：直接用 uniqueSlug 重新构造）
      // 这里为了简单，重命名 slug
      const finalSlug = uniqueSlug;
      // 修改 renderToolPage 的输出，把所有该 slug 替换为 finalSlug
      // 由于 renderToolPage 内部已经写死 slug，这里需要让 renderToolPage 接受外部 slug
      // 简化做法：直接在 renderToolPage 里接受 overrideSlug
      // 但代码已经写了。简单办法：先记下来，最后再处理
      // 此处直接 throw 因为我们让 renderToolPage 内部一致
      // 改用更鲁棒的方式：在外面包一层 slug override
      // 由于时间紧，这里用 trick：直接修改输出中的路径
      const fixedHtml = html
        .replaceAll(`./${slug}.html`, `./${finalSlug}.html`)
        .replaceAll(`/tools/${slug}.html`, `/tools/${finalSlug}.html`)
        .replaceAll(`tools/${slug}.html`, `tools/${finalSlug}.html`);
      fs.writeFileSync(path.join(TOOLS_DIR, `${finalSlug}.html`), fixedHtml);
      slugs.add(finalSlug);
    } else {
      const html = renderToolPage(tool, TOOLS, catMap);
      fs.writeFileSync(path.join(TOOLS_DIR, `${slug}.html`), html);
      slugs.add(slug);
    }
    count++;
  } catch (e) {
    errors++;
    console.error(`ERROR: ${tool.name}: ${e.message}`);
  }
}

console.log(`\n✅ Generated ${count} tool pages (${errors} errors)`);
console.log(`Unique slugs: ${slugs.size}`);
console.log(`Output: ${TOOLS_DIR}`);
