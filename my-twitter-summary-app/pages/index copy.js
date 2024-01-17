import Head from 'next/head'
import { useState } from 'react'
// 请确保这里的路径与你的项目结构相匹配
// 如果 fetchTweets.js 不在 lib 文件夹内，请更新此路径
import fetchTweets from '../lib/fetchTweets'
import DOMPurify from 'dompurify'

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Web3'); // 默认选择Web3
  const [isLoading, setIsLoading] = useState(false); // 添加一个加载状态

  // 获取数据的函数
  const fetchData = async () => {
    setIsLoading(true); // 开始加载数据时设置为true
    try {
      const response = await fetch(`/api/tweets?topic=${selectedTopic}`);
      const data = await response.json();
      setTweets(data);
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
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          <select 
            className="mb-4 sm:mb-0 bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
          >
            <option value="Web3">Web3</option>
            <option value="AI">AI</option>
            {/* 更多选项... */}
          </select>

          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
