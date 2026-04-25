#!/usr/bin/env node
/**
 * RSS 抓取模块
 * 真实 RSS 抓取版本
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'RSS-AI-Daily/1.0'
  }
});

// 配置
const CONFIG = {
  opmlPath: './subscriptions.opml',
  outputDir: './data',
  maxItemsPerFeed: 3,  // 每个订阅源最多抓取几条（避免太多）
  daysBack: 1,         // 抓取几天内的内容
};

// 确保目录存在
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// 解析 OPML 文件
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

// 抓取单个 RSS 源
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

// 主函数
async function main() {
  console.log('📝 RSS 抓取开始');
  console.log('================');
  console.log('');
  
  const feedList = await parseOPML(CONFIG.opmlPath);
  console.log(`📚 发现 ${feedList.length} 个订阅源`);
  console.log('');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const feed of feedList) {
    const result = await fetchFeed(feed);
    if (result && result.items.length > 0) {
      results.push(result);
      successCount++;
    } else if (result) {
      successCount++;
    } else {
      failCount++;
    }
    // 礼貌延迟，避免请求过快
    await new Promise(r => setTimeout(r, 500));
  }
  
  const data = {
    date: new Date().toISOString(),
    feeds: results
  };
  
  const outputPath = path.join(CONFIG.outputDir, 'raw-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('');
  console.log('✅ 抓取完成');
  console.log(`📊 成功: ${successCount}/${feedList.length} 个源`);
  console.log(`❌ 失败: ${failCount} 个源`);
  console.log(`📝 文章: ${results.reduce((sum, f) => sum + f.items.length, 0)} 篇`);
  console.log(`💾 数据已保存: ${outputPath}`);
}

main().catch(console.error);
