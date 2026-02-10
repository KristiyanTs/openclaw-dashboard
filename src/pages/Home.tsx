import { useEffect, useState } from 'react'
import { 
  Zap, 
  MessageSquare, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Terminal,
  Cpu
} from 'lucide-react'

interface Stats {
  uptime: string
  messagesProcessed: number
  activeSkills: number
  lastHeartbeat: string
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    uptime: '3d 12h 45m',
    messagesProcessed: 1247,
    activeSkills: 8,
    lastHeartbeat: '2 min ago'
  })
  const [isConnected, setIsConnected] = useState(true)

  // Simulate fetching stats from OpenClaw API
  useEffect(() => {
    // In real implementation, this would fetch from OpenClaw API
    // fetch('http://localhost:3000/api/stats')
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        messagesProcessed: prev.messagesProcessed + Math.floor(Math.random() * 3)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: 'Uptime',
      value: stats.uptime,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Messages',
      value: stats.messagesProcessed.toLocaleString(),
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
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Overview of your OpenClaw agent</p>
          </div>
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
            {[
              { time: '2 min ago', message: 'Processed message from Telegram', type: 'success' },
              { time: '5 min ago', message: 'Skill "email_summarizer" executed', type: 'info' },
              { time: '12 min ago', message: 'Heartbeat ping received', type: 'success' },
              { time: '15 min ago', message: 'New memory entry created', type: 'info' },
              { time: '28 min ago', message: 'Calendar event reminder sent', type: 'success' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-slate-500 font-mono whitespace-nowrap">{activity.time}</span>
                <span className="text-slate-300">{activity.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            System Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-slate-200">45%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[45%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">API Calls (24h)</span>
                <span className="text-slate-200">1,247</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[62%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Storage</span>
                <span className="text-slate-200">23%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[23%] rounded-full" />
              </div>
            </div>

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
          {[
            { name: 'email_summarizer', status: 'active', calls: 156 },
            { name: 'calendar_manager', status: 'active', calls: 89 },
            { name: 'todo_tracker', status: 'active', calls: 234 },
            { name: 'weather_check', status: 'active', calls: 45 },
            { name: 'news_digest', status: 'paused', calls: 12 },
            { name: 'expense_logger', status: 'active', calls: 67 },
            { name: 'meeting_notes', status: 'active', calls: 34 },
            { name: 'reminder_bot', status: 'active', calls: 198 },
          ].map((skill) => (
            <div 
              key={skill.name}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200 font-mono">
                  {skill.name}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  skill.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </div>
              <p className="text-xs text-slate-500">
                {skill.calls.toLocaleString()} calls
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
