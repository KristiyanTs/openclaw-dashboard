import { useEffect, useState } from 'react'
import { 
  FileText, 
  Calendar, 
  Clock, 
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react'

interface MemoryFile {
  name: string
  path: string
  type: 'main' | 'daily'
  date?: string
  size?: string
  lastModified?: string
}

// Mock data - in real implementation, this would fetch from OpenClaw API
// fetch('http://localhost:3000/api/memories')
const mockMemoryFiles: MemoryFile[] = [
  {
    name: 'MEMORY.md',
    path: '/memory/MEMORY.md',
    type: 'main',
    size: '12.4 KB',
    lastModified: '2026-02-10'
  },
  {
    name: '2026-02-10.md',
    path: '/memory/2026-02-10.md',
    type: 'daily',
    date: '2026-02-10',
    size: '4.2 KB',
    lastModified: '2026-02-10'
  },
  {
    name: '2026-02-09.md',
    path: '/memory/2026-02-09.md',
    type: 'daily',
    date: '2026-02-09',
    size: '3.8 KB',
    lastModified: '2026-02-09'
  },
  {
    name: '2026-02-08.md',
    path: '/memory/2026-02-08.md',
    type: 'daily',
    date: '2026-02-08',
    size: '5.1 KB',
    lastModified: '2026-02-08'
  },
  {
    name: '2026-02-07.md',
    path: '/memory/2026-02-07.md',
    type: 'daily',
    date: '2026-02-07',
    size: '2.9 KB',
    lastModified: '2026-02-07'
  },
  {
    name: '2026-02-06.md',
    path: '/memory/2026-02-06.md',
    type: 'daily',
    date: '2026-02-06',
    size: '4.5 KB',
    lastModified: '2026-02-06'
  },
  {
    name: '2026-02-05.md',
    path: '/memory/2026-02-05.md',
    type: 'daily',
    date: '2026-02-05',
    size: '3.2 KB',
    lastModified: '2026-02-05'
  }
]

const mockMemoryContent = `# MEMORY.md

## User Profile

**Name:** Kristiyan
**Profession:** Developer (React, Node, Next, Python, JS)
**Education:** University of Edinburgh (Honors, 2019)
**Location:** Bulgaria

## Preferences

- **Hardware:** Planning to buy Mac Mini Pro (M4) for local AI hosting
- **Morning Brief:** 08:00 AM daily (Tech, Markets, History Fact)
- **Philosophy:** Determinism

## Active Projects

### ClawFor.biz
- OpenClaw consultancy website
- 13 blog posts published
- $20 setup, $25/hr consulting

### Bookwiz.io
- AI writing platform (co-founder)
- 55,000+ authors
- Supabase backend

## Important Dates

- **Feb 28, 2026:** 30th Birthday
- **June 2026:** The Weeknd Concert (Munich)

## Contacts

- **Nicole:** Girlfriend (Aug 18, 2003)
- **Velin:** Best friend (Jul 2, 1996)
- **Lyubo:** Best friend (Sep 17, 1996)

Last updated: 2026-02-10
`

export default function MemoriesPage() {
  const [files, setFiles] = useState<MemoryFile[]>(mockMemoryFiles)
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(mockMemoryFiles[0])
  const [content, setContent] = useState<string>(mockMemoryContent)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // In real implementation, fetch from OpenClaw
  useEffect(() => {
    // fetch('http://localhost:3000/api/memories')
    //   .then(res => res.json())
    //   .then(data => setFiles(data))
  }, [])

  const handleFileSelect = (file: MemoryFile) => {
    setIsLoading(true)
    setSelectedFile(file)
    
    // Simulate API call to fetch file content
    // fetch(\`http://localhost:3000/api/memories/\${file.path}\`)
    setTimeout(() => {
      setContent(generateMockContent(file))
      setIsLoading(false)
    }, 300)
  }

  const generateMockContent = (file: MemoryFile): string => {
    if (file.name === 'MEMORY.md') {
      return mockMemoryContent
    }
    
    return `# ${file.name}

## Daily Log - ${file.date}

### Morning
- Checked emails and calendar
- Reviewed overnight agent activity
- Updated project priorities

### Afternoon
- Client meetings
- Code reviews
- Documentation updates

### Evening
- Agent optimization
- Memory consolidation
- Planning for tomorrow

### Key Learnings
- New automation opportunities identified
- Client feedback incorporated
- System performance improved

---

Last updated: ${file.lastModified}
`
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const dailyFiles = filteredFiles.filter(f => f.type === 'daily')
  const mainFiles = filteredFiles.filter(f => f.type === 'main')

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Memories</h1>
        <p className="text-slate-400">Browse and manage your agent's memory files</p>
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
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
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
                      <p className="text-xs text-slate-500">{file.size}</p>
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
                      <p className="text-xs text-slate-500">{file.size} · {file.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                ))}
              </div>
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
                      {selectedFile.path} · {selectedFile.size} · Modified {selectedFile.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm rounded-lg transition-colors">
                    Download
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
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
