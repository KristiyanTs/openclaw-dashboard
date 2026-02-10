import { useEffect, useState } from 'react'
import { 
  FileText, 
  Calendar, 
  ChevronRight,
  Search,
  RefreshCw,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { api, type MemoryFile } from '../api'

export default function MemoriesPage() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null)
  const [content, setContent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchFiles = async () => {
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

      const filesData = await api.getMemoryFiles()
      setFiles(filesData)
      
      // Auto-select first file if none selected
      if (filesData.length > 0 && !selectedFile) {
        handleFileSelect(filesData[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (file: MemoryFile) => {
    setIsContentLoading(true)
    setSelectedFile(file)
    
    try {
      const fileContent = await api.getMemoryFile(file.path)
      setContent(fileContent)
    } catch (err) {
      setContent(`Error loading file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsContentLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const dailyFiles = filteredFiles.filter(f => f.type === 'daily')
  const mainFiles = filteredFiles.filter(f => f.type === 'main')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading memory files...</p>
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
            onClick={fetchFiles}
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
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Memories</h1>
            <p className="text-slate-400">Browse and manage your agent's memory files</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search memory files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
        />
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* File List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Files</h2>
            <button 
              onClick={fetchFiles}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {files.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">No memory files found</p>
              </div>
            ) : (
              <>
                {/* Main Memory File */}
                {mainFiles.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                      Main Memory
                    </p>
                    {mainFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                          selectedFile?.path === file.path
                            ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                            : 'hover:bg-slate-800 border-l-2 border-transparent'
                        }`}
                      >
                        <FileText className={`w-5 h-5 ${
                          selectedFile?.path === file.path ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            selectedFile?.path === file.path ? 'text-emerald-400' : 'text-slate-200'
                          }`}>
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Daily Memory Files */}
                {dailyFiles.length > 0 && (
                  <div className="p-2 border-t border-slate-800">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                      Daily Memories
                    </p>
                    {dailyFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                          selectedFile?.path === file.path
                            ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                            : 'hover:bg-slate-800 border-l-2 border-transparent'
                        }`}
                      >
                        <Calendar className={`w-5 h-5 ${
                          selectedFile?.path === file.path ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            selectedFile?.path === file.path ? 'text-emerald-400' : 'text-slate-200'
                          }`}>
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">{formatBytes(file.size)} · {file.date}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* File Content */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="font-semibold text-white">{selectedFile.name}</h2>
                    <p className="text-xs text-slate-500">
                      {selectedFile.path} · {formatBytes(selectedFile.size)} · Modified {selectedFile.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleFileSelect(selectedFile)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {isContentLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                ) : (
                  <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {content}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
