// pages/api/tweets.js

import fetchTweets from '../../lib/fetchTweets';

export default async function handler(req, res) {
  const { topic, startDate, endDate } = req.query;
  try {
    const tweets = await fetchTweets(topic, startDate, endDate);
    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}