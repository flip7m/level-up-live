import { useLiveState } from '../hooks/useLiveState'
import { NowPlaying } from '../components/audio/NowPlaying'
import { XPBar } from '../components/xp/XPBar'
import { LevelIndicator } from '../components/xp/LevelIndicator'
import { XPTestControls } from '../components/xp/XPTestControls'
import { EventPanel } from '../components/event/EventPanel'

export function LiveControl() {
  const { isLive, startLive, stopLive } = useLiveState()

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Main Audio & Visualizations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Now Playing */}
          <NowPlaying />

          {/* Event Panel */}
          <EventPanel />
        </div>

        {/* XP System Sidebar */}
        <div className="space-y-4">
          {/* Level Indicator */}
          <LevelIndicator />

          {/* XP Progress Bar */}
          <XPBar />

          {/* Start/Stop Live */}
          <button
            onClick={isLive ? stopLive : startLive}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-lg ${
              isLive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLive ? '⏹️ Parar Live' : '🔴 Iniciar Live'}
          </button>

          {/* Test Controls */}
          <XPTestControls />
        </div>
      </div>
    </div>
  )
}
