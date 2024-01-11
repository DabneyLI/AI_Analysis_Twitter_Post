// pages/api/tweets.js

import fetchTweets from '../../lib/fetchTweets';

export default async function handler(req, res) {
  const { topic } = req.query;
  console.log('Attempting to fetch data...'); // 确认函数被调用 // 测试代码
  try {
    const tweets = await fetchTweets(topic);
    console.log('Data received:'); // 确认数据被接收 // 测试代码
    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
