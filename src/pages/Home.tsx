import { useEffect, useState } from 'react'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Terminal,
  Cpu,
  RefreshCw,
  WifiOff,
  Database,
  FileText
} from 'lucide-react'
import { api, type Stats, type Activity, type Session } from '../api'

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [sessions, setSessions] = useState<any[]>([])
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

      const [statsData, activityData, sessionsData] = await Promise.all([
        api.getStats(),
        api.getActivity(),
        api.getSessions()
      ])

      setStats(statsData)
      setActivities(activityData)
      setSessions(sessionsData)
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

  const formatNumber = (num: number) => num?.toLocaleString() || '0'

  const statCards = stats ? [
    { title: 'Uptime', value: stats.uptime, icon: Clock },
    { title: 'Messages', value: formatNumber(stats.messagesProcessed), icon: MessageSquare },
    { title: 'Sessions', value: formatNumber(stats.sessionCount), icon: FileText },
    { title: 'Model', value: stats.primaryModel?.split('/').pop() || 'unknown', icon: Cpu }
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
              <div className={`w-1.5 h-1.5 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
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
              <stat.icon className="w-5 h-5 text-green-500" />
              <span className="text-neutral-500 text-sm">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold text-white truncate">{stat.value}</p>
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

        {/* Recent Sessions */}
        <div className="bg-neutral-900 border border-neutral-800">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-medium text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              Recent Sessions
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {sessions.length > 0 ? (
              sessions.slice(0, 8).map((session) => (
                <div key={session.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-neutral-600" />
                    <span className="text-neutral-300 font-mono text-xs">{session.id.slice(0, 8)}...</span>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-400 text-xs">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-neutral-600 text-xs">{(session.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-600 text-center py-8">No sessions found</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      {stats && (
        <div className="mt-6 bg-neutral-900 border border-neutral-800">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-medium text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-500" />
              System Status
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-500">Memory Usage</span>
                  <span className="text-neutral-300">{stats.memory?.percentage || 0}%</span>
                </div>
                <div className="h-1 bg-neutral-800">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${Math.min(stats.memory?.percentage || 0, 100)}%` }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-500">API Activity</span>
                  <span className="text-neutral-300">{formatNumber(stats.apiCalls?.count)}</span>
                </div>
                <div className="h-1 bg-neutral-800">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${Math.min(stats.apiCalls?.percentage || 0, 100)}%` }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-500">Storage</span>
                  <span className="text-neutral-300">{stats.storage?.percentage || 0}%</span>
                </div>
                <div className="h-1 bg-neutral-800">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-500" 
                    style={{ width: `${Math.min(stats.storage?.percentage || 0, 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-neutral-400">OpenClaw Gateway: Running</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-neutral-400">Session Storage: {sessions.length} sessions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
