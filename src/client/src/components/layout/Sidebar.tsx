import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  label: string
  icon: string
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: '🏠', path: '/' },
  { label: 'Playlist', icon: '🎵', path: '/playlist' },
  { label: 'Level Editor', icon: '🎮', path: '/editor' },
  { label: 'Event Editor', icon: '✨', path: '/events' },
  { label: 'Live Control', icon: '🎚️', path: '/live' },
  { label: 'Metrics', icon: '📊', path: '/metrics' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-surface-dark border-r border-primary-900 p-4 flex flex-col">
      <div className="mb-8 p-4 bg-surface-light rounded-lg">
        <h2 className="text-sm font-bold text-primary-100">v0.1.0</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-surface-light'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-primary-900 text-xs text-primary-400 text-center">
        <p>Level Up Live</p>
        <p>Sistema de Live Musical</p>
      </div>
    </aside>
  )
}
