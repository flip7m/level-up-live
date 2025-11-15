import { useLiveState } from '../../hooks/useLiveState'

export function Header() {
  const { isLive } = useLiveState()

  return (
    <header className="bg-surface-light border-b border-primary-900 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <span className="text-sm text-primary-200">
          {isLive ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-lighter rounded-lg transition-colors">
          ⚙️
        </button>
      </div>
    </header>
  )
}
