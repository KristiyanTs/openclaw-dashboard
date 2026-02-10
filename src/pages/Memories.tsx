import { useEffect, useState } from 'react'
import { 
  FileText, 
  Calendar, 
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
      const healthy = await api.healthCheck()
      setIsConnected(healthy)
      
      if (!healthy) {
        setError('Cannot connect to OpenClaw. Make sure it\'s running on localhost:3000')
        setIsLoading(false)
        return
      }

      const filesData = await api.getMemoryFiles()
      setFiles(filesData)
      
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
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading memory files...</p>
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
            onClick={fetchFiles}
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
            <h1 className="text-2xl font-bold text-white mb-1">Memories</h1>
            <p className="text-neutral-500 text-sm">Browse and manage your agent's memory files</p>
          </div>
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

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          type="text"
          placeholder="Search memory files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 pl-11 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
        />
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* File List */}
        <div className="bg-neutral-900 border border-neutral-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Files</h2>
            <button 
              onClick={fetchFiles}
              className="p-1.5 hover:bg-neutral-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {files.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-600 text-sm">No memory files found</p>
              </div>
            ) : (
              <>
                {mainFiles.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider px-3 py-1.5">
                      Main Memory
                    </p>
                    {mainFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          selectedFile?.path === file.path
                            ? 'bg-green-950/30 border-l-2 border-green-500'
                            : 'hover:bg-neutral-800 border-l-2 border-transparent'
                        }`}
                      >
                        <FileText className={`w-4 h-4 ${
                          selectedFile?.path === file.path ? 'text-green-500' : 'text-neutral-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            selectedFile?.path === file.path ? 'text-green-400' : 'text-neutral-300'
                          }`}>
                            {file.name}
                          </p>
                          <p className="text-xs text-neutral-600">{formatBytes(file.size)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {dailyFiles.length > 0 && (
                  <div className="p-2 border-t border-neutral-800">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider px-3 py-1.5">
                      Daily Memories
                    </p>
                    {dailyFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          selectedFile?.path === file.path
                            ? 'bg-green-950/30 border-l-2 border-green-500'
                            : 'hover:bg-neutral-800 border-l-2 border-transparent'
                        }`}
                      >
                        <Calendar className={`w-4 h-4 ${
                          selectedFile?.path === file.path ? 'text-green-500' : 'text-neutral-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            selectedFile?.path === file.path ? 'text-green-400' : 'text-neutral-300'
                          }`}>
                            {file.name}
                          </p>
                          <p className="text-xs text-neutral-600">{formatBytes(file.size)} · {file.date}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* File Content */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-green-500" />
                  <div>
                    <h2 className="text-sm font-medium text-white">{selectedFile.name}</h2>
                    <p className="text-xs text-neutral-600">
                      {selectedFile.path} · {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFileSelect(selectedFile)}
                  className="p-1.5 hover:bg-neutral-800 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {isContentLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 text-green-500 animate-spin" />
                  </div>
                ) : (
                  <pre className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {content}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-neutral-800 mx-auto mb-3" />
                <p className="text-neutral-600 text-sm">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
