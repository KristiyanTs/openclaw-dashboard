import { useEffect, useState } from 'react'
import { 
  Zap, 
  MessageSquare, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Terminal,
  Cpu,
  RefreshCw,
  WifiOff
} from 'lucide-react'
import { api, type Stats, type Activity, type Skill } from '../api'

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Check connection first
      const healthy = await api.healthCheck()
      setIsConnected(healthy)
      
      if (!healthy) {
        setError('Cannot connect to OpenClaw. Make sure it\'s running on localhost:3000')
        setIsLoading(false)
        return
      }

      // Fetch all data in parallel
      const [statsData, activityData, skillsData] = await Promise.all([
        api.getStats(),
        api.getActivity(),
        api.getSkills()
      ])

      setStats(statsData)
      setActivities(activityData)
      setSkills(skillsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (uptime: string) => uptime
  const formatNumber = (num: number) => num.toLocaleString()

  const statCards = stats ? [
    {
      title: 'Uptime',
      value: formatUptime(stats.uptime),
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Messages',
      value: formatNumber(stats.messagesProcessed),
      icon: MessageSquare,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Active Skills',
      value: stats.activeSkills.toString(),
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Last Heartbeat',
      value: stats.lastHeartbeat,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ] : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Connecting to OpenClaw...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-lg font-medium hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          <p className="text-slate-500 text-sm mt-4">
            Make sure OpenClaw is running on localhost:3000
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Overview of your OpenClaw agent</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div 
            key={stat.title}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-slate-500 font-mono whitespace-nowrap">{activity.time}</span>
                  <span className="text-slate-300">{activity.message}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            System Status
          </h2>
          <div className="space-y-4">
            {stats && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-slate-200">{stats.memory.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.memory.percentage}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">API Calls (24h)</span>
                    <span className="text-slate-200">{formatNumber(stats.apiCalls.count)}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.apiCalls.percentage}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Storage</span>
                    <span className="text-slate-200">{stats.storage.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.storage.percentage}%` }} 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">OpenAI API: Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Telegram Bot: Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Email: Not configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Active Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div 
                key={skill.name}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200 font-mono truncate" title={skill.name}>
                    {skill.name}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    skill.status === 'active' ? 'bg-emerald-400' : 
                    skill.status === 'paused' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                </div>
                <p className="text-xs text-slate-500">
                  {skill.calls.toLocaleString()} calls
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-slate-500">
              No skills configured
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
