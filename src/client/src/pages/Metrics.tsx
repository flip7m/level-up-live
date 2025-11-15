export function Metrics() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-100 mb-8">Metrics Dashboard</h1>

      <div className="space-y-6">
        {/* Session Selector */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Select Session</h2>
          <select className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500">
            <option>Select a past session...</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Total XP', 'Final Level', 'Duration', 'Events Triggered'].map((stat) => (
            <div key={stat} className="bg-surface-light border border-primary-900 rounded-lg p-6">
              <p className="text-primary-400 text-sm mb-2">{stat}</p>
              <p className="text-3xl font-bold text-primary-100">—</p>
            </div>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Charts & Timeline</h2>
          <div className="space-y-4">
            <div className="h-64 bg-surface-darker rounded-lg flex items-center justify-center">
              <p className="text-primary-400">Chart 1: XP Over Time</p>
            </div>
            <div className="h-64 bg-surface-darker rounded-lg flex items-center justify-center">
              <p className="text-primary-400">Chart 2: Events by Type</p>
            </div>
            <div className="h-64 bg-surface-darker rounded-lg flex items-center justify-center">
              <p className="text-primary-400">Chart 3: Timeline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
