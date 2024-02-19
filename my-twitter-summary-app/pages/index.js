import Head from 'next/head'
import { useState } from 'react'
// 请确保这里的路径与你的项目结构相匹配
// 如果 fetchTweets.js 不在 lib 文件夹内，请更新此路径
import fetchTweets from '../lib/fetchTweets'
import DOMPurify from 'dompurify'
import axios from 'axios'; // 确保已经安装 axios

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Web3'); // 默认选择Web3
  const [isLoading, setIsLoading] = useState(false); // 添加一个加载状态
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serverStatus, setServerStatus] = useState({});
  const [serverList, setServerList] = useState([
    { name: 'Server A', url: 'https://nitter.servera.com', status: 'unknown' },
    { name: 'Server B', url: 'https://nitter.serverb.com', status: 'unknown' },
    // ... 其他服务器
  ]);

  /*useEffect(() => {
    // 当组件加载后，获取服务器状态
    fetchServerStatus();
        // 假设您将有一个 API 端点来检查服务器状态
    serverList.forEach(server => {
      fetch(`/api/server-status?url=${server.url}`)
        .then(response => response.json())
        .then(data => {
          setServerList(prevList =>
            prevList.map(item =>
              item.url === server.url ? { ...item, status: data.status } : item
            )
          );
        })
        .catch(() => {
          setServerList(prevList =>
            prevList.map(item =>
              item.url === server.url ? { ...item, status: 'down' } : item
            )
          );
        });
    });
  }, []);*/

  // 获取服务器状态的函数
  const fetchServerStatus = async () => {
    try {
      // 替换为您的 API 路径
      const response = await axios.get('/api/server-status');
      setServerStatus(response.data);
    } catch (error) {
      console.error('Error fetching server status:', error);
    }
  };


  // 获取推文数据的函数，现在包含开始日期和结束日期参数
  const fetchData = async () => {
    setIsLoading(true); // 开始加载数据时设置为true
    try {
      // 将日期参数添加到 API 请求中
      const response = await axios.get(`/api/tweets?topic=${selectedTopic}&startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      setTweets(response.data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setIsLoading(false); // 加载完成后设置为false
    }
  };

  // 安全地创建HTML内容
  const createMarkup = (htmlContent) => {
    // 使用DOMPurify来清理和过滤内容
    return { __html: DOMPurify.sanitize(htmlContent) };
  }

  return (
    <div>
      <Head>
        <title>Twitter Summary</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-lg">Twitter Summary</h1>
        </div>
      </nav>

      <main className="container mx-auto my-8">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          {/* 话题选择 */}
          <select 
            className="bg-white border border-gray-300 text-gray-700 text-xs py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
          >
            <option value="Web3">Web3</option>
            <option value="AI">AI</option>
            {/* 更多选项... */}
          </select>

          {/* 日期选择 */}
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-xs font-bold text-gray-700">开始日期:</label>
            <input
              type="date"
              id="startDate"
              className="bg-white border border-gray-300 text-gray-700 text-xs py-1 px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <label htmlFor="endDate" className="text-xs font-bold text-gray-700">结束日期:</label>
            <input
              type="date"
              id="endDate"
              className="bg-white border border-gray-300 text-gray-700 text-xs py-1 px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          {/* 服务器选择 */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700">选择服务器:</label>
            <select
              className="bg-white border border-gray-300 text-gray-700 text-xs py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              onChange={e => {
                // ... 选择服务器的处理逻辑
              }}
            >
                {serverList.map(server => (
                  <option key={server.url} value={server.url}>
                    {server.name} {server.status === 'up' ? '🟢' : '🔴'}
                  </option>
                ))}
            </select>
          </div>

          {/* 获取推文数据按钮 */}
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded"
            onClick={fetchData}
          >
            获取推文数据
          </button>
        </div>


        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">GPT汇总分析</h2>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <p className="text-gray-700">{summary}</p>
          </div>
        </div>
        <div>
          {isLoading ? <p>Loading...</p> : (
            <div>
            {/* 显示推文 */}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">推文素材</h2>
            <div className="mb-6 grid grid-cols-1 justify-items-center gap-8 sm:justify-items-stretch md:grid-cols-3 md:gap-4 lg:mb-12">
                {tweets.map((tweet, index) => (
                  <div key={index} className="flex flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                    {/* 这里使用 createMarkup 函数来设置清理过的HTML内容 */}
                    <div dangerouslySetInnerHTML={createMarkup(tweet.content)} />
                    <p className="text-gray-500 text-sm">{tweet.username}</p>
                    <p className="text-gray-500 text-sm">{tweet.tweetDate}</p>
                    <a href={`${tweet.link}`} target="_blank" rel="noopener noreferrer" className="mt-auto text-blue-500 hover:text-blue-600 transition-colors duration-300">查看原推文 &rarr;</a>
                  </div>
                ))}
              </div>
        </div>
      </main>

      <footer className="bg-gray-800 p-4 text-white text-center">
        <p>© 2024 Twitter Summary</p>
      </footer>
    </div>
  )
}
