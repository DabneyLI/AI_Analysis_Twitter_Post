const axios = require('axios');
const xml2js = require('xml2js');

const fetchTweets = async (searchQuery) => {
  let allTweets = [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // 用于保存下一页数据的游标，初始为空
  let cursor = '';

  try {
    // 循环直到没有更多页或达到一周前的日期
    while (cursor !== null) {
      // 更新 URL，包含游标（如果有）
      const url = `https://nitter.woodland.cafe/search/rss?f=tweets&q=${encodeURIComponent(searchQuery)}&${cursor}`;

      const response = await axios.get(url, {
        headers: {
          'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36'
        }
      });

      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(response.data);

      const items = result.rss.channel.item;
      if (items) {
        items.forEach(item => {
          const tweetDate = new Date(item.pubDate);
          if (tweetDate >= oneWeekAgo) {
            allTweets.push({
              content: item.description.__cdata || item.description, // 使用 CDATA 或直接内容
              username: item['dc:creator'],
              tweetDate: tweetDate.toISOString(),
              link: item.link
            });
          }
        });
      }

      // 更新游标以请求下一页数据
      cursor = extractNextCursor(result);
      
      // 如果日期已经早于一周前，则停止加载
      if (allTweets.length > 0 && new Date(allTweets[allTweets.length - 1].tweetDate) < oneWeekAgo) {
        cursor = null;
      }
    }
  } catch (error) {
    console.error(`Error fetching tweets from RSS: ${error.message}`);
  }

  return allTweets;
};

// 从 RSS 响应中提取下一页的游标
function extractNextCursor(rssResponse) {
  // 因为 RSS 中通常没有像网页那样的“下一页”游标，
  // 所以这里我们根据最后一个项目的发布日期来判断是否还有更多数据。
  // 这个逻辑可能需要根据实际的 RSS 内容进行调整。

  const items = rssResponse.rss.channel.item;
  if (items && items.length > 0) {
    const lastItem = items[items.length - 1];
    const lastItemDate = new Date(lastItem.pubDate);
    
    // 检查最后一个项目的日期是否早于一周前
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    if (lastItemDate < oneWeekAgo) {
      // 如果是，说明没有更多数据了
      return null;
    }
  }

  // 如果项目不满足停止条件，则可能还有更多数据
  // 这里可以返回一个标记来表示需要继续加载，但实际的处理取决于 RSS 源的特性
  return 'continue';
}

module.exports = fetchTweets;
