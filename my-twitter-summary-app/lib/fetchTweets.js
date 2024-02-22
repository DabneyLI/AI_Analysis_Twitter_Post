const axios = require('axios');
const xml2js = require('xml2js');

// 定义一个延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// fetchTweets 函数现在接受开始日期和结束日期作为参数
const fetchTweets = async (topic, startDate, endDate) => {
  let allTweets = [];
  let cursor = '';
  const parser = new xml2js.Parser(); // Create a new instance of the parser

  try {
    // 循环请求直到没有更多数据
    while (true) {
      const url = `https://nitter.esmailelbob.xyz/search/rss?f=tweets&q=${topic}&since=${startDate}&until=${endDate}${cursor ? `&cursor=${cursor}` : ''}`;
      const response = await axios.get(url);
      cursor = response.headers['min-id'];

      const result = await parser.parseStringPromise(response.data);
      let items = result.rss.channel[0].item;
      items = Array.isArray(items) ? items : [items];

      items.forEach(item => {
        const tweetDate = new Date(item.pubDate);
        allTweets.push({
          content: item.description.__cdata || item.description,
          username: item['dc:creator'],
          tweetDate: tweetDate.toISOString(),
          link: item.link
        });
      });

      if (!cursor) break; // 没有更多数据
      await delay(3); // 避免过快请求
    }
  } catch (error) {
    console.error(`Error fetching tweets: ${error}`);
  }

  return allTweets;
};

module.exports = fetchTweets;
