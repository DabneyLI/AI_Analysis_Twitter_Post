import React from 'react';
import axios from 'axios';
import { parseStringPromise } from 'xml2js'; // 使用 Promise 接口的 xml2js 解析函数

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Home({ feed, rawXML }) {
  // 显示RSS的原始信息，例如标题和描述
  return (
    <div>
      <h1>RSS Feed</h1>
      {feed.map((item, index) => (
        <div key={index}>
          <h2><strong>Title:</strong><br />{item.title}</h2>
          <p><strong>Description:</strong><br />{item.description}</p>
          <p><strong>Link:</strong><br /><a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a></p>
          <p><strong>Creator:</strong><br />{item.creator}</p>
          <p><strong>Published Date:</strong><br />{item.pubDate}</p>
          <p><strong>GUID:</strong><br />{item.guid}</p>
          <hr />
        </div>
      ))}
      <h2><strong>Raw XML Data</strong><br /></h2>
      <pre>{rawXML}</pre> {/* 显示原始的 XML 数据 */}
    </div>
  );
}

export async function getServerSideProps() {
  let allItems = [];
  let cursor = ''; // 初始化为空
  let rawXML = '';
  try {
    do {
      const url = `https://nitter.esmailelbob.xyz/search/rss?f=tweets&q=web3${cursor ? `&cursor=${cursor}` : ''}`;
      const response = await axios.get(url, {
        headers: {
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
      });
      rawXML += response.data; // 累加原始 XML 数据，仅用于示例展示
      const feed = await parseStringPromise(response.data);
      const items = feed.rss.channel[0].item.map((item) => ({
        title: item.title[0],
        description: item.description[0],
        link: item.link[0],
        creator: item['dc:creator'] ? item['dc:creator'][0] : 'N/A',
        pubDate: item.pubDate[0],
        guid: item.guid[0],
      }));

      allItems.push(...items);
      // 更新 cursor
      cursor = response.headers['min-id'] || ''; // 根据实际响应头字段更新

      await delay(1000); // 每次请求间添加1秒延迟
    } while (cursor && allItems.length < 100); // 条件可根据实际情况调整

    return {
      props: { feed: allItems, rawXML },
    };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return { props: { feed: [], rawXML: 'Failed to fetch RSS feed.' } };
  }
}
