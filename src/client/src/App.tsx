import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { PlaylistManager } from './pages/PlaylistManager'
import { LevelEditor } from './pages/LevelEditor'
import { EventEditor } from './pages/EventEditor'
import { LiveControl } from './pages/LiveControl'
import { Metrics } from './pages/Metrics'
import { Settings } from './pages/Settings'
import { useWebSocket } from './hooks/useWebSocket'
import { AudioManager } from './components/audio/AudioManager'

function App() {
  // Initialize WebSocket connection
  const socket = useWebSocket()

  useEffect(() => {
    console.log('App mounted, WebSocket:', socket?.id)
  }, [socket])

  return (
    <BrowserRouter>
      {/* AudioManager persists across all pages - handles music + SFX */}
      <AudioManager />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/playlist" element={<PlaylistManager />} />
          <Route path="/editor" element={<LevelEditor />} />
          <Route path="/events" element={<EventEditor />} />
          <Route path="/live" element={<LiveControl />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
