const axios = require('axios');
const cheerio = require('cheerio');

const fetchTweets = async (searchQuery) => {
  const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(searchQuery)}`;
  try {
    const response = await axios.get(url);
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
