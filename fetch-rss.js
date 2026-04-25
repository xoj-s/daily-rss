#!/usr/bin/env node
/**
 * RSS 抓取模块
 * 注意：此版本为框架代码，实际抓取逻辑待调试后启用
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// 配置
const CONFIG = {
  opmlPath: './subscriptions.opml',
  outputDir: './data',
  maxItemsPerFeed: 5,  // 每个订阅源最多抓取几条
  daysBack: 1,         // 抓取几天内的内容
};

// 确保目录存在
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// 模拟数据（用于框架测试）
const MOCK_DATA = {
  date: new Date().toISOString(),
  feeds: [
    {
      category: "📰 科技新闻",
      source: "示例科技媒体",
      sourceUrl: "https://example.com",
      items: [
        {
          title: "【示例】AI 技术新突破",
          link: "https://example.com/article1",
          pubDate: new Date().toISOString(),
          content: "这是一篇示例文章，用于测试页面排版效果。实际部署后将显示真实抓取的内容。",
          author: "示例作者"
        }
      ]
    }
  ]
};

async function main() {
  console.log('📝 RSS 抓取框架');
  console.log('================');
  console.log('状态: 框架模式（未启用实际抓取）');
  console.log('');
  
  // 保存模拟数据用于页面测试
  const outputPath = path.join(CONFIG.outputDir, 'raw-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(MOCK_DATA, null, 2));
  
  console.log('✅ 已生成测试数据:', outputPath);
  console.log('📊 数据概览:');
  console.log(`   - 分类数: ${MOCK_DATA.feeds.length}`);
  console.log(`   - 文章数: ${MOCK_DATA.feeds.reduce((sum, f) => sum + f.items.length, 0)}`);
  console.log('');
  console.log('💡 提示: 此框架使用模拟数据');
  console.log('   上线调试后，取消注释下方代码启用真实抓取');
}

/* 
// ============================================
// 实际 RSS 抓取代码（调试后启用）
// ============================================

const Parser = require('rss-parser');
const parser = new Parser();

async function parseOPML(opmlPath) {
  const content = fs.readFileSync(opmlPath, 'utf-8');
  const result = await xml2js.parseStringPromise(content);
  
  const feeds = [];
  
  function extract(outline, category = null) {
    if (!outline) return;
    
    if (Array.isArray(outline)) {
      outline.forEach(o => extract(o, category));
    } else {
      if (outline.$.xmlUrl) {
        feeds.push({
          title: outline.$.title || outline.$.text,
          xmlUrl: outline.$.xmlUrl,
          htmlUrl: outline.$.htmlUrl,
          category: category || '未分类'
        });
      }
      
      if (outline.outline) {
        const catName = outline.$.title || outline.$.text || category;
        extract(outline.outline, catName);
      }
    }
  }
  
  extract(result.opml.body[0].outline);
  return feeds;
}

async function fetchFeed(feedInfo) {
  try {
    console.log(`  📡 抓取: ${feedInfo.title}`);
    const feed = await parser.parseURL(feedInfo.xmlUrl);
    
    // 过滤最近的文章
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.daysBack);
    
    const recentItems = feed.items
      .filter(item => {
        const pubDate = new Date(item.pubDate || item.isoDate);
        return pubDate >= cutoffDate;
      })
      .slice(0, CONFIG.maxItemsPerFeed)
      .map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate || item.isoDate,
        content: item.contentSnippet || item.content || '',
        author: item.author || item.creator || feedInfo.title
      }));
    
    return {
      category: feedInfo.category,
      source: feedInfo.title,
      sourceUrl: feedInfo.htmlUrl,
      items: recentItems
    };
  } catch (error) {
    console.error(`  ❌ 失败: ${feedInfo.title} - ${error.message}`);
    return null;
  }
}

async function fetchAllFeeds() {
  const feedList = await parseOPML(CONFIG.opmlPath);
  console.log(`📚 发现 ${feedList.length} 个订阅源`);
  console.log('');
  
  const results = [];
  for (const feed of feedList) {
    const result = await fetchFeed(feed);
    if (result && result.items.length > 0) {
      results.push(result);
    }
    // 礼貌延迟
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const data = {
    date: new Date().toISOString(),
    feeds: results
  };
  
  const outputPath = path.join(CONFIG.outputDir, 'raw-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('');
  console.log('✅ 抓取完成');
  console.log(`📊 成功: ${results.length}/${feedList.length} 个源`);
  console.log(`📝 文章: ${results.reduce((sum, f) => sum + f.items.length, 0)} 篇`);
}

// 启用实际抓取时，将 main() 替换为 fetchAllFeeds()
*/

main().catch(console.error);
