import { motion } from 'framer-motion'
import { useAdmin } from '../contexts/AdminContext'
import { FileText, Eye, TrendingUp, Calendar } from 'lucide-react'

const DashboardStats = () => {
  const { stats } = useAdmin()

  const statCards = [
    {
      icon: FileText,
      label: 'Total Posts',
      value: stats.totalPosts,
      change: '+2 this month',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Eye,
      label: 'Published',
      value: stats.publishedPosts,
      change: `${stats.draftPosts} drafts`,
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+12% this month',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: Calendar,
      label: 'This Month',
      value: stats.monthlyViews,
      change: `${stats.weeklyViews} this week`,
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
              <stat.icon size={24} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
            <p className="text-xs text-cyan-400">{stat.change}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default DashboardStats