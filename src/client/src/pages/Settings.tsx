export function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-100 mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* XP Rates */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">XP Rates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Audio Drop XP
              </label>
              <input
                type="number"
                defaultValue="2"
                className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Audio Build Up XP
              </label>
              <input
                type="number"
                defaultValue="1"
                className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Audio Sensitivity */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Audio Sensitivity</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Drop Detection Sensitivity
              </label>
              <input
                type="range"
                min="1"
                max="100"
                defaultValue="50"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Energy Threshold
              </label>
              <input
                type="range"
                min="1"
                max="100"
                defaultValue="50"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Paths */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Paths</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Scenes Folder
              </label>
              <input
                type="text"
                placeholder="/assets/scenes"
                className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Sounds Folder
              </label>
              <input
                type="text"
                placeholder="/assets/sounds"
                className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Music Folder
              </label>
              <input
                type="text"
                placeholder="/assets/music"
                className="w-full px-4 py-2 bg-surface-darker border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
          Save Settings
        </button>
      </div>
    </div>
  )
}
