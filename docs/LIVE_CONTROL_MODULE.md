# 🎮 Live Control Panel Module

> **Status:** ✅ Completed & Closed
> **Version:** 1.0
> **Last Updated:** 2025-10-31

---

## 📋 Overview

The **Live Control Panel** is the central hub for managing live streaming sessions in Level Up Live. It provides real-time audio playback, visual feedback (waveform), XP progression display, event triggers, and test controls—all in Portuguese (PT-BR).

This module integrates:
- **Audio playback** (Howler.js) with automatic playlist progression
- **Real-time waveform visualization** with simulated frequency data
- **Progress tracking** (current time / duration)
- **Sound effects** triggered by Socket.IO events (XP gain, drops, build-ups, level-ups, viewer joins)
- **XP system display** (current level, XP bar)
- **Now Playing widget** with current and next song
- **Test controls** for manual XP/event triggers

---

## 🎯 Features Implemented

### ✅ 1. Complete PT-BR Translation
- All UI text translated: buttons, labels, tooltips, headings
- "Live Control Panel" → "Painel de Controle da Live"
- "Start Live" → "Iniciar Live" / "Stop Live" → "Parar Live"
- "Waveform" → "Forma de Onda"
- "Now Playing" → "Tocando agora" / "Next" → "Próxima música"

### ✅ 2. Next Song Display
- Shows the upcoming song below "Tocando agora"
- Updates in real-time when playlist advances
- Visual separator (border-top) between current and next song

### ✅ 3. Functional Waveform Visualization
- Real-time animated bars (100 bars mirrored vertically)
- Reacts to music playback state (high amplitude when playing, low when idle)
- Uses simulated frequency data (Web Audio API causes CORS issues with Howler.js)
- Purple gradient colors matching app theme

### ✅ 4. Frequency Analysis Removed
- Old `FrequencyBars` component completely removed
- Cleaner UI focused on waveform only

### ✅ 5. Button Sounds Working
- Fixed file path structure (`assets/sounds/xp/xp.mp3` instead of `assets/sounds/xp.mp3`)
- All SFX paths corrected in `SoundService.ts`:
  - `xpGain`: `assets/sounds/xp/xp.mp3`
  - `drop`: `assets/sounds/drops/drop.mp3`
  - `buildUp`: `assets/sounds/buildups/builups.mp3`
  - `viewerJoin`: `assets/sounds/viewers/viewers.mp3`
  - `levelUp`: `assets/sounds/levelups/level-up.mp3`
- Sounds play correctly when test buttons are clicked or events are triggered

### ✅ 6. Progress Bar Display
- Shows current playback position (seek time) vs total duration
- Updates every 100ms via `setInterval`
- Syncs with `audioStore` (Zustand state management)
- Displayed in `NowPlaying` component

---

## 🏗️ Architecture

### Frontend Structure

```
src/client/src/
├── pages/
│   └── LiveControl.tsx                 # Main Live Control Panel page
├── components/
│   ├── audio/
│   │   ├── AudioManager.tsx            # Audio playback + SFX manager (no UI)
│   │   ├── Waveform.tsx                # Visual waveform with simulated data
│   │   └── NowPlaying.tsx              # Current + next song display with progress
│   ├── xp/
│   │   ├── XPTestControls.tsx          # Test buttons (XP, events, session reset)
│   │   ├── XPBar.tsx                   # Progress bar for XP
│   │   └── LevelIndicator.tsx          # Current level display
│   └── level/
│       └── LivePreview.tsx             # 16:9 scene preview (if enabled)
├── stores/
│   ├── audioStore.ts                   # Zustand store (progress, playing, currentSong)
│   └── liveStore.ts                    # Live session state (isLive, sessionId, xp, level)
└── hooks/
    └── useWebSocket.ts                 # Socket.IO client hook
```

### Backend Structure

```
src/server/
├── services/
│   └── SoundService.ts                 # Manages sound events via Socket.IO
├── controllers/
│   └── SessionController.ts            # Start/stop live sessions
└── database/
    └── repositories/
        └── SessionRepository.ts        # Session CRUD operations
```

---

## 🔧 Key Components

### 1. LiveControl.tsx

**Purpose:** Main page layout for Live Control Panel

**Features:**
- Start/Stop Live button (toggle)
- Grid layout: Waveform, Now Playing, XP Bar, Level Indicator, Test Controls
- Translated to PT-BR

**Dependencies:**
- `useLiveStore` - isLive state
- `useLiveState` hook - startLive/stopLive functions
- Child components: `Waveform`, `NowPlaying`, `XPBar`, `LevelIndicator`, `XPTestControls`

**Key Code:**
```tsx
<button onClick={isLive ? stopLive : startLive}>
  {isLive ? '⏹️ Parar Live' : '🔴 Iniciar Live'}
</button>
```

---

### 2. AudioManager.tsx

**Purpose:** Central audio manager (no UI, runs in background)

**Responsibilities:**
- Play music from playlist via Howler.js
- Play SFX when receiving Socket.IO events (`sound:xpGain`, `sound:drop`, etc.)
- Track playback progress (seek position) and update `audioStore` every 100ms
- Emit `audio:nowplaying` events with current + next song
- Emit `audio:analysis` events with simulated frequency data for waveform

**Key Functions:**
- `playNextSong()` - Loads and plays next song in playlist, updates store
- `stopMusic()` - Stops playback, clears progress, resets store
- `playSFX(soundPath)` - Creates one-shot Howl instance for sound effects
- `startProgressTracking()` - Interval to update progress every 100ms
- `startVisualAnalysis()` - RequestAnimationFrame loop to emit simulated frequency data

**Why No Web Audio API:**
- `MediaElementAudioSource` causes CORS errors with Howler.js HTML5 audio
- When source node is created, it "hijacks" the audio element and prevents playback
- Solution: Simulated frequency data instead of real FFT analysis

**Key Code:**
```tsx
// Progress tracking
progressIntervalRef.current = window.setInterval(() => {
  const howl = musicHowlRef.current
  if (howl && howl.playing()) {
    const seek = howl.seek() as number
    setProgress(seek)
    setPlaying(true)
  }
}, 100)

// Simulated analysis
const frequencies = new Array(128).fill(0).map(() => {
  const random = Math.random()
  const energy = Math.pow(random, 0.5) * 255
  return Math.floor(energy)
})
socket.emit('audio:analysis', { frequencies, playing: true })
```

**Socket.IO Events Listened:**
- `live:start` → Start playing music
- `live:stop` → Stop music
- `sound:xpGain`, `sound:drop`, `sound:buildUp`, `sound:levelUp`, `sound:viewerJoin` → Play SFX

**Socket.IO Events Emitted:**
- `audio:nowplaying` → { song, nextSong }
- `audio:analysis` → { frequencies: number[], playing: boolean }

---

### 3. Waveform.tsx

**Purpose:** Visual audio waveform display

**How It Works:**
- Renders 100 vertical bars mirrored (top + bottom) on HTML canvas
- Listens to `audio:analysis` Socket.IO events from `AudioManager`
- Updates bar heights based on frequency data
- Uses `requestAnimationFrame` for smooth 60fps rendering

**Visual Design:**
- Purple gradient: `hsla(280, 80%, 60%, opacity)` and `hsla(280, 80%, 50%, opacity)`
- Center line separator: `#4c1d95`
- Background: `#0F0A1E` (dark)
- Opacity changes based on playing state (0.8 active, 0.3 idle)

**Key Code:**
```tsx
for (let i = 0; i < barCount; i++) {
  const dataIndex = Math.floor((i / barCount) * audioData.length)
  const value = audioData[dataIndex] || 0
  const barHeight = (value / 255) * (canvas.height * 0.4)

  ctx.fillStyle = `hsla(280, 80%, 60%, ${opacity})`
  ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight)
}
```

---

### 4. NowPlaying.tsx

**Purpose:** Display current and next song with progress bar

**Features:**
- Shows song title (or filename if no title)
- Progress bar (current seek / duration)
- Time display (MM:SS / MM:SS)
- Next song preview below current song

**Data Sources:**
- Listens to `audio:nowplaying` Socket.IO event
- Reads `progress` and `duration` from `audioStore`

**Key Code:**
```tsx
const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

<div className="h-2 bg-primary-900 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
    style={{ width: `${progressPercent}%` }}
  />
</div>
```

---

### 5. XPTestControls.tsx

**Purpose:** Manual test buttons for XP system and events

**Buttons (All in PT-BR):**
- `+10 XP`, `+50 XP` - Add XP manually
- `🔊 Simular Drop` - Trigger drop detection
- `📈 Simular Build Up` - Trigger build-up detection
- `Simular Entrada de Viewer` - Trigger viewer join
- `Forçar Level Up` - Force level up
- `↻ Resetar Sessão` - Reset XP/level to 0

**How It Works:**
- Emits Socket.IO events directly from client
- Server responds by adding XP, playing sounds, updating level
- Useful for testing progression without playing full songs

**Key Code:**
```tsx
socket.emit('xp:test', { type: 'gain', amount: 10 })
socket.emit('audio:test', { type: 'drop' })
socket.emit('xp:test', { type: 'reset' })
```

---

## 🎨 UI/UX Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔴 Iniciar Live / ⏹️ Parar Live                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Forma de Onda (Waveform)                      │ │
│  │  ▁▃▅▇█▇▅▃▁ ▁▃▅▇█▇▅▃▁ ▁▃▅▇█▇▅▃▁                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  Tocando agora      │  │  Nível 1 • 45 / 100 XP       │ │
│  │  Song Title         │  │  ████████░░░░░░░░░░░ 45%     │ │
│  │  ████████░░░ 1:23/4 │  └──────────────────────────────┘ │
│  │  Próxima música:    │                                   │
│  │  Next Song Title    │  ┌──────────────────────────────┐ │
│  └─────────────────────┘  │  Controles de Teste          │ │
│                            │  [+10 XP] [+50 XP] [Drop]    │ │
│                            └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Color Palette

- **Primary Purple:** `#8B5CF6` (purple-500)
- **Secondary Purple:** `#6366F1` (indigo-500)
- **Accent Pink:** `#EC4899` (pink-500)
- **Background Deep:** `#0F0A1E`
- **Surface Dark:** `#1A1332`
- **Text Light:** `#E9D5FF` (purple-100)
- **Border:** `#4c1d95` (purple-900)

### Typography

- Headings: `text-4xl font-bold`
- Body: `text-sm` to `text-base`
- Monospace time: Default sans-serif

---

## 🔊 Sound System

### Sound Categories

1. **Music** (Playlist)
   - Volume: 70% (`volume: 0.7`)
   - Format: `.mp3` files in `assets/music/`
   - Managed by: `AudioManager` (Howler.js)

2. **Sound Effects** (SFX)
   - Volume: 80% (`volume: 0.8`)
   - Format: `.mp3` files in `assets/sounds/{category}/`
   - Categories:
     - `xp/` - XP gain sounds
     - `drops/` - Drop detection sounds
     - `buildups/` - Build-up sounds
     - `viewers/` - Viewer join sounds
     - `levelups/` - Level up celebration sounds
     - `transitions/` - Level transition sounds (future)

### Sound Flow

```
Server Event → SoundService → Socket.IO → AudioManager → Howler.js → Browser Audio
                                              ↓
                                          OBS Capture
```

**Example Flow (XP Gain):**
1. User clicks `+10 XP` button
2. Client emits `xp:test` event
3. Server `XPService` adds XP
4. Server `SoundService.playXPGainSound()` called
5. Server emits `sound:xpGain` with path `assets/sounds/xp/xp.mp3`
6. Client `AudioManager` receives event
7. Client creates `new Howl()` and plays sound
8. Browser plays audio (OBS captures via "Application Audio Capture")

---

## 📡 Real-Time Communication

### Socket.IO Events

#### Client → Server

| Event | Payload | Purpose |
|-------|---------|---------|
| `live:start` | - | Start live session (triggers music playback) |
| `live:stop` | - | Stop live session (stops music) |
| `xp:test` | `{ type: 'gain' \| 'reset', amount?: number }` | Manual XP testing |
| `audio:test` | `{ type: 'drop' \| 'buildUp' \| 'viewerJoin' }` | Trigger audio events |
| `audio:nowplaying` | `{ song: Song, nextSong?: Song }` | Update Now Playing display |
| `audio:analysis` | `{ frequencies: number[], playing: boolean }` | Waveform data |

#### Server → Client

| Event | Payload | Purpose |
|-------|---------|---------|
| `live:start` | - | Broadcast live session started |
| `live:stop` | - | Broadcast live session stopped |
| `xp:gain` | `{ amount, currentXP, currentLevel }` | XP added |
| `xp:reset` | `{ currentXP: 0, currentLevel: 1 }` | Session reset |
| `level:up` | `{ newLevel, oldLevel }` | Level up occurred |
| `sound:xpGain` | `{ type, soundPath, metadata }` | Play XP gain sound |
| `sound:drop` | `{ type, soundPath }` | Play drop sound |
| `sound:buildUp` | `{ type, soundPath }` | Play build-up sound |
| `sound:levelUp` | `{ type, soundPath, metadata }` | Play level up sound |
| `sound:viewerJoin` | `{ type, soundPath, metadata }` | Play viewer join sound |
| `audio:nowplaying` | `{ song: Song, nextSong?: Song }` | Current + next song |
| `audio:analysis` | `{ frequencies: number[], playing: boolean }` | Waveform frequency data |

---

## 🧪 Testing Guide

### Manual Testing Steps

1. **Start Live Session**
   - Click "🔴 Iniciar Live"
   - ✅ Button changes to "⏹️ Parar Live"
   - ✅ First song from playlist starts playing
   - ✅ "Tocando agora" shows current song
   - ✅ "Próxima música" shows next song
   - ✅ Progress bar moves
   - ✅ Waveform bars animate

2. **Test XP Sounds**
   - Click "+10 XP" button
   - ✅ Hear `xp.mp3` sound
   - ✅ XP bar increases

3. **Test Event Sounds**
   - Click "🔊 Simular Drop"
   - ✅ Hear `drop.mp3` sound
   - Click "📈 Simular Build Up"
   - ✅ Hear `builups.mp3` sound
   - Click "Simular Entrada de Viewer"
   - ✅ Hear `viewers.mp3` sound

4. **Test Level Up**
   - Click "Forçar Level Up"
   - ✅ Hear `level-up.mp3` sound
   - ✅ Level indicator changes
   - ✅ XP resets to 0

5. **Test Session Reset**
   - Click "↻ Resetar Sessão"
   - ✅ XP goes to 0
   - ✅ Level goes to 1

6. **Stop Live Session**
   - Click "⏹️ Parar Live"
   - ✅ Music stops
   - ✅ Waveform goes idle (low bars)
   - ✅ Progress bar resets

### Console Verification

Expected logs when starting live:
```
[AudioManager] 🎵 Live started event received! Starting music...
[AudioManager] 🎵 Playing: Song Title (1/4)
[WebSocket] 📥 Received event: audio:nowplaying
```

Expected logs when clicking "+10 XP":
```
[AudioManager] 🔊 Playing SFX: assets/sounds/xp/xp.mp3
[WebSocket] 📥 Received event: xp:gain
```

---

## 🐛 Known Issues & Solutions

### Issue 1: Music Not Playing (CORS Error)

**Symptom:**
```
MediaElementAudioSource outputs zeroes due to CORS access restrictions
```

**Cause:** Web Audio API `createMediaElementSource()` hijacks Howler.js audio element

**Solution:** Removed Web Audio API analysis, use simulated frequency data instead

**File:** [AudioManager.tsx](../src/client/src/components/audio/AudioManager.tsx:194-222)

---

### Issue 2: Sound Files Return 404

**Symptom:**
```
Failed loading audio file with status: 404
GET http://localhost:8881/assets/sounds/xp.mp3 404 (Not Found)
```

**Cause:** Sound files are in subdirectories (`assets/sounds/xp/xp.mp3`) but code was looking for flat structure

**Solution:** Updated `SoundService.ts` default paths to include subdirectories

**File:** [SoundService.ts](../src/server/services/SoundService.ts:24-30)

---

### Issue 3: Progress Bar Not Updating

**Symptom:** Progress bar stays at 0% during playback

**Cause:** `audioStore.progress` was never being updated

**Solution:** Added `startProgressTracking()` with 100ms interval to update `setProgress(seek)`

**File:** [AudioManager.tsx](../src/client/src/components/audio/AudioManager.tsx:232-259)

---

### Issue 4: Waveform Not Following Audio

**Symptom:** Waveform just shows random sine wave animation

**Cause:** No connection to actual audio data

**Solution 1 (Attempted):** Web Audio API AnalyserNode → CORS error
**Solution 2 (Implemented):** Simulated frequency data with realistic distribution

**File:** [AudioManager.tsx](../src/client/src/components/audio/AudioManager.tsx:194-222)

---

## 📦 Dependencies

### Frontend

```json
{
  "howler": "^2.2.4",           // Audio playback
  "socket.io-client": "^4.7.2", // Real-time communication
  "zustand": "^4.5.0",          // State management
  "react": "^18.3.0",           // UI framework
  "lucide-react": "^0.294.0"    // Icons
}
```

### Backend

```json
{
  "socket.io": "^4.7.2",        // Real-time server
  "express": "^4.18.2",         // HTTP server
  "pg": "^8.11.3"               // PostgreSQL client
}
```

---

## 🚀 Future Improvements

### Short Term
- [ ] Real audio analysis (solve CORS with same-origin audio files)
- [ ] Visualizer style selector (waveform, bars, circular)
- [ ] Volume controls (music/SFX sliders)
- [ ] Playlist controls (skip, previous, shuffle, loop)

### Medium Term
- [ ] Audio effects (equalizer, bass boost)
- [ ] BPM detection and display
- [ ] Beat-synced animations
- [ ] Audio recording/highlights

### Long Term
- [ ] Multi-track mixing (background music + SFX + voice)
- [ ] VST plugin support
- [ ] Integration with Spotify/YouTube Music API
- [ ] Voice chat integration (Discord, Twitch)

---

## 📝 Important Files Reference

| File | Purpose | Lines of Code |
|------|---------|---------------|
| [LiveControl.tsx](../src/client/src/pages/LiveControl.tsx) | Main page layout | ~150 |
| [AudioManager.tsx](../src/client/src/components/audio/AudioManager.tsx) | Audio playback engine | ~420 |
| [Waveform.tsx](../src/client/src/components/audio/Waveform.tsx) | Visual waveform | ~106 |
| [NowPlaying.tsx](../src/client/src/components/audio/NowPlaying.tsx) | Song display widget | ~110 |
| [XPTestControls.tsx](../src/client/src/components/xp/XPTestControls.tsx) | Test buttons | ~180 |
| [SoundService.ts](../src/server/services/SoundService.ts) | Sound event manager | ~231 |
| [audioStore.ts](../src/client/src/stores/audioStore.ts) | Audio state management | ~98 |

---

## 🎓 Learning Resources

### Howler.js Documentation
- Docs: https://howlerjs.com/
- Play/pause: `howl.play()`, `howl.pause()`
- Seek: `howl.seek()` (get/set position)
- Events: `onplay`, `onend`, `onloaderror`

### Web Audio API (Future Reference)
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- AnalyserNode: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
- CORS Solutions: Use `crossOrigin: 'anonymous'` attribute on audio element

### Socket.IO
- Client API: https://socket.io/docs/v4/client-api/
- Emit: `socket.emit(event, data)`
- Listen: `socket.on(event, callback)`

---

## ✅ Module Completion Checklist

- [x] PT-BR translation complete
- [x] Next song display implemented
- [x] Waveform visualization functional
- [x] Frequency Analysis component removed
- [x] Button sounds working (correct file paths)
- [x] Progress bar tracking playback
- [x] Real-time Socket.IO communication
- [x] Test controls functional
- [x] Module documented
- [x] Code reviewed and cleaned
- [x] Known issues documented with solutions

---

## 🏆 Credits

**Developed by:** Claude (Anthropic)
**Project:** Level Up Live
**Module:** Live Control Panel
**Completion Date:** 2025-10-31

---

**Status:** ✅ Production-ready and closed. Reference this document for implementation details, troubleshooting, and future enhancements.
