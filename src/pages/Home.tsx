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
      const healthy = await api.healthCheck()
      setIsConnected(healthy)
      
      if (!healthy) {
        setError('Cannot connect to OpenClaw. Make sure it\'s running on localhost:3000')
        setIsLoading(false)
        return
      }

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
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => num.toLocaleString()

  const statCards = stats ? [
    { title: 'Uptime', value: stats.uptime, icon: Clock, color: 'text-blue-400' },
    { title: 'Messages', value: formatNumber(stats.messagesProcessed), icon: MessageSquare, color: 'text-green-400' },
    { title: 'Active Skills', value: stats.activeSkills.toString(), icon: Zap, color: 'text-yellow-400' },
    { title: 'Last Heartbeat', value: stats.lastHeartbeat, icon: CheckCircle, color: 'text-green-400' }
  ] : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Connecting to OpenClaw...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-950/30 border border-red-800 p-8 text-center">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-400 mb-2">Connection Error</h2>
          <p className="text-neutral-500 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
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
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-neutral-500 text-sm">Overview of your OpenClaw agent</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-neutral-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-neutral-500" />
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 border ${
              isConnected 
                ? 'bg-green-950/30 border-green-800 text-green-400' 
                : 'bg-red-950/30 border-red-800 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-medium uppercase tracking-wider">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div 
            key={stat.title}
            className="bg-neutral-900 border border-neutral-800 p-5 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-neutral-500 text-sm">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-neutral-900 border border-neutral-800">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-medium text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-neutral-600 font-mono text-xs">{activity.time}</span>
                  <span className="text-neutral-300">{activity.message}</span>
                </div>
              ))
            ) : (
              <p className="text-neutral-600 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-neutral-900 border border-neutral-800">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-medium text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-500" />
              System Status
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {stats && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-500">Memory Usage</span>
                    <span className="text-neutral-300">{stats.memory.percentage}%</span>
                  </div>
                  <div className="h-1 bg-neutral-800">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${stats.memory.percentage}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-500">API Calls (24h)</span>
                    <span className="text-neutral-300">{formatNumber(stats.apiCalls.count)}</span>
                  </div>
                  <div className="h-1 bg-neutral-800">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${stats.apiCalls.percentage}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-500">Storage</span>
                    <span className="text-neutral-300">{stats.storage.percentage}%</span>
                  </div>
                  <div className="h-1 bg-neutral-800">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500" 
                      style={{ width: `${stats.storage.percentage}%` }} 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-neutral-400">OpenAI API: Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-neutral-400">Telegram Bot: Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-neutral-400">Email: Not configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-6 bg-neutral-900 border border-neutral-800">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="font-medium text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-green-500" />
            Active Skills
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div 
                key={skill.name}
                className="bg-neutral-950 border border-neutral-800 p-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white font-mono truncate" title={skill.name}>
                    {skill.name}
                  </span>
                  <div className={`w-1.5 h-1.5 ${
                    skill.status === 'active' ? 'bg-green-500' : 
                    skill.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <p className="text-xs text-neutral-600">
                  {skill.calls.toLocaleString()} calls
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-neutral-600">
              No skills configured
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
