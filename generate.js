#!/usr/bin/env node
/**
 * HTML 日报生成器
 * 生成精美的 GitHub Pages 页面
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  dataDir: './data',
  outputDir: './dist'
};

// 确保目录存在
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// 生成 HTML
function generateHTML(data) {
  const date = new Date(data.date);
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  const generateCategory = (feed) => {
    const items = feed.items.map(item => `
      <article class="article-card">
        <div class="article-header">
          <h3 class="article-title">
            <a href="${item.link}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
          </h3>
          <div class="article-meta">
            <span class="source">📰 ${escapeHtml(feed.source)}</span>
            <span class="time">🕐 ${formatTime(item.pubDate)}</span>
            <span class="read-time">⏱️ ${item.readTime || '3 分钟'}</span>
          </div>
        </div>
        
        <div class="article-summary">
          <div class="summary-box">
            <span class="summary-label">📝 AI 摘要</span>
            <p>${escapeHtml(item.aiSummary?.summary || '暂无摘要')}</p>
          </div>
          
          ${item.aiSummary?.highlights ? `
          <div class="highlights">
            ${item.aiSummary.highlights.map(h => `
              <div class="highlight-item">${escapeHtml(h)}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        
        <div class="article-footer">
          <a href="${item.link}" target="_blank" rel="noopener" class="read-more">
            阅读原文 →
          </a>
          <span class="author">✍️ ${escapeHtml(item.author || '未知作者')}</span>
        </div>
      </article>
    `).join('');
    
    return `
      <section class="category-section" id="${slugify(feed.category)}">
        <h2 class="category-title">
          <span class="category-icon">${feed.category.charAt(0)}</span>
          ${escapeHtml(feed.category)}
        </h2>
        <div class="articles-grid">
          ${items}
        </div>
      </section>
    `;
  };
  
  const categories = data.feeds.map(generateCategory).join('');
  
  const navItems = data.feeds.map(feed => `
    <a href="#${slugify(feed.category)}" class="nav-item">${escapeHtml(feed.category)}</a>
  `).join('');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSS AI 日报 - ${dateStr}</title>
  <meta name="description" content="AI 智能生成的 RSS 日报 - ${dateStr}">
  <style>
    :root {
      --primary: #667eea;
      --primary-dark: #5a67d8;
      --secondary: #764ba2;
      --bg: #f7fafc;
      --card-bg: #ffffff;
      --text: #2d3748;
      --text-light: #718096;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .header .date {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 20px;
    }
    
    .header .subtitle {
      font-size: 1rem;
      opacity: 0.8;
    }
    
    /* Navigation */
    .nav {
      background: var(--card-bg);
      padding: 15px;
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .nav-item {
      padding: 8px 16px;
      background: var(--bg);
      border-radius: 20px;
      text-decoration: none;
      color: var(--text);
      font-size: 0.9rem;
      transition: all 0.2s;
      border: 1px solid var(--border);
    }
    
    .nav-item:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    
    /* Main Content */
    .main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    /* Category Section */
    .category-section {
      margin-bottom: 50px;
    }
    
    .category-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text);
    }
    
    .category-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
    }
    
    /* Articles Grid */
    .articles-grid {
      display: grid;
      gap: 25px;
    }
    
    /* Article Card */
    .article-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 25px;
      box-shadow: var(--shadow);
      transition: all 0.3s ease;
      border: 1px solid var(--border);
    }
    
    .article-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .article-header {
      margin-bottom: 20px;
    }
    
    .article-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .article-title a {
      color: var(--text);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .article-title a:hover {
      color: var(--primary);
    }
    
    .article-meta {
      display: flex;
      gap: 15px;
      font-size: 0.85rem;
      color: var(--text-light);
      flex-wrap: wrap;
    }
    
    .article-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Summary Box */
    .article-summary {
      margin-bottom: 20px;
    }
    
    .summary-box {
      background: linear-gradient(135deg, #f0f4ff 0%, #e6eeff 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid var(--primary);
    }
    
    .summary-label {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .summary-box p {
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.7;
    }
    
    /* Highlights */
    .highlights {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .highlight-item {
      background: #f7fafc;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.9rem;
      color: var(--text);
      border-left: 3px solid var(--secondary);
    }
    
    /* Article Footer */
    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid var(--border);
    }
    
    .read-more {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    
    .read-more:hover {
      color: var(--primary-dark);
    }
    
    .author {
      font-size: 0.85rem;
      color: var(--text-light);
    }
    
    /* Footer */
    .footer {
      background: var(--text);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    
    .footer p {
      opacity: 0.8;
      font-size: 0.9rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }
      
      .nav-container {
        justify-content: flex-start;
      }
      
      .article-card {
        padding: 20px;
      }
      
      .article-meta {
        flex-direction: column;
        gap: 8px;
      }
      
      .article-footer {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1a202c;
        --card-bg: #2d3748;
        --text: #e2e8f0;
        --text-light: #a0aec0;
        --border: #4a5568;
      }
      
      .summary-box {
        background: linear-gradient(135deg, #2d3748 0%, #374151 100%);
      }
      
      .highlight-item {
        background: #374151;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <h1>📰 RSS AI 日报</h1>
      <div class="date">${dateStr}</div>
      <div class="subtitle">由 AI 智能生成 · 精选今日必读</div>
    </div>
  </header>
  
  <nav class="nav">
    <div class="nav-container">
      ${navItems}
    </div>
  </nav>
  
  <main class="main">
    ${categories}
  </main>
  
  <footer class="footer">
    <p>📡 RSS AI 日报 · 自动生成于 ${new Date(data.generatedAt || data.date).toLocaleString('zh-CN')}</p>
    <p style="margin-top: 10px; opacity: 0.6;">本页面由 GitHub Actions 自动构建与部署</p>
  </footer>
</body>
</html>`;
}

// 工具函数
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(dateStr) {
  if (!dateStr) return '未知时间';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours} 小时前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

// 主函数
async function main() {
  console.log('🎨 生成 HTML 日报');
  console.log('=================');
  
  // 读取摘要数据
  const dataPath = path.join(CONFIG.dataDir, 'summarized-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ 未找到摘要数据，请先运行 npm run summarize');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  // 生成 HTML
  const html = generateHTML(data);
  
  // 写入文件
  const outputPath = path.join(CONFIG.outputDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  
  console.log('✅ 日报已生成:', outputPath);
  console.log('');
  console.log('📊 统计:');
  console.log(`   - 分类数: ${data.feeds.length}`);
  console.log(`   - 文章数: ${data.feeds.reduce((sum, f) => sum + f.items.length, 0)}`);
  console.log('');
  console.log('💡 提示: 部署到 GitHub Pages 后即可在线访问');
}

main().catch(console.error);