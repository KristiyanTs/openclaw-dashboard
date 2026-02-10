import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Home, BookOpen, Terminal, Settings, Activity } from 'lucide-react'
import HomePage from './pages/Home'
import MemoriesPage from './pages/Memories'
import './index.css'

function Sidebar() {
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">OpenClaw</h1>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/memories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
            }`
          }
        >
          <BookOpen className="w-4 h-4" />
          <span>Memories</span>
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
            }`
          }
          onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}
        >
          <Activity className="w-4 h-4" />
          <span>Activity</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
            }`
          }
          onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <div className="text-xs text-neutral-600">
          <p className="uppercase tracking-wider mb-1">Connected to</p>
          <p className="text-green-500 font-mono">localhost:3000</p>
        </div>
      </div>
    </aside>
  )
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-neutral-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
