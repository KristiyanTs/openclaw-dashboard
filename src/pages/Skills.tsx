import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { 
  Puzzle, 
  RefreshCw,
  WifiOff,
  AlertCircle,
  Trash2,
  Edit3,
  X,
  Check,
  ArrowLeft,
  FileText,
  Folder,
  User,
  Package,
  Eye,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Key,
  FileJson,
  Terminal
} from 'lucide-react'
import { api, type Skill, type SkillDetail } from '../api'

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [skillDetail, setSkillDetail] = useState<SkillDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [activeTab, setActiveTab] = useState<'docs' | 'setup'>('docs')

  const fetchSkills = async () => {
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

      const skillsData = await api.getSkills()
      // Sort: active first, then by type (custom first), then alphabetically
      skillsData.sort((a: Skill, b: Skill) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        if (a.type === 'custom' && b.type !== 'custom') return -1
        if (a.type !== 'custom' && b.type === 'custom') return 1
        return a.name.localeCompare(b.name)
      })
      setSkills(skillsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const viewSkill = async (skill: Skill) => {
    setActionLoading(skill.id)
    try {
      const data = await api.getSkill(skill.id)
      setSelectedSkill(skill)
      setSkillDetail(data)
      setEditContent(data.content)
      setActiveTab(skill.status === 'active' ? 'setup' : 'docs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skill')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSkill = async (skill: Skill, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (skill.type !== 'custom') {
      alert('Cannot delete built-in skills')
      return
    }
    if (!confirm(`Delete skill "${skill.name}"?\n\nThis cannot be undone.`)) {
      return
    }
    setActionLoading(skill.id)
    try {
      await api.deleteSkill(skill.id)
      await fetchSkills()
      if (selectedSkill?.id === skill.id) {
        setSelectedSkill(null)
        setSkillDetail(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill')
    } finally {
      setActionLoading(null)
    }
  }

  const saveSkill = async () => {
    if (!selectedSkill || selectedSkill.type !== 'custom') return
    
    setActionLoading(selectedSkill.id)
    try {
      await api.updateSkill(selectedSkill.id, editContent)
      await viewSkill(selectedSkill)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const activeSkills = skills.filter(s => s.status === 'active')
  const setupSkills = skills.filter(s => s.status === 'needs-setup')
  const inactiveSkills = skills.filter(s => s.status === 'inactive')

  const getStatusIcon = (skill: Skill) => {
    if (skill.status === 'active') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    } else if (skill.status === 'needs-setup') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getPuzzleIconClass = (skill: Skill) => {
    if (skill.status === 'active') {
      return 'bg-green-950/30 border-green-800 text-green-400'
    } else if (skill.status === 'needs-setup') {
      return 'bg-yellow-950/30 border-yellow-800 text-yellow-400'
    } else if (skill.status === 'inactive') {
      return 'bg-red-950/30 border-red-800 text-red-400'
    } else {
      // Default fallback - use neutral colors
      return 'bg-neutral-800 border-neutral-700 text-neutral-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading skills...</p>
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
            onClick={fetchSkills}
            className="px-6 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Skill Detail View
  if (selectedSkill && skillDetail) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedSkill(null)
                  setSkillDetail(null)
                  setIsEditing(false)
                }}
                className="p-2 hover:bg-neutral-800 transition-colors text-neutral-400"
                title="Back to skills"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center border ${getPuzzleIconClass(selectedSkill)}`}>
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">{selectedSkill.name}</h1>
                  {selectedSkill.type === 'custom' && (
                    <span className="text-xs px-2 py-0.5 border bg-blue-950/30 border-blue-800 text-blue-400">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-sm font-mono mt-0.5">
                  {selectedSkill.path}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedSkill.type === 'custom' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {selectedSkill.type === 'custom' && isEditing && (
                <>
                  <button
                    onClick={saveSkill}
                    disabled={actionLoading === selectedSkill.id}
                    className="px-4 py-2 bg-green-500 text-black font-medium hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(skillDetail.content)
                    }}
                    className="px-4 py-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              {selectedSkill.type === 'custom' && !isEditing && (
                <button
                  onClick={(e) => deleteSkill(selectedSkill, e)}
                  disabled={actionLoading === selectedSkill.id}
                  className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neutral-800 mb-4">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'docs' 
                ? 'text-green-400 border-b-2 border-green-500' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'setup' 
                ? 'text-green-400 border-b-2 border-green-500' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Setup & Configuration
            {selectedSkill.setupDetails && selectedSkill.setupDetails.length > 0 && (
              <span className="bg-green-950/30 text-green-400 text-xs px-2 py-0.5 rounded">
                {selectedSkill.setupDetails.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'docs' ? (
            <div className="bg-neutral-900 border border-neutral-800 h-full">
              <div className="p-6">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[calc(100vh-280px)] bg-neutral-950 border border-neutral-800 p-4 text-neutral-300 font-mono text-sm resize-none focus:outline-none focus:border-green-500"
                  />
                ) : skillDetail.content ? (
                  <div 
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: marked.parse(skillDetail.content, { gfm: true }) }}
                  />
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <FileText className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p>No SKILL.md documentation</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="bg-neutral-900 border border-neutral-800 p-4">
                <h3 className="text-sm font-medium text-white mb-3">Status</h3>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedSkill)}
                  <div>
                    <p className={`font-medium ${
                      selectedSkill.status === 'active' ? 'text-green-400' :
                      selectedSkill.status === 'needs-setup' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedSkill.status === 'active' ? 'Active' :
                       selectedSkill.status === 'needs-setup' ? 'Needs Setup' : 'Inactive'}
                    </p>
                    {selectedSkill.statusReason && (
                      <p className="text-sm text-neutral-500">{selectedSkill.statusReason}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Setup Details */}
              {selectedSkill.setupDetails && selectedSkill.setupDetails.length > 0 ? (
                selectedSkill.setupDetails.map((detail: any, i: number) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 p-4">
                    {detail.type === 'credentials' && (
                      <>
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Key className="w-4 h-4 text-neutral-500" />
                          Credentials
                        </h3>
                        <p className="text-sm text-neutral-400 mb-2">Location: {detail.location}</p>
                        <div className="space-y-1">
                          {detail.files.map((file: string, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
                              <FileText className="w-3.5 h-3.5 text-neutral-600" />
                              {file}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {detail.type === 'env' && (
                      <>
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-neutral-500" />
                          Environment Variables
                        </h3>
                        <div className="space-y-1">
                          {detail.variables.map((variable: string, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-green-400 font-mono">{variable}</span>
                              <span className="text-neutral-500">is set</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {detail.type === 'config' && (
                      <>
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-neutral-500" />
                          Configuration Files
                        </h3>
                        <div className="space-y-1">
                          {detail.files.map((file: string, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
                              <Folder className="w-3.5 h-3.5 text-neutral-600" />
                              ~/.{file}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                  <p className="text-neutral-500">No configuration detected</p>
                  <p className="text-sm text-neutral-600 mt-2">
                    This skill may not require setup, or configuration is stored elsewhere.
                  </p>
                </div>
              )}

              {/* Binaries Check */}
              {selectedSkill.binariesOk === false && selectedSkill.missingBinaries && (
                <div className="bg-red-950/20 border border-red-800 p-4">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Missing Binaries</h3>
                  <div className="space-y-1">
                    {selectedSkill.missingBinaries.map((bin: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-400 font-mono">{bin}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Skills List View
  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Skills</h1>
            <p className="text-neutral-500 text-sm">
              {skills.length} total · {activeSkills.length} active · {setupSkills.length} need setup
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSkills}
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

      {/* Skills Grid - All skills sorted by status */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer group"
              onClick={() => viewSkill(skill)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center border ${getPuzzleIconClass(skill)}`}>
                  {skill.status === 'active' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Puzzle className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white truncate">{skill.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {skill.type === 'custom' ? (
                      <span className="text-xs text-blue-400">Custom</span>
                    ) : (
                      <span className="text-xs text-neutral-500">Built-in</span>
                    )}
                  </div>
                </div>
                {skill.type === 'custom' && (
                  <button
                    onClick={(e) => deleteSkill(skill, e)}
                    disabled={actionLoading === skill.id}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-950/30 text-neutral-500 hover:text-red-400 transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {skill.status !== 'active' && skill.statusReason && (
                <p className="mt-2 text-xs text-neutral-500 truncate">{skill.statusReason}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
