const axios = require('axios');
const cheerio = require('cheerio');

const fetchTweets = async (searchQuery) => {
  // 获取今天的日期和七天前的日期
  const today = new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

  // 转换日期为 YYYY-MM-DD 格式
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const sinceDate = formatDate(lastWeek);
  const untilDate = formatDate(today);

  // 构建查询字符串，屏蔽视频内容并设定时间范围
  const queryParams = `f=tweets&q=${encodeURIComponent(searchQuery)}&e-videos=on&e-native_video=on&e-pro_video=on&since=${sinceDate}&until=${untilDate}`;
  const url = `https://nitter.net/search?${queryParams}`;
  //const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(searchQuery)}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
        'User-Agent': "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36"      },
    });
    if (response.status === 200) {
      const tweets = parseTweets(response.data);
      return tweets;
    } else {
      throw new Error(`Error fetching tweets: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching tweets: ${error.message}`);
    return []; // 发生错误时返回空数组
  }
};

const parseTweets = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const tweetsData = [];

  $('.timeline-item').each((index, element) => {
    const tweetLink = $(element).find('.tweet-link').attr('href');
    const content = $(element).find('.tweet-content').text().trim();
    const username = $(element).find('.username').text().trim();
    const tweetDate = $(element).find('.tweet-date a').attr('title');
    tweetsData.push({
      content,
      username,
      tweetDate,
      link: `https://nitter.net${tweetLink}`
    });
  });

  return tweetsData;
};

module.exports = fetchTweets;
