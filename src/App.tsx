import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Home, BookOpen, Terminal, Settings, Activity } from 'lucide-react'
import HomePage from './pages/Home'
import MemoriesPage from './pages/Memories'
import './index.css'

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-r border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Terminal className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">OpenClaw</h1>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/memories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">Memories</span>
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`
          }
          onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Activity</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`
          }
          onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          <p>Connected to:</p>
          <p className="text-emerald-400 font-mono">localhost:3000</p>
        </div>
      </div>
    </aside>
  )
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950">
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
