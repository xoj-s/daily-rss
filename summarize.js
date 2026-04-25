#!/usr/bin/env node
/**
 * AI 摘要生成模块
 * 目前使用模拟摘要（可在 GitHub Secrets 配置 LLM API）
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  dataDir: './data',
  outputDir: './data'
};

// 模拟 AI 摘要（实际部署时可替换为真实 LLM）
function generateMockSummary(item, category) {
  const summaries = {
    'tech': {
      summary: `这是一篇关于"${item.title.slice(0, 20)}..."的技术文章，探讨了相关领域的最新发展。`,
      highlights: [
        `💡 关键洞察：${item.title.slice(0, 30)}...值得关注`,
        `🔥 精彩摘录："${item.content.slice(0, 50)}..."`,
        '📈 趋势分析：该领域正在快速发展'
      ]
    },
    'news': {
      summary: `今日热点：${item.title.slice(0, 30)}...`,
      highlights: [
        '📰 核心要点：事件正在持续发酵',
        `💬 精彩观点："${item.content.slice(0, 40)}..."`,
        '🎯 影响分析：值得持续关注'
      ]
    },
    'life': {
      summary: `生活分享：${item.title.slice(0, 30)}...`,
      highlights: [
        '✨ 实用技巧：内容很有参考价值',
        `🌟 精彩分享："${item.content.slice(0, 40)}..."`,
        '💭 深度思考：值得品味'
      ]
    },
    'music': {
      summary: `音乐资讯：${item.title.slice(0, 30)}...`,
      highlights: [
        '🎵 音乐亮点：精彩内容分享',
        `🎶 精彩摘录："${item.content.slice(0, 40)}..."`,
        '🎸 推荐理由：音乐爱好者必看'
      ]
    }
  };
  
  // 根据分类选择模板
  const cat = category.toLowerCase();
  let type = 'life';
  if (cat.includes('科技') || cat.includes('tech') || cat.includes('👽') || cat.includes('📰')) {
    type = 'tech';
  } else if (cat.includes('新闻') || cat.includes('news')) {
    type = 'news';
  } else if (cat.includes('音乐') || cat.includes('🎵')) {
    type = 'music';
  }
  
  return summaries[type];
}

async function main() {
  console.log('🤖 AI 摘要生成');
  console.log('================');
  console.log('');
  
  // 读取原始数据
  const rawDataPath = path.join(CONFIG.dataDir, 'raw-data.json');
  if (!fs.existsSync(rawDataPath)) {
    console.error('❌ 未找到原始数据，请先运行 npm run fetch');
    process.exit(1);
  }
  
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
  
  console.log(`📚 处理 ${rawData.feeds.length} 个分类的 RSS 数据`);
  console.log('');
  
  // 生成摘要
  const summarizedData = {
    date: rawData.date,
    generatedAt: new Date().toISOString(),
    feeds: rawData.feeds.map(feed => ({
      ...feed,
      items: feed.items.map(item => {
        console.log(`  📝 生成摘要: ${item.title.slice(0, 40)}...`);
        return {
          ...item,
          aiSummary: generateMockSummary(item, feed.category),
          readTime: Math.max(1, Math.ceil(item.content.length / 500)) + ' 分钟'
        };
      })
    }))
  };
  
  // 保存
  const outputPath = path.join(CONFIG.outputDir, 'summarized-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(summarizedData, null, 2));
  
  console.log('');
  console.log('✅ 摘要生成完成');
  console.log(`💾 数据已保存: ${outputPath}`);
  console.log(`📊 处理文章: ${summarizedData.feeds.reduce((sum, f) => sum + f.items.length, 0)} 篇`);
  console.log('');
  console.log('💡 提示: 当前使用模拟摘要');
  console.log('   如需真实 LLM，请在 GitHub Secrets 配置 OPENAI_API_KEY');
}

main().catch(console.error);
