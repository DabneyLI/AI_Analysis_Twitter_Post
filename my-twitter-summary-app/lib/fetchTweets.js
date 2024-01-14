const axios = require('axios');
const cheerio = require('cheerio');

const fetchTweets = async (searchQuery) => {
  let allTweets = [];
  let hasNextPage = true;
  let cursor = '';

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  while (hasNextPage) {
    const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(searchQuery)}&${cursor}`;
    try {
      const response = await axios.get(url, {
        headers: {
          'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36'
        }
      });
      const { tweets, nextCursor, lastTweetDate } = parseTweetsAndCursor(response.data);

      if (new Date(lastTweetDate) < oneWeekAgo) {
        hasNextPage = false;
      } else {
        allTweets = allTweets.concat(tweets);
        cursor = nextCursor ? `cursor=${nextCursor}` : '';
        hasNextPage = !!nextCursor;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
    } catch (error) {
      console.error(`Error fetching tweets: ${error.message}`);
      hasNextPage = false;
    }
  }

  return allTweets;
};

const parseTweetsAndCursor = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const tweetsData = [];
  const loadMoreLink = $('.show-more a').attr('href');
  const cursor = new URLSearchParams(loadMoreLink).get('cursor');
  let lastTweetDate = '';

  $('.timeline-item').each((index, element) => {
    const tweetLink = $(element).find('.tweet-link').attr('href');
    const content = $(element).find('.tweet-content').text().trim();
    const username = $(element).find('.username').text().trim();
    const tweetDate = $(element).find('.tweet-date a').attr('title');

    // 更新最后一条推文的日期
    if (index === 0) {
      lastTweetDate = tweetDate;
    }

    tweetsData.push({
      content,
      username,
      tweetDate,
      link: `${tweetLink}`
    });
  });

  return { tweets: tweetsData, nextCursor: cursor, lastTweetDate };
};

module.exports = fetchTweets;
