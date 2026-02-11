import { useEffect, useState } from 'react'
import { 
  Clock, 
  Play,
  Pause,
  Trash2,
  RefreshCw,
  WifiOff,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Edit3
} from 'lucide-react'
import { api, type CronJob } from '../api'

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<CronJob | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchJobs = async () => {
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

      const data = await api.getCronJobs()
      setJobs(data.jobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const toggleJob = async (job: CronJob) => {
    setActionLoading(job.id)
    try {
      await api.updateCronJob(job.id, { enabled: !job.enabled })
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle job')
    } finally {
      setActionLoading(null)
    }
  }

  const runJobNow = async (job: CronJob) => {
    setActionLoading(job.id)
    try {
      await api.runCronJob(job.id)
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run job')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteJob = async (job: CronJob) => {
    if (!confirm(`Delete "${job.name}"? This cannot be undone.`)) return
    setActionLoading(job.id)
    try {
      await api.deleteCronJob(job.id)
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job')
    } finally {
      setActionLoading(null)
    }
  }

  const updateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return
    
    setActionLoading(editingJob.id)
    try {
      await api.updateCronJob(editingJob.id, editingJob)
      setEditingJob(null)
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job')
    } finally {
      setActionLoading(null)
    }
  }

  const formatSchedule = (schedule: CronJob['schedule']): string => {
    if (schedule.kind === 'cron' && schedule.expr) {
      return schedule.expr
    }
    if (schedule.kind === 'at' && schedule.at) {
      return new Date(schedule.at).toLocaleString()
    }
    if (schedule.kind === 'every' && schedule.everyMs) {
      const minutes = Math.floor(schedule.everyMs / 60000)
      const hours = Math.floor(minutes / 60)
      if (hours > 0) return `Every ${hours}h`
      return `Every ${minutes}m`
    }
    return 'Unknown'
  }

  const formatDate = (ms: number): string => {
    if (!ms) return 'Never'
    return new Date(ms).toLocaleString()
  }

  const getNextRunText = (job: CronJob): string => {
    if (!job.enabled) return 'Disabled'
    if (job.state?.nextRunAtMs) {
      return formatDate(job.state.nextRunAtMs)
    }
    return 'Not scheduled'
  }

  const getStatusColor = (job: CronJob): string => {
    if (!job.enabled) return 'text-neutral-500'
    if (job.state?.lastStatus === 'ok') return 'text-green-500'
    if (job.state?.lastStatus === 'error') return 'text-red-500'
    return 'text-yellow-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading cron jobs...</p>
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
            onClick={fetchJobs}
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
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Cron Jobs</h1>
            <p className="text-neutral-500 text-sm">
              {jobs.length} scheduled job{jobs.length !== 1 ? 's' : ''} · 
              {jobs.filter(j => j.enabled).length} active · 
              {jobs.filter(j => !j.enabled).length} disabled
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchJobs}
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

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {jobs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 p-12 text-center">
            <Clock className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">No cron jobs found</p>
          </div>
        ) : (
          jobs.map(job => (
            <div 
              key={job.id}
              className={`bg-neutral-900 border ${expandedJob === job.id ? 'border-neutral-600' : 'border-neutral-800'} transition-colors`}
            >
              {/* Job Header */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-800/50"
                onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
              >
                <div className={`w-2 h-2 ${job.enabled ? 'bg-green-500' : 'bg-neutral-600'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium truncate ${job.enabled ? 'text-white' : 'text-neutral-400'}`}>
                      {job.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 border ${
                      job.enabled 
                        ? 'bg-green-950/30 border-green-800 text-green-400' 
                        : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                    }`}>
                      {job.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatSchedule(job.schedule)}
                    {job.schedule.tz && ` · ${job.schedule.tz}`}
                  </p>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-xs text-neutral-500">Next Run</p>
                  <p className={`text-sm ${getStatusColor(job)}`}>
                    {getNextRunText(job)}
                  </p>
                </div>

                {job.state?.lastStatus && (
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-neutral-500">Last Run</p>
                    <p className="text-sm text-neutral-400">
                      {formatDate(job.state.lastRunAtMs || 0)}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleJob(job) }}
                    disabled={actionLoading === job.id}
                    className="p-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title={job.enabled ? 'Disable' : 'Enable'}
                  >
                    {job.enabled ? (
                      <Pause className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Play className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); runJobNow(job) }}
                    disabled={actionLoading === job.id || !job.enabled}
                    className="p-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title="Run now"
                  >
                    <Play className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingJob(job) }}
                    disabled={actionLoading === job.id}
                    className="p-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4 text-neutral-400" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteJob(job) }}
                    disabled={actionLoading === job.id}
                    className="p-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  {expandedJob === job.id ? (
                    <ChevronUp className="w-5 h-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-500" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedJob === job.id && (
                <div className="border-t border-neutral-800 p-4 bg-neutral-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500 mb-1">Job ID</p>
                      <p className="text-neutral-300 font-mono text-xs">{job.id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Agent</p>
                      <p className="text-neutral-300">{job.agentId}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Schedule Type</p>
                      <p className="text-neutral-300 capitalize">{job.schedule.kind}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Session Target</p>
                      <p className="text-neutral-300">{job.sessionTarget}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Wake Mode</p>
                      <p className="text-neutral-300">{job.wakeMode}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Delivery Mode</p>
                      <p className="text-neutral-300">{job.delivery?.mode || 'none'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Created</p>
                      <p className="text-neutral-300">{formatDate(job.createdAtMs)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">Last Updated</p>
                      <p className="text-neutral-300">{formatDate(job.updatedAtMs)}</p>
                    </div>
                    {job.state?.lastDurationMs && (
                      <div>
                        <p className="text-neutral-500 mb-1">Last Duration</p>
                        <p className="text-neutral-300">{(job.state.lastDurationMs / 1000).toFixed(1)}s</p>
                      </div>
                    )}
                    {job.state?.consecutiveErrors !== undefined && job.state.consecutiveErrors > 0 && (
                      <div>
                        <p className="text-neutral-500 mb-1">Consecutive Errors</p>
                        <p className="text-red-400">{job.state.consecutiveErrors}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-neutral-500 mb-2">Payload Message</p>
                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded text-neutral-300 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {job.payload.message || job.payload.text || 'No message'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Edit Job</h2>
              <button 
                onClick={() => setEditingJob(null)}
                className="p-1 hover:bg-neutral-800"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            
            <form onSubmit={updateJob} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Name</label>
                <input
                  type="text"
                  value={editingJob.name}
                  onChange={(e) => setEditingJob({...editingJob, name: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Schedule Type</label>
                  <select
                    value={editingJob.schedule.kind}
                    onChange={(e) => setEditingJob({
                      ...editingJob, 
                      schedule: {...editingJob.schedule, kind: e.target.value as 'cron' | 'at' | 'every'}
                    })}
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="cron">Cron</option>
                    <option value="at">At</option>
                    <option value="every">Every</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">
                    {editingJob.schedule.kind === 'cron' ? 'Cron Expression' : 
                     editingJob.schedule.kind === 'at' ? 'Date/Time' : 'Interval (ms)'}
                  </label>
                  <input
                    type="text"
                    value={editingJob.schedule.expr || editingJob.schedule.at || editingJob.schedule.everyMs || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (editingJob.schedule.kind === 'cron') {
                        setEditingJob({...editingJob, schedule: {...editingJob.schedule, expr: val}})
                      } else if (editingJob.schedule.kind === 'at') {
                        setEditingJob({...editingJob, schedule: {...editingJob.schedule, at: val}})
                      } else {
                        setEditingJob({...editingJob, schedule: {...editingJob.schedule, everyMs: parseInt(val) || 0}})
                      }
                    }}
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Timezone</label>
                <input
                  type="text"
                  value={editingJob.schedule.tz || ''}
                  onChange={(e) => setEditingJob({
                    ...editingJob, 
                    schedule: {...editingJob.schedule, tz: e.target.value}
                  })}
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Message</label>
                <textarea
                  value={editingJob.payload.message || ''}
                  onChange={(e) => setEditingJob({
                    ...editingJob, 
                    payload: {...editingJob.payload, message: e.target.value}
                  })}
                  rows={6}
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 font-mono"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingJob.enabled}
                  onChange={(e) => setEditingJob({...editingJob, enabled: e.target.checked})}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="enabled" className="text-sm text-neutral-300">Enabled</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading === editingJob.id}
                  className="flex-1 px-4 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === editingJob.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
