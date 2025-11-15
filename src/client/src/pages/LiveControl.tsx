import { useLiveState } from '../hooks/useLiveState'
import { NowPlaying } from '../components/audio/NowPlaying'
import { XPBar } from '../components/xp/XPBar'
import { LevelIndicator } from '../components/xp/LevelIndicator'
import { XPTestControls } from '../components/xp/XPTestControls'
import { EventPanel } from '../components/event/EventPanel'
import { StreamControl } from '../components/stream/StreamControl'

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

          {/* Stream Control */}
          <StreamControl />

          {/* Test Controls */}
          <XPTestControls />
        </div>
      </div>
    </div>
  )
}
