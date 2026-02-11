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

// Known CLI tools and their standard config locations
// This supplements backend detection which may miss ~/.config/ locations
const CLI_CONFIG_PATHS: Record<string, { paths: string[]; setupCommand?: string; checkCommand?: string }> = {
  gog: {
    paths: ['~/.config/gogcli/', '~/.config/gogcli/config.json'],
    setupCommand: 'gog login',
    checkCommand: 'gog --help'
  },
  gh: {
    paths: ['~/.config/gh/', '~/.config/gh/hosts.yml'],
    setupCommand: 'gh auth login',
    checkCommand: 'gh auth status'
  },
  aws: {
    paths: ['~/.aws/', '~/.aws/credentials', '~/.aws/config'],
    setupCommand: 'aws configure',
    checkCommand: 'aws configure list'
  },
  docker: {
    paths: ['~/.docker/'],
    checkCommand: 'docker info'
  },
  kubectl: {
    paths: ['~/.kube/', '~/.kube/config'],
    checkCommand: 'kubectl config current-context'
  },
  spotify: {
    paths: ['~/.config/spotify/']
  },
  'spotify-player': {
    paths: ['~/.config/spotify-player/']
  }
}

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
      // Sort: configured first, then needs-setup, then inactive. Within each group, custom first, then alphabetically
      skillsData.sort((a: Skill, b: Skill) => {
        // Helper to determine effective status
        const getStatusPriority = (s: Skill): number => {
          if (s.status === 'inactive') return 2
          if (s.status === 'active') {
            // Check if actually configured
            if (s.setupDetails && s.setupDetails.length > 0) return 0
            if (s.hasCredentials) return 0
            if (s.type === 'custom') return 0
            return 1 // claims active but no config detected
          }
          return 1 // needs-setup
        }

        // First sort by effective status: active > needs-setup > inactive
        const statusDiff = getStatusPriority(a) - getStatusPriority(b)
        if (statusDiff !== 0) return statusDiff

        // Within same status, sort by type: custom first
        if (a.type === 'custom' && b.type !== 'custom') return -1
        if (a.type !== 'custom' && b.type === 'custom') return 1

        // Finally sort alphabetically
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
      setActiveTab(getEffectiveStatus(skill) === 'needs-setup' ? 'setup' : 'docs')
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

  // Helper to determine if a skill is truly configured
  // Backend may report 'active' even when no config is detected
  const isTrulyConfigured = (skill: Skill): boolean => {
    if (skill.status !== 'active') return false
    // If it has setup details or credentials, it's actually configured
    if (skill.setupDetails && skill.setupDetails.length > 0) return true
    if (skill.hasCredentials) return true
    // Built-in skills that report active but have no config detected are likely false positives
    // Only custom skills with no config can be truly "active" (they may not need config)
    return skill.type === 'custom'
  }

  const getEffectiveStatus = (skill: Skill): 'active' | 'needs-setup' | 'inactive' => {
    if (skill.status === 'inactive') return 'inactive'
    if (isTrulyConfigured(skill)) return 'active'
    return 'needs-setup'
  }

  const activeSkills = skills.filter(s => getEffectiveStatus(s) === 'active')
  const setupSkills = skills.filter(s => getEffectiveStatus(s) === 'needs-setup')
  const inactiveSkills = skills.filter(s => s.status === 'inactive')

  // Get CLI config info for a skill
  const getCliConfigInfo = (skill: Skill) => {
    return CLI_CONFIG_PATHS[skill.id] || CLI_CONFIG_PATHS[skill.name.toLowerCase()]
  }

  const getStatusIcon = (skill: Skill) => {
    const status = getEffectiveStatus(skill)
    if (status === 'active') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    } else if (status === 'needs-setup') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getPuzzleIconClass = (skill: Skill) => {
    const status = getEffectiveStatus(skill)
    if (status === 'active') {
      return 'bg-green-950/30 border-green-800 text-green-400'
    } else if (status === 'needs-setup') {
      return 'bg-yellow-950/30 border-yellow-800 text-yellow-400'
    } else if (status === 'inactive') {
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
                ? getEffectiveStatus(selectedSkill) === 'needs-setup'
                  ? 'text-yellow-400 border-b-2 border-yellow-500'
                  : 'text-green-400 border-b-2 border-green-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Setup & Configuration
            {getEffectiveStatus(selectedSkill) === 'needs-setup' ? (
              <span className="bg-yellow-950/30 text-yellow-400 text-xs px-2 py-0.5 rounded">
                Action needed
              </span>
            ) : selectedSkill.setupDetails && selectedSkill.setupDetails.length > 0 ? (
              <span className="bg-green-950/30 text-green-400 text-xs px-2 py-0.5 rounded">
                {selectedSkill.setupDetails.length}
              </span>
            ) : null}
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
                      getEffectiveStatus(selectedSkill) === 'active' ? 'text-green-400' :
                      getEffectiveStatus(selectedSkill) === 'needs-setup' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {getEffectiveStatus(selectedSkill) === 'active' ? 'Active' :
                       getEffectiveStatus(selectedSkill) === 'needs-setup' ? 'Needs Setup' : 'Inactive'}
                    </p>
                    {selectedSkill.statusReason && (
                      <p className="text-sm text-neutral-500">{selectedSkill.statusReason}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration Required Section */}
              {getEffectiveStatus(selectedSkill) === 'needs-setup' && (
                <div className="bg-yellow-950/20 border border-yellow-800 p-4">
                  <h3 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Configuration Required
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {selectedSkill.statusReason || 'This skill requires configuration before it can be used. Check the Documentation tab for setup instructions.'}
                  </p>
                </div>
              )}

              {/* Setup Instructions from SKILL.md */}
              {skillDetail.setupInstructions && (
                <div className="bg-neutral-900 border border-neutral-800 p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    Setup Instructions
                  </h3>
                  <div 
                    className="markdown-body text-sm"
                    dangerouslySetInnerHTML={{ __html: marked.parse(skillDetail.setupInstructions, { gfm: true }) }}
                  />
                </div>
              )}

              {/* Detected Configuration */}
              {selectedSkill.setupDetails && selectedSkill.setupDetails.length > 0 && (
                <div className="border-t border-neutral-800 pt-4">
                  <h3 className="text-sm font-medium text-white mb-3">Detected Configuration</h3>
                  <div className="space-y-3">
                    {selectedSkill.setupDetails.map((detail: any, i: number) => (
                      <div key={i} className="bg-neutral-900 border border-neutral-800 p-4">
                        {detail.type === 'credentials' && (
                          <>
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Key className="w-4 h-4 text-neutral-500" />
                              Credentials
                            </h4>
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
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-neutral-500" />
                              Environment Variables
                            </h4>
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
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <FileJson className="w-4 h-4 text-neutral-500" />
                              Configuration Files
                            </h4>
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
                    ))}
                  </div>
                </div>
              )}

              {/* CLI Tool Config Locations */}
              {getCliConfigInfo(selectedSkill) && (
                <div className="bg-neutral-900 border border-neutral-800 p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-neutral-500" />
                    CLI Configuration Location
                  </h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    This tool manages its own configuration in standard CLI locations:
                  </p>
                  <div className="space-y-2 mb-4">
                    {getCliConfigInfo(selectedSkill)?.paths.map((path: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
                        <FileText className="w-3.5 h-3.5 text-neutral-600" />
                        {path}
                      </div>
                    ))}
                  </div>
                  {getCliConfigInfo(selectedSkill)?.setupCommand && (
                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded">
                      <p className="text-xs text-neutral-500 mb-1">Run this command to set up:</p>
                      <code className="text-sm text-green-400 font-mono">
                        {getCliConfigInfo(selectedSkill)?.setupCommand}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state when no config detected and no instructions */}
              {(!selectedSkill.setupDetails || selectedSkill.setupDetails.length === 0) && !skillDetail.setupInstructions && !getCliConfigInfo(selectedSkill) && (
                <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                  <p className="text-neutral-500">No configuration detected</p>
                  <p className="text-sm text-neutral-600 mt-2">
                    Check the Documentation tab for setup instructions, or this skill may not require configuration.
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
                  {getEffectiveStatus(skill) === 'active' ? (
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
              {getEffectiveStatus(skill) !== 'active' && (
                <p className="mt-2 text-xs text-neutral-500 truncate">
                  {skill.statusReason || 'Configuration required'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
