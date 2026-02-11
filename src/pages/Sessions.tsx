import { useEffect, useState } from 'react'
import { 
  FileText, 
  RefreshCw,
  WifiOff,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  User,
  Bot,
  Wrench,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { api, type Session, type SessionMessage } from '../api'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSessions = async () => {
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

      const sessionsData = await api.getSessions()
      setSessions(sessionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const viewSession = async (session: Session) => {
    setActionLoading(session.id)
    try {
      const data = await api.getSession(session.id)
      setSelectedSession(session)
      setSessionMessages(data.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSession = async (session: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    if (session.isActive) {
      alert('Cannot delete the active main session')
      return
    }
    if (!confirm(`Delete session "${session.id.slice(0, 8)}..."?\n\nThis will remove ${session.messageCount} messages permanently.`)) {
      return
    }
    setActionLoading(session.id)
    try {
      await api.deleteSession(session.id)
      await fetchSessions()
      if (selectedSession?.id === session.id) {
        setSelectedSession(null)
        setSessionMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user': return <User className="w-4 h-4 text-blue-400" />
      case 'assistant': return <Bot className="w-4 h-4 text-green-400" />
      case 'tool': return <Wrench className="w-4 h-4 text-yellow-400" />
      case 'tool_result': return <MessageSquare className="w-4 h-4 text-purple-400" />
      default: return <MessageSquare className="w-4 h-4 text-neutral-400" />
    }
  }

  const getMessageLabel = (role: string) => {
    switch (role) {
      case 'user': return 'You'
      case 'assistant': return 'Assistant'
      case 'tool': return 'Tool Call'
      case 'tool_result': return 'Tool Result'
      default: return role
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading sessions...</p>
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
            onClick={fetchSessions}
            className="px-6 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Session Detail View
  if (selectedSession) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedSession(null)
                  setSessionMessages([])
                }}
                className="p-2 hover:bg-neutral-800 transition-colors text-neutral-400"
                title="Back to sessions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Session {selectedSession.id.slice(0, 12)}...</h1>
                <p className="text-neutral-500 text-sm">
                  {formatTime(selectedSession.timestamp)} · {selectedSession.messageCount} messages · {formatBytes(selectedSession.size)}
                  {selectedSession.isActive && ' · · · · Active Session'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!selectedSession.isActive && (
                <button
                  onClick={(e) => deleteSession(selectedSession, e)}
                  disabled={actionLoading === selectedSession.id}
                  className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/30 border border-green-800 text-green-400">
                <div className="w-1.5 h-1.5 bg-green-400" />
                <span className="text-xs font-medium uppercase tracking-wider">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-800">
          <div className="p-6 space-y-6">
            {sessionMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">No messages in this session</p>
              </div>
            ) : (
              sessionMessages.map((msg, i) => (
                <div key={i} className="border-b border-neutral-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(msg.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium text-sm ${
                          msg.role === 'user' ? 'text-blue-400' :
                          msg.role === 'assistant' ? 'text-green-400' :
                          msg.role === 'tool' ? 'text-yellow-400' :
                          msg.role === 'tool_result' ? 'text-purple-400' : 'text-neutral-400'
                        }`}>
                          {msg.toolName || getMessageLabel(msg.role)}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.model && (
                          <span className="text-xs text-neutral-500">· {msg.model.split('/').pop()}</span>
                        )}
                      </div>
                      <div className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      {msg.toolArgs && Object.keys(msg.toolArgs).length > 0 && (
                        <div className="mt-2 p-2 bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-400 overflow-x-auto">
                          {JSON.stringify(msg.toolArgs, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Sessions List View
  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Sessions</h1>
            <p className="text-neutral-500 text-sm">
              {sessions.length} total sessions · Click a session to view messages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              className="p-2 hover:bg-neutral-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-neutral-400" />
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

      {/* Sessions List */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 overflow-auto">
        <div className="p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-500">No sessions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group"
                  onClick={() => viewSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 ${session.isActive ? 'bg-green-500' : 'bg-neutral-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-neutral-300">
                            {session.id.slice(0, 16)}...
                          </span>
                          {session.isActive && (
                            <span className="text-xs px-2 py-0.5 bg-green-950/30 border border-green-800 text-green-400">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatTime(session.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">{session.messageCount} messages</p>
                        <p className="text-xs text-neutral-600">{formatBytes(session.size)}</p>
                      </div>
                      
                      <button
                        onClick={(e) => deleteSession(session, e)}
                        disabled={actionLoading === session.id || session.isActive}
                        className="p-2 hover:bg-red-950/30 text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-600"
                        title={session.isActive ? 'Cannot delete active session' : 'Delete session'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
