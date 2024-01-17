import axios from 'axios';
import { parseString } from 'xml2js';

// 用于将 XML 转换为 JS 对象的辅助函数
const parseXml = async (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, { trim: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export default function Home({ feed }) {
  return (
    <div>
      <h1>RSS Feed</h1>
      {feed.map((item, index) => (
        <div key={index}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a>
          <hr />
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

    // 将获取的 XML 数据解析为 JS 对象
    const parsedData = await parseXml(res.data);
    const feedItems = parsedData.rss.channel[0].item.map(item => ({
      title: item.title[0],
      description: item.description[0],
      link: item.link[0]
    }));

    // 返回解析后的数据作为 props
    return { props: { feed: feedItems } };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return { props: { feed: [] } }; // 发生错误时返回空数组
  }
}
