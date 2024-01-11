import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Web3'); // 默认选择Web3

  // 模拟获取数据的函数
  const fetchData = async () => {
    // 根据selectedTopic调整获取的数据
    // 这里是模拟数据，你需要根据实际情况调整
    const mockTweets = [
      { id: 1, content: `推文内容示例 1 (${selectedTopic})` },
      { id: 2, content: `推文内容示例 2 (${selectedTopic})` },
      // 更多推文...
    ];
    const mockSummary = `这是GPT对${selectedTopic}推文的汇总分析。`;

    setTweets(mockTweets);
    setSummary(mockSummary);
  };

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
          <h2 className="text-2xl font-semibold mb-3">推文素材</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tweets.map(tweet => (
              <div key={tweet.id} className="bg-white shadow-lg rounded-lg p-4">
                <p className="text-gray-700">{tweet.content}</p>
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
