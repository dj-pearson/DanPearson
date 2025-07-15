import { motion } from 'framer-motion'
import NewsCard from '../components/NewsCard'

const News = () => {
  const articles = [
    {
      title: 'AI-Powered Business Automation Reaches New Heights in July 2025',
      excerpt: 'Companies worldwide report 40% efficiency gains as AI automation tools become more sophisticated and accessible.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      category: 'AI',
      date: 'July 28, 2025'
    },
    {
      title: 'NFT Utility Revolution: Beyond Digital Collectibles',
      excerpt: 'July 2025 marks a turning point as NFTs integrate with real-world services, from event tickets to property deeds.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
      category: 'NFT',
      date: 'July 25, 2025'
    },
    {
      title: 'Quantum Computing Breakthrough Accelerates Blockchain Security',
      excerpt: 'New quantum-resistant algorithms deployed across major blockchain networks, ensuring future-proof security.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      category: 'Blockchain',
      date: 'July 22, 2025'
    },
    {
      title: 'Remote Sales Teams Achieve Record Performance with AI Coaching',
      excerpt: 'AI-powered sales coaching platforms help distributed teams exceed targets by 35% in Q2 2025.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      category: 'Sales',
      date: 'July 18, 2025'
    },
    {
      title: 'Web3 Integration Becomes Standard for Enterprise Applications',
      excerpt: 'Major corporations adopt Web3 technologies for supply chain transparency and customer engagement.',
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=300&fit=crop',
      category: 'Web3',
      date: 'July 15, 2025'
    },
    {
      title: 'Sustainable Tech Solutions Drive Green Business Transformation',
      excerpt: 'July 2025 sees unprecedented adoption of eco-friendly technologies across industries worldwide.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      category: 'Sustainability',
      date: 'July 12, 2025'
    },
    {
      title: 'Decentralized Finance Reaches $2 Trillion Market Cap',
      excerpt: 'DeFi protocols mature in June 2025, offering traditional banking alternatives to millions globally.',
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop',
      category: 'DeFi',
      date: 'June 30, 2025'
    },
    {
      title: 'AI Content Creation Tools Transform Marketing Landscape',
      excerpt: 'June 2025 brings advanced AI tools that revolutionize content creation and marketing strategies.',
      image: 'https://images.unsplash.com/photo-1686191128892-5ba47b5e6e0c?w=400&h=300&fit=crop',
      category: 'AI',
      date: 'June 28, 2025'
    },
    {
      title: 'Cross-Chain Interoperability Solves Blockchain Fragmentation',
      excerpt: 'New protocols enable seamless asset transfers between different blockchain networks in June 2025.',
      image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=300&fit=crop',
      category: 'Blockchain',
      date: 'June 25, 2025'
    },
    {
      title: 'Virtual Reality Meetings Replace Traditional Video Calls',
      excerpt: 'June 2025 witnesses mass adoption of VR meeting platforms as remote work evolves to immersive experiences.',
      image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=300&fit=crop',
      category: 'VR',
      date: 'June 22, 2025'
    },
    {
      title: 'Smart Contract Auditing Becomes Fully Automated',
      excerpt: 'AI-powered security auditing tools eliminate human error in smart contract verification processes.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      category: 'Security',
      date: 'June 18, 2025'
    },
    {
      title: 'Customer Experience Revolution Through Predictive Analytics',
      excerpt: 'Businesses leverage advanced analytics to anticipate customer needs and deliver personalized experiences.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      category: 'Business',
      date: 'June 15, 2025'
    },
    {
      title: 'Edge Computing Transforms IoT Device Performance',
      excerpt: 'June 2025 marks widespread deployment of edge computing, reducing latency and improving IoT efficiency.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      category: 'IoT',
      date: 'June 12, 2025'
    },
    {
      title: 'Digital Identity Solutions Gain Global Regulatory Approval',
      excerpt: 'Blockchain-based identity verification systems receive endorsement from major governments worldwide.',
      image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop',
      category: 'Identity',
      date: 'June 8, 2025'
    },
    {
      title: 'Autonomous Business Processes Reduce Operational Costs by 50%',
      excerpt: 'Companies implementing fully autonomous workflows report significant cost savings and efficiency improvements.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      category: 'Automation',
      date: 'June 5, 2025'
    },
    {
      title: 'Next-Generation Social Commerce Platforms Launch',
      excerpt: 'June 2025 introduces revolutionary social commerce platforms combining entertainment with seamless shopping.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      category: 'Commerce',
      date: 'June 2, 2025'
    }
  ]

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">News & Insights</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest trends in AI, NFTs, blockchain technology, 
            and business strategy insights from July and June 2025.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to get the latest insights on AI, technology, and business strategy 
              delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default News