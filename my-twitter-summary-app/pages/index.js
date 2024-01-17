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
          <p><strong>Description:</strong><br />{item.description}</p>
          <p><strong>Link:</strong><br /><a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a></p>
          <p><strong>Creator:</strong><br />{item.creator}</p>
          <p><strong>Published Date:</strong><br />{item.pubDate}</p>
          <p><strong>GUID:</strong><br />{item.guid}</p>
          <a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a>
          <hr />
          
          <h2><strong>Raw XML Data</strong><br /></h2>
          <pre>{rawXML}</pre> {/* 显示原始的 XML 数据 */}
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await axios.get('https://nitter.woodland.cafe/search/rss?f=tweets&q=web3', {
      headers: {
        'accept-language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36'
      }
    });
    // 存储原始的 XML 数据
    const rawXML = res.data;
    // 解析XML格式的RSS数据
    const feed = await parseStringPromise(res.data);
    const items = feed.rss.channel[0].item.map((item) => {
      return {
        title: item.title[0],
        description: item.description[0],
        link: item.link[0],
        creator: item['dc:creator'] ? item['dc:creator'][0] : '',
        pubDate: item.pubDate[0],
        guid: item.guid[0]
      };
    });
    

    // 将解析后的RSS数据和原始的 XML 数据传递给页面组件
    return {
      props: { feed: items, rawXML },
    };

  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return { props: { feed: [], rawXML: '' } }; // 确保错误时也返回 rawXML
  }
}
