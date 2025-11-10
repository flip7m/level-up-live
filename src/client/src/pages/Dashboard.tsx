import { useLiveState } from '../hooks/useLiveState'

export function Dashboard() {
  const { currentLevel, currentXP, nextLevelXP, progress, isLive } = useLiveState()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-100 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-primary-400 mb-4">Status</h2>
          <div className="text-2xl font-bold text-primary-100">
            {isLive ? '🔴 Live' : '⚫ Offline'}
          </div>
        </div>

        {/* Current Level Card */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-primary-400 mb-4">Current Level</h2>
          <div className="text-4xl font-bold text-accent-pink">{currentLevel}</div>
          <p className="text-primary-300 text-sm mt-2">Level {currentLevel}</p>
        </div>

        {/* XP Progress Card */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-primary-400 mb-4">XP Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-200">{currentXP}</span>
              <span className="text-primary-300">/ {nextLevelXP}</span>
            </div>
            <div className="w-full bg-surface-darker rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-accent-pink to-primary-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="mt-8 space-y-6">
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Recent Activity</h2>
          <p className="text-primary-400 text-sm">Activity log will appear here...</p>
        </div>

        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Metrics Overview</h2>
          <p className="text-primary-400 text-sm">Metrics charts will appear here...</p>
        </div>
      </div>
    </div>
  )
}
