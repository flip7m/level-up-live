# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Level Up Live** is a gamified live music system that combines audio playback, real-time audio analysis, XP progression, and visual layer management. The app allows streamers to create customizable levels with layered scenes, triggered events, and playlist management, all controlled via a modern web interface and integrated with OBS via WebSocket.

### Key Goals
- MVP: 2 complete levels with full progression system
- Modular architecture (Audio Engine, Level System, XP System, Playlist Manager, Scene Manager, Event System)
- TypeScript + React frontend, Node.js + Express backend, **PostgreSQL database in Docker**
- Real-time communication via Socket.IO
- Dark purple theme (Tailwind + shadcn/ui)

## Common Development Commands

```bash
# Docker PostgreSQL (isolated stack)
npm run docker:up       # Start PostgreSQL + pgAdmin containers
npm run docker:down     # Stop containers (keeps data)
npm run docker:logs     # View PostgreSQL logs
npm run docker:reset    # Delete containers/volume and recreate fresh

# Development (runs frontend + backend concurrently)
npm run dev

# Frontend only (Vite dev server on :5173)
npm run dev:client

# Backend only (nodemon + tsx on :3000)
npm run dev:server

# Database operations (PostgreSQL)
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data (2 levels)
npm run db:reset        # Reset DB (migrate + seed)

# Build
npm run build           # Full build (client + server)
npm run build:client    # Vite build
npm run build:server    # TypeScript compile

# Production start
npm start               # Run built backend server

# Code quality
npm run type-check      # TypeScript check
npm run lint            # ESLint
npm run format          # Prettier format

# Testing
npm run test            # Vitest runner
npm run test:ui         # Vitest with UI
```

## PostgreSQL Database Setup

The project uses **PostgreSQL in Docker** for persistence and reliability.

### Quick Start

1. **Install Docker Desktop** (if not already installed)
   - Download from https://www.docker.com/products/docker-desktop
   - Make sure it's running before starting the app

2. **Start PostgreSQL stack**
   ```bash
   npm run docker:up
   ```
   - PostgreSQL runs on `localhost:8010` (isolated from other projects)
   - pgAdmin runs on `http://localhost:8011`

3. **Run migrations and seed**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

### Access pgAdmin (Database UI)

- URL: `http://localhost:8011`
- Email: `admin@levelup.local`
- Password: `admin123`

In pgAdmin, create a new server connection:
- Host: `levelup-postgres` (Docker network name)
- Port: `5432` (internal port)
- Database: `levelup_live`
- Username: `levelup_user`
- Password: `levelup_dev_2024`

### Database Structure

**Tables:**
- `levels` - Game levels with XP thresholds
- `events` - Game events (visual/audio triggers)
- `songs` - Playlist/music library
- `live_sessions` - Session tracking (start/end, XP, metrics)
- `xp_history` - XP event log with multipliers and timestamps
- `config` - Application settings (key-value pairs)

**JSON Columns (JSONB type):**
- `levels.layers_json` - Background, stage, crowd, effects
- `levels.sounds_json` - Transition and levelUp sounds
- `levels.visual_config_json` - Animation settings
- `events.trigger_config_json`, `assets_json` - Event configuration

### Docker Stack Details

- **Isolated Network:** `levelup-network` (doesn't interfere with Imovelize)
- **Volume:** `levelup-postgres-data` (persistent storage)
- **Container Names:** `levelup-postgres`, `levelup-pgadmin`
- **Ports:** 8010 (PostgreSQL), 8011 (pgAdmin)

### Common Operations

```bash
# View database logs
npm run docker:logs

# Stop containers (data persists in volume)
npm run docker:down

# Completely reset database (deletes volume + recreates)
npm run docker:reset

# Manually connect from command line
psql -h localhost -p 8010 -U levelup_user -d levelup_live
# Password: levelup_dev_2024
```

### Using reset.bat

On Windows, you can use the provided `reset.bat` script:
```bash
.\reset.bat
```

This will:
1. Stop Node.js processes
2. Reset Docker containers and volumes
3. Run migrations and seed
4. Start development server

## Project Structure & Architecture

### High-Level Module Organization

The system is organized into 6 core modules, each with clear responsibilities:

1. **Audio Engine** - Reproduces music (Howler.js), analyzes audio in real-time (Web Audio API FFT), detects drops/builds, emits audio events
2. **✅ Level Editor** - CRUD for levels, dynamic layer system with position/scale controls, live preview 16:9, asset management *(Completed)*
3. **XP System** - Calculates XP from audio triggers, handles multipliers (combo, time bonus), triggers level-ups
4. **✅ Playlist Manager** - Manages song queue, reordering, loop/shuffle, persistence *(Completed)*
5. **Scene Manager** - Builds scenes from layers, applies transitions, manages visual effects during live
6. **Event System** - Special visual/audio events with triggers (manual, random, audio-based), cooldowns, duration control

### Frontend Architecture (`src/client/`)

**State Management:**
- Zustand stores: `liveStore.ts` (current XP/level), `audioStore.ts` (player state), `configStore.ts`
- Custom hooks: `useWebSocket` (Socket.IO), `useLiveState`, `useAudioPlayer`, `useLevels`, `usePlaylist`

**Page Structure:**
1. **Dashboard** - Status, current level, quick controls, activity log, metrics overview
2. **Level Editor** - Sidebar with level list, main editor with tabs (Visual/Sounds/Config/Events), live preview panel
3. **✅ Playlist Manager** - Drag-drop song list, metadata display, total duration *(Completed)*
4. **Live Control Panel** - Audio player + waveform, XP bar, level indicator, event triggers, audio analyzer (FFT bars), test controls
5. **Metrics Dashboard** - Session history, stats cards, charts (XP over time, events by type, XP sources), timeline
6. **Settings** - XP rates, audio sensitivity, folder paths, platform integrations (future)

**Components by Category:**
- `components/ui/` - shadcn/ui base components
- `components/layout/` - Sidebar, Header, Layout wrapper
- `components/audio/` - AudioPlayer, Waveform, FrequencyBars, VolumeControl
- `components/level/` - LevelList, LevelItem, LayerManager, LivePreview
- `components/playlist/` - SongList, SongItem, DropZone
- `components/xp/` - XPBar, LevelIndicator, XPCounter
- `components/metrics/` - StatCard, LineChart, Timeline

### Backend Architecture (`src/server/`)

**Data Flow:**
```
Express App → Controllers → Services → Database Repositories → PostgreSQL (Docker)
       ↑
       └─ Socket.IO bidirectional events
```

**Database Access:**
- Connection pool: pg.Pool (20 max connections, 30s idle timeout)
- Repositories: async methods with parameterized queries ($1, $2, etc.)
- Transactions: automatic ROLLBACK on error
- Type-safe queries with TypeScript

**Controllers** - Handle HTTP routes:
- `AudioEngineController` - Play/pause/seek, volume control, analysis data
- `LevelController` - CRUD levels, reordering
- `PlaylistController` - Add/remove songs, reorder
- `EventController` - Trigger events

**Services** - Business logic:
- `XPService` - Calculate XP, check level-up conditions
- `AudioAnalyzer` - FFT analysis, BPM detection, drop/build detection
- `SceneManager` - Build scene from level layers
- `SessionService` - Track live session metrics

**Database:**
- PostgreSQL 16 (in Docker) at `localhost:8010`
- Migrations in `src/server/database/migrations/`
- Repositories (data access layer) in `src/server/database/repositories/`
- Tables: `levels`, `events`, `songs`, `live_sessions`, `xp_history`, `config`

### Communication Pattern

- **REST API** - Stateless operations (CRUD levels, events, songs)
- **WebSocket (Socket.IO)** - Real-time state: audio playback, XP changes, level-ups, events, analysis data
- Events are prefixed by domain: `audio:*`, `live:*`, `level:*`, `event:*`, `xp:*`

## Key Technical Decisions & Patterns

### Audio Engine Details
- **Howler.js** for multi-track playback (music + SFX simultaneously)
- **Web Audio API** via AnalyserNode for FFT (frequency analysis)
- BPM detection: custom algorithm (analyze energy peaks over time)
- Drop detection: frequency spectrum analysis (bass frequencies drop suddenly)
- All analysis runs at 60fps max (throttled), triggered via requestAnimationFrame

### Level Schema Structure
Levels are stored with JSONB columns in PostgreSQL. Key fields:
- `id` (UUID primary key)
- `order_num` (unique, determines level order)
- `layers_json` (JSONB) - background, stage, crowd, effects array (paths to `/assets/scenes/`)
- `sounds_json` (JSONB) - transition, levelUp, optional ambient (paths to `/assets/sounds/`)
- `visual_config_json` (JSONB) - transitionDuration, transitionEffect
- `available_events_json` (JSONB) - array of event IDs that can occur at this level
- `xp_threshold` - total XP needed to reach this level
- `created_at`, `updated_at` - timestamps (auto-updated)

### XP Multiplier System
Base XP is modified by:
- `sources` - Different triggers (audioDrop: 2 points, audioBuildUp: 1 point, etc.)
- `multipliers` - combo (increases with consecutive events), timeBonus (increases with live duration)
- All XP events logged in `xp_history` table for metrics

### Event System (✅ IMPLEMENTADO - Nível 2)
**Status:** Sistema completo e funcional para triggers manuais e aleatórios

**Triggers implementados:**
- ✅ Manual (user button click via EventPanel)
- ✅ Random (probability-based triggers)
- ⏳ Audio-based (infraestrutura pronta, não implementado a pedido)
- ⏳ Vote (futuro: chat voting)

**Funcionalidades:**
- ✅ Cooldowns por evento (evita spam)
- ✅ Filtros por nível mínimo
- ✅ Múltiplas layers visuais por evento (z-index 100+)
- ✅ Sons sincronizados automaticamente
- ✅ Animações de entrada/saída (fade + scale)
- ✅ Duração configurável (segundos)
- ✅ Renderização dupla (LiveStage React + Live View OBS)
- ✅ EventPanel com countdown e barra de progresso
- ✅ 5 eventos pré-configurados no seed

**Documentação completa:** `docs/EVENTS_SYSTEM.md`

## Design System

**Color Palette (Tailwind):**
- Primary: `#8B5CF6` (purple-500)
- Secondary: `#6366F1` (indigo-500)
- Accent: `#EC4899` (pink-500)
- Background: `#0F0A1E` (deep dark)
- Surface: `#1A1332` (dark purple)
- Text: `#E9D5FF` (purple-100)

Use Tailwind's `dark:` utilities. Theme is always dark mode (no light mode).

## Development Workflow

### Adding a New Feature

1. **Identify the module(s)** it belongs to (Audio, Level, XP, Playlist, Scene, Event)
2. **Create database schema** if new data is needed (migration file)
3. **Implement backend** - service logic + controller routes + repository
4. **Add Socket.IO events** for real-time updates
5. **Implement frontend** - state (store/hook), components, pages
6. **Connect via WebSocket** - listen for server events, emit client commands
7. **Test** - manual testing in dev mode, metrics verification

### Testing Helpers

The PRD includes a **Test Control Panel** with manual triggers:
- `+10 XP`, `+50 XP`, `Force Level Up` - XP testing
- `Simulate Drop`, `Simulate Build Up` - audio trigger testing
- `Random Event`, event dropdown - event testing
- `Reset Session` - clear XP/level

Use these in dev to validate progression without playing full songs.

## Completed Modules

### ✅ Playlist Manager Module (Completed & Closed)

The Playlist Manager module has been fully implemented, tested, and documented as a reusable resource.

**Module Documentation:** See [docs/PLAYLIST_MODULE.md](docs/PLAYLIST_MODULE.md) for comprehensive details.

### ✅ Level Editor Module (Completed & Closed)

The Level Editor module has been fully implemented, tested, and documented as a reusable resource.

**Module Documentation:** See [docs/LEVEL_EDITOR_MODULE.md](docs/LEVEL_EDITOR_MODULE.md) for comprehensive details.

**Overview:**
- **Frontend:** Two-column layout (sidebar + editor) with 4 tabs (Visual, Sons, Configuração, Eventos), live preview 16:9
- **Backend:** 8 REST endpoints + PostgreSQL with JSONB + automatic data migration
- **Features:**
  - Dynamic layer system with unlimited layers (no predefined background/stage/crowd)
  - Position and scale controls for each layer (X, Y, scale 10-300%)
  - Asset picker organized by folders (`assets/imagens/backgrounds/`, `assets/imagens/artistas/`)
  - Live preview 1920x1080 with real-time CSS transforms
  - Drag & drop for layer and level reordering via @dnd-kit
  - Sound picker for transition, level up, and ambient sounds
  - Visual configuration (transition duration 100-3000ms, effect type: fade/slide/zoom)
  - XP threshold configuration with auto-ordering
  - Full Portuguese PT-BR translation with themed cards and icons

**Key Files:**
- Frontend: [src/client/src/pages/LevelEditor.tsx](src/client/src/pages/LevelEditor.tsx), [src/client/src/components/level/LevelForm.tsx](src/client/src/components/level/LevelForm.tsx), [src/client/src/components/level/LayerManager.tsx](src/client/src/components/level/LayerManager.tsx), [src/client/src/components/level/LayerItem.tsx](src/client/src/components/level/LayerItem.tsx), [src/client/src/components/level/LivePreview.tsx](src/client/src/components/level/LivePreview.tsx)
- Backend: [src/server/controllers/LevelController.ts](src/server/controllers/LevelController.ts), [src/server/services/LevelService.ts](src/server/services/LevelService.ts), [src/server/database/repositories/LevelRepository.ts](src/server/database/repositories/LevelRepository.ts)
- Types: [src/shared/types.ts](src/shared/types.ts) (Level, LayerTransform interfaces)

**Dependencies Used:**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` - Drag & drop functionality
- `lucide-react` - Icons (FileText, Award, Clock, Sparkles, etc.)
- `pg` - PostgreSQL with JSONB storage

**Status:** Module is production-ready and closed. Reference [docs/LEVEL_EDITOR_MODULE.md](docs/LEVEL_EDITOR_MODULE.md) for implementation details.

### ✅ Event System Module (Completed - Nível 2)

The Event System module has been fully implemented for manual and random triggers, tested, and documented.

**Module Documentation:** See [docs/EVENTS_SYSTEM.md](docs/EVENTS_SYSTEM.md) for comprehensive details.

**Overview:**
- **Backend:** EventController (9 REST endpoints + Socket.IO), EventService (cooldowns, triggers), EventRepository (CRUD)
- **Frontend:** EventPanel component (trigger controls + active events display), useEvents hook, LiveStage event rendering
- **Live View:** HTML/JavaScript event rendering for OBS capture
- **Features:**
  - Manual trigger via buttons (EventPanel)
  - Random trigger with probability-based selection
  - Cooldown system (in-memory, per event)
  - Level-based filtering (minLevel requirement)
  - Multiple visual layers per event (z-index 100+)
  - Synchronized sound playback
  - Fade in/out + scale animations (CSS)
  - Configurable duration (seconds)
  - Active events display with countdown and progress bar
  - 5 pre-configured events in seed (Confetti, Fireworks, Spotlight, Crowd Cheer, Laser Show)

**Key Files:**
- Backend: [src/server/controllers/EventController.ts](src/server/controllers/EventController.ts), [src/server/services/EventService.ts](src/server/services/EventService.ts), [src/server/database/repositories/EventRepository.ts](src/server/database/repositories/EventRepository.ts)
- Frontend: [src/client/src/components/event/EventPanel.tsx](src/client/src/components/event/EventPanel.tsx), [src/client/src/hooks/useEvents.ts](src/client/src/hooks/useEvents.ts), [src/client/src/pages/LiveStage.tsx](src/client/src/pages/LiveStage.tsx#L102-L156)
- Live View: [src/server/views/live-view.html](src/server/views/live-view.html#L740-L830)
- Seed: [src/server/database/seed.ts](src/server/database/seed.ts#L105-L273)
- Styles: [src/client/src/styles/livestage.css](src/client/src/styles/livestage.css#L166-L202)

**Dependencies Used:**
- Socket.IO (real-time event propagation)
- PostgreSQL JSONB (flexible event storage)
- Web Audio API (event sounds playback)

**Status:** Module is production-ready for manual/random triggers. Audio-based triggers (infraestrutura pronta, não implementado). Event Editor UI not implemented (eventos gerenciados via seed/API). Reference [docs/EVENTS_SYSTEM.md](docs/EVENTS_SYSTEM.md) for usage guide.

---

## Important Files & Key Locations

| Purpose | Path |
|---------|------|
| PRD (source of truth) | `docs/PRD.md` |
| Playlist Module (completed) | `docs/PLAYLIST_MODULE.md` |
| Level Editor Module (completed) | `docs/LEVEL_EDITOR_MODULE.md` |
| Event System Module (completed) | `docs/EVENTS_SYSTEM.md` |
| Type definitions | `src/shared/` |
| Environment config | `.env` (create from `.env.example`) |
| Database schema | `src/server/database/migrations/` |
| Tailwind theme | `src/client/tailwind.config.ts` |
| Asset folders | `assets/imagens/`, `assets/sounds/`, `assets/music/` |
| Logs | `data/logs/app.log` |

## Performance Optimization Notes

- **Audio Analysis**: Use Web Workers if FFT becomes heavy (don't block UI)
- **Playlist**: Virtualize list if > 100 songs
- **WebSocket**: Batch events, debounce rapid updates
- **Database**: Index `order_num` and `session_id` columns
- **UI Rendering**: Use `React.memo` for heavy components, CSS transforms for animations

## Common Pitfalls to Avoid

1. **Don't emit too many Socket.IO events** - batch audio analysis updates (not every frame)
2. **Validate file paths** - all asset paths are relative; validate before saving
3. **XP calculation edge cases** - handle multiplier cap, prevent negative XP
4. **Database migrations** - always create new migration files, never edit old ones
5. **Type consistency** - share types in `src/shared/` to avoid mismatches between client/server

## Future Roadmap (Post-MVP)

**Short term:** More levels (3-10), more events (10+), voting system, hotkeys
**Medium term:** YouTube/Twitch API, multi-camera, chat overlay, achievements
**Long term:** Cloud sync, mobile app, multi-streamer, marketplace, hardware integration

See `docs/PRD.md` sections "🎁 Extras & Features Futuras" and "🎯 Roadmap de Desenvolvimento" for full details.

## Dependencies Overview

**Frontend:**
- React 18, TypeScript, Vite
- TailwindCSS + shadcn/ui (components)
- Zustand (state management)
- Socket.IO client (WebSocket)
- Framer Motion (animations)
- Lucide React (icons)

**Backend:**
- Node.js 20+ LTS, Express, TypeScript
- Socket.IO (WebSocket server)
- Howler.js (audio playback)
- pg + pg-pool (PostgreSQL driver with connection pooling)
- Web Audio API (built-in, no import needed)

**Database:**
- PostgreSQL 16 (in Docker)
- Migrations via raw SQL files
- JSONB columns for flexible data (levels, events, sessions)
- Connection pooling for performance

**Docker:**
- Docker Desktop (isolated `levelup-network` and `levelup-postgres-data`)
- PostgreSQL 16 Alpine (lightweight)
- pgAdmin 4 (visual database management)

All dependencies listed in `package.json`.
