# 📰 RSS AI 日报

AI 智能生成的 RSS 日报，自动抓取订阅源、生成摘要、精选摘录，部署在 GitHub Pages。

## ✨ 功能特点

- 🤖 **AI 智能摘要** - 自动提取文章要点和精彩摘录
- 📑 **分类展示** - 按类别组织，清晰易读
- 🔗 **出处链接** - 每篇文章保留原文链接
- 🎨 **精美排版** - 现代化设计，支持深色模式
- ⏰ **自动更新** - 每天定时生成新日报
- 💰 **零成本** - GitHub Actions + GitHub Pages 免费部署

## 📁 项目结构

```
rss-ai-daily/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 工作流
├── data/
│   ├── raw-data.json       # 抓取的原始数据
│   └── summarized-data.json # AI 摘要后的数据
├── dist/
│   └── index.html          # 生成的日报页面
├── fetch-rss.js            # RSS 抓取脚本
├── summarize.js            # AI 摘要脚本
├── generate.js             # HTML 生成器
├── subscriptions.opml      # RSS 订阅源列表
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地预览（框架模式）

```bash
# 生成测试页面
npm run build

# 本地查看
cd dist && python -m http.server 8080
# 打开 http://localhost:8080
```

### 3. 部署到 GitHub Pages

```bash
# 初始化仓库
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin git@github.com:你的用户名/rss-ai-daily.git
git push -u origin main
```

然后在 GitHub 仓库设置中启用 Pages，选择 GitHub Actions 作为部署源。

## 🔧 配置 LLM

### 方案一：OpenAI（推荐）

1. 获取 API Key: https://platform.openai.com/api-keys
2. 在 GitHub 仓库设置中添加 Secret: `OPENAI_API_KEY`
3. 取消注释 `.github/workflows/deploy.yml` 中的 OpenAI 相关代码

### 方案二：本地 Ollama

1. 本地安装 Ollama: https://ollama.ai
2. 拉取模型: `ollama pull qwen2.5`
3. 使用自托管 GitHub Actions Runner
4. 取消注释 `.github/workflows/deploy.yml` 中的 Ollama 相关代码

### 方案三：其他 LLM

修改 `summarize.js` 中的 API 调用部分，支持：
- Anthropic Claude
- Google Gemini
- 阿里云通义千问
- 其他兼容 OpenAI API 的服务

## 📝 自定义配置

### 修改订阅源

编辑 `subscriptions.opml` 文件，添加或删除 RSS 源。

### 调整抓取设置

编辑 `fetch-rss.js`:

```javascript
const CONFIG = {
  maxItemsPerFeed: 5,  // 每个源抓取文章数
  daysBack: 1,         // 抓取几天内的文章
};
```

### 自定义样式

修改 `generate.js` 中的 CSS 部分，或添加自定义样式文件。

## 🛠️ 开发调试

### 本地完整流程（启用 RSS 抓取）

```bash
# 1. 取消注释 fetch-rss.js 中的实际抓取代码
# 2. 运行完整流程
npm run full
```

### 单独运行某个步骤

```bash
npm run fetch      # 仅抓取 RSS
npm run summarize  # 仅生成摘要
npm run build      # 仅生成 HTML
```

## 📄 许可证

MIT License
