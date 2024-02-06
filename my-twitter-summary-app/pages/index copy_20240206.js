import React from 'react';
import axios from 'axios';
import { parseStringPromise } from 'xml2js'; // 使用 Promise 接口的 xml2js 解析函数

export default function Home({ feed, rawXML }) {
  // 显示RSS的原始信息，例如标题和描述
  return (
    <div>
      <h1>RSS Feed</h1>
      {feed.map((item, index) => (
        <div key={index}>
          <h2><strong>Title:</strong><br />{item.title}</h2>
          <p><strong>Creator:</strong><br />{item.creator}</p>
          <p><strong>Published Date:</strong><br />{item.pubDate}</p>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  let allItems = [];
  let rawXML = '';
  let cursor = ''; // 初始化为空
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  try {
    do {
      const url = `https://nitter.woodland.cafe/search/rss?f=tweets&q=web3${cursor ? `&cursor=${cursor}` : ''}`;
      const response = await axios.get(url, {
        headers: {
          'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36',
        },
      });

      // 仅在第一次请求时累加原始 XML 数据
      if (!cursor) {
        rawXML = response.data;
      }

      const feed = await parseStringPromise(response.data);
      const items = feed.rss.channel[0].item.map((item) => ({
        title: item.title[0],
        description: item.description[0],
        link: item.link[0],
        creator: item['dc:creator'] ? item['dc:creator'][0] : '',
        pubDate: item.pubDate[0],
        guid: item.guid[0],
      }));

      allItems = allItems.concat(items);
      cursor = response.headers['min-id'] || ''; // 更新 cursor 为下一次请求

      // 检查是否需要继续请求
    } while (cursor && new Date(allItems[allItems.length - 1].pubDate) >= threeDaysAgo);

    return {
      props: { feed: allItems, rawXML },
    };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return { props: { feed: [], rawXML: '' } };
  }
}