const axios = require('axios');
const xml2js = require('xml2js');

// 定义一个延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchTweets = async (searchQuery) => {
  let allTweets = [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  let cursor = ''; // 初始化游标为空字符串

  try {
    while (true) {
      const url = `https://nitter.esmailelbob.xyz/search/rss?f=tweets&q=${encodeURIComponent(searchQuery)}${cursor ? `&cursor=${cursor}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36'
        }
      });

      // 从响应头中提取游标
      cursor = response.headers['min-id'];

      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(response.data);

      let items = result.rss.channel.item;
      // 确保items始终是一个数组
      items = Array.isArray(items) ? items : [items]; // 如果不是数组，则转换为数组

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

      // 如果没有游标或已经获取了一周前的推文，结束循环
      if (!cursor || new Date(allTweets[allTweets.length - 1].tweetDate) < oneWeekAgo) {
        break;
      }

      // 在每次请求之间添加一个延迟，以避免过于频繁的请求
      await delay(10); // 延迟1秒
    }
  } catch (error) {
    console.error(`Error fetching tweets from RSS: ${error.message}`);
  }

  return allTweets;
};

module.exports = fetchTweets;
