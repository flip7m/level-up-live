🎮 PRD - Level Up Live System
Sistema de Live Musical Gamificada com Controle Total
📋 Visão Geral Executiva
Level Up Live é uma aplicação web local que transforma lives musicais em experiências gamificadas interativas e totalmente customizáveis. O sistema funciona como uma central de controle completa, gerenciando a reprodução de música, análise de áudio em tempo real, sistema de progressão por níveis e uma interface de edição visual para criar experiências únicas. A transmissão para a live é feita de forma simples, capturando a janela da aplicação web diretamente no OBS.

Diferencial: Sistema modular onde o streamer cria e configura seus próprios níveis, eventos, sons e assets visuais através de uma interface drag-and-drop, com preview em tempo real e controle total da experiência visual que será transmitida.​

🎯 Objetivos do MVP (Fase 1)
Sistema funcional com 2 níveis completos (validar arquitetura antes de escalar)

Editor visual de níveis com preview ao vivo

Player de música integrado com playlist gerenciável

Análise de áudio em tempo real para triggers

Sistema de XP/progressão configurável

Modo de teste/simulação para desenvolvimento

Interface moderna com tema roxo escuro

🛠️ Stack Tecnológica
Frontend
typescript
- React 18 + TypeScript
- Vite (build tool ultra-rápido)
- TailwindCSS + shadcn/ui (componentes modernos)
- Zustand (state management leve)
- React Query (cache e sync)
- Framer Motion (animações suaves)
- Lucide React (ícones)
Backend/Core
typescript
- Node.js 20+ LTS
- Express (servidor HTTP)
- Socket.IO (WebSocket bidirecionais)
- better-sqlite3 (banco local síncrono)
- Web Audio API (análise de áudio)
- Howler.js (reprodução de áudio multi-camada)
Integrações Futuras
typescript
- YouTube Live Chat API v3 (Pós-MVP)
- Twitch EventSub WebSocket API (Pós-MVP)
Design System
text
Tema: Dark Purple
- Primary: #8B5CF6 (purple-500)
- Secondary: #6366F1 (indigo-500)
- Accent: #EC4899 (pink-500)
- Background: #0F0A1E (deep dark purple)
- Surface: #1A1332 (dark purple)
- Text: #E9D5FF (purple-100)
🏗️ Arquitetura do Sistema
Diagrama de Módulos
text
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                    │
│  ┌────────────┬────────────┬────────────────────┐  │
│  │  Dashboard │   Editor   │  Playlist Manager  │  │
│  │   Metrics  │   Visual   │   Live Controls    │  │
│  └────────────┴────────────┴────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │ WebSocket (Socket.IO)
┌───────────────────┴─────────────────────────────────┐
│              BACKEND (Node + Express)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  Audio Engine  │  Level System  │  DB Layer │  │
│  │  Event System  │    Logger      │           │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
            ┌───────▼───────┐
            │    SQLite     │
            │      DB       │
            └───────────────┘
📦 Módulos Principais
1. Audio Engine Module
Responsabilidades:

Reprodução de músicas (MP3/WAV/OGG)

Reprodução simultânea de efeitos sonoros

Análise em tempo real (FFT, BPM detection, frequency analysis)

Detecção de drops/builds

Controle de volume independente (música vs efeitos)

Sistema de fila/playlist

Tecnologias:

Howler.js para reprodução multi-track​

Web Audio API para análise​

AnalyserNode para FFT

Custom BPM detector

Eventos emitidos:

typescript
'audio:play' | 'audio:pause' | 'audio:ended'
'audio:drop-detected' | 'audio:build-up'
'audio:beat' | 'audio:frequency-spike'
'audio:transition-start' | 'audio:transition-end'
Interface:

typescript
interface AudioEngine {
  // Player controls
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  previous(): void;
  seek(time: number): void;
  
  // Volume
  setMusicVolume(vol: number): void;
  setSFXVolume(vol: number): void;
  
  // Effects
  playTransitionSound(levelId: number): void;
  playLevelUpSound(levelId: number): void;
  
  // Analysis
  getFrequencyData(): Uint8Array;
  getBPM(): number;
  getEnergy(): number; // 0-100
  
  // Playlist
  loadPlaylist(songs: Song[]): void;
  setLoop(enabled: boolean): void;
  setShuffle(enabled: boolean): void;
}
2. Level System Module
Responsabilidades:

Gerenciamento de níveis (CRUD)

Cálculo de XP e progressão

Triggers de level up

Sistema de thresholds

Persistência no banco

Schema de Nível:

typescript
interface Level {
  id: string; // uuid
  order: number; // 1, 2, 3...
  name: string; // "Garagem", "Arena"
  description: string;
  xpThreshold: number; // XP necessário para atingir
  
  // Assets (camadas)
  layers: {
    background: string; // path relativo
    stage: string;
    crowd: string;
    effects: string[];
  };
  
  // Sounds
  sounds: {
    transition: string; // som entre músicas
    levelUp: string; // som ao atingir este level
    ambient?: string; // som de fundo (opcional)
  };
  
  // Configurações visuais
  visualConfig: {
    transitionDuration: number; // ms
    transitionEffect: 'fade' | 'slide' | 'zoom';
  };
  
  // Eventos disponíveis neste nível
  availableEvents: string[]; // IDs de eventos
  
  createdAt: string;
  updatedAt: string;
}
XP System:

typescript
interface XPConfig {
  sources: {
    // Triggers de áudio
    audioDrop: number;
    audioBuildUp: number;
    // Outros triggers locais podem ser adicionados aqui
  };
  multipliers: {
    combo: number; // multiplicador por eventos consecutivos
    timeBonus: number; // bonus por tempo de live
  };
}

interface XPState {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  progress: number; // 0-100%
  totalXPEarned: number;
  history: XPEvent[];
}

interface XPEvent {
  timestamp: number;
  source: keyof XPConfig['sources'];
  amount: number;
  multiplier: number;
}


4. Scene Manager Module
Responsabilidades:

Construção de cenas por camadas na aplicação web

Controle de camadas individuais (visibilidade, assets)

Preview de cenas em tempo real no editor

Layer System:

typescript
interface SceneLayer {
  id: string;
  name: string;
  type: 'image' | 'video' | 'browser' | 'text';
  order: number; // z-index
  source: string; // path ou URL
  visible: boolean;
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
  };
  filters: Filter[];
}

interface Scene {
  id: string;
  levelId: string;
  obsSceneName: string;
  layers: SceneLayer[];
}
5. Event System Module
Responsabilidades:

Eventos especiais visuais (Godzilla, meteoro, etc)

Sistema de votação no chat (futuro)

Cooldowns e raridade

Triggers manuais e automáticos

Event Schema:

typescript
interface GameEvent {
  id: string;
  name: string; // "Kaiju Battle"
  description: string;
  type: 'visual' | 'audio' | 'interactive';
  
  // Triggers
  triggerType: 'manual' | 'random' | 'vote' | 'audio' | 'xp-milestone';
  triggerConfig: {
    probability?: number; // 0-1 para random
    cooldown?: number; // minutos
    minLevel?: number; // level mínimo para acontecer
  };
  
  // Execução
  duration: number; // segundos
  assets: {
    layers: SceneLayer[]; // camadas adicionais temporárias
    sounds: string[];
  };
  
  // Votação (futuro)
  voteOptions?: {
    command: string; // !vote 1
    label: string;
  }[];
}
6. Playlist Manager Module
Responsabilidades:

Gerenciamento de fila de músicas

Drag-and-drop reordering

Cálculo de duração total

Loop e shuffle

Persistência de ordem

Interface:

typescript
interface PlaylistManager {
  songs: Song[];
  currentIndex: number;
  loopEnabled: boolean;
  shuffleEnabled: boolean;
  
  // CRUD
  addSong(filePath: string): Promise<Song>;
  removeSong(songId: string): void;
  reorder(fromIndex: number, toIndex: number): void;
  
  // Playback
  getCurrentSong(): Song | null;
  getNextSong(): Song | null;
  getTotalDuration(): number; // seconds
  
  // Persistence
  save(): Promise<void>;
  load(): Promise<void>;
}

interface Song {
  id: string;
  filePath: string;
  filename: string;
  title: string; // extraído de metadata
  artist: string;
  duration: number; // segundos
  bpm?: number; // detectado ou manual
  addedAt: string;
}
7. Database Layer
Schema SQLite:

sql
-- Levels
CREATE TABLE levels (
  id TEXT PRIMARY KEY,
  order_num INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  xp_threshold INTEGER NOT NULL,
  layers_json TEXT NOT NULL, -- JSON das camadas
  sounds_json TEXT NOT NULL, -- JSON dos sons
  visual_config_json TEXT NOT NULL,
  available_events_json TEXT, -- array de event IDs
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Events
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config_json TEXT NOT NULL,
  duration INTEGER NOT NULL,
  assets_json TEXT NOT NULL,
  vote_options_json TEXT,
  created_at TEXT NOT NULL
);

-- Songs (playlist)
CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  duration REAL NOT NULL,
  bpm INTEGER,
  playlist_order INTEGER,
  added_at TEXT NOT NULL
);

-- Live Sessions
CREATE TABLE live_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  total_duration INTEGER, -- segundos
  final_level INTEGER,
  total_xp INTEGER,
  metrics_json TEXT -- JSON com stats detalhados
);

-- XP History (durante live)
CREATE TABLE xp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  multiplier REAL DEFAULT 1.0,
  current_level INTEGER NOT NULL,
  current_xp INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id)
);

-- Config global
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
🎨 Interface (UI/UX)
Tema Design Tokens
typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          500: '#8B5CF6', // main
          600: '#7C3AED',
          900: '#4C1D95',
        },
        surface: {
          dark: '#0F0A1E',
          light: '#1A1332',
          lighter: '#2D1B4E',
        },
        accent: {
          pink: '#EC4899',
          indigo: '#6366F1',
        }
      }
    }
  }
}
Layout Principal
text
┌─────────────────────────────────────────────────────────┐
│  [Logo] Level Up Live        [Status: ● Live] [Settings]│
├───────┬─────────────────────────────────────────────────┤
│       │                                                  │
│ NAV   │              MAIN CONTENT                       │
│       │                                                  │
│ 🏠 │              (Dashboard / Editor / etc)         │
│ 🎵 │                                                  │
│ 🎮 │                                                  │
│ 📊 │                                                  │
│ ⚙️ │                                                  │
│       │                                                  │
└───────┴─────────────────────────────────────────────────┘
Páginas Principais
1. Dashboard (Home)
typescript
<Dashboard>
  <StatusCard> // Live/Offline, tempo, viewers
  <CurrentLevelCard> // Visual do nível atual + XP bar
  <QuickControls> // Play/Pause, Next, Force Level Up
  <RecentActivity> // Log de eventos recentes
  <Metrics> // Charts: XP over time, eventos disparados
</Dashboard>
2. Level Editor
typescript
<LevelEditor>
  <Sidebar>
    <LevelList> // Lista de níveis (drag reorder)
      <LevelItem level={1} active />
      <LevelItem level={2} />
      <Button>+ Add Level</Button>
    </LevelList>
  </Sidebar>
  
  <MainEditor>
    <Tabs>
      <Tab name="Visual">
        <LayerManager> // Drag-drop camadas
          <LayerItem name="Background" />
          <LayerItem name="Stage" />
          <LayerItem name="Crowd" />
        </LayerManager>
        <AssetPicker> // Browse /scenes
      </Tab>
      
      <Tab name="Sounds">
        <SoundPicker type="transition" />
        <SoundPicker type="levelUp" />
        <AudioPreview />
      </Tab>
      
      <Tab name="Config">
        <Input label="Name" />
        <Input label="XP Threshold" type="number" />
        <Input label="Transition Duration" />
      </Tab>
      
      <Tab name="Events">
        <EventSelector> // Quais eventos podem acontecer
          <Checkbox label="Kaiju Battle" />
          <Checkbox label="Meteor Shower" />
        </EventSelector>
      </Tab>
    </Tabs>
  </MainEditor>
  
  <PreviewPanel>
    <LivePreview> // Renderiza a cena com as camadas
  </PreviewPanel>
</LevelEditor>
3. Playlist Manager
typescript
<PlaylistManager>
  <Header>
    <Stats>
      Total: 23h 47min | {songs.length} songs
    </Stats>
    <Controls>
      <Toggle label="Loop" />
      <Toggle label="Shuffle" />
    </Controls>
  </Header>
  
  <DragDropList>
    {songs.map(song => (
      <SongItem
        title={song.title}
        artist={song.artist}
        duration={formatDuration(song.duration)}
        bpm={song.bpm}
        onDelete={() => removeSong(song.id)}
        draggable
      />
    ))}
  </DragDropList>
  
  <DropZone>
    Drag MP3/WAV files here or
    <Button>Browse Files</Button>
  </DropZone>
</PlaylistManager>
4. Live Control Panel
typescript
<LiveControlPanel>
  <AudioPlayer>
    <NowPlaying>
      <AlbumArt />
      <SongInfo />
      <Waveform /> // Visualização em tempo real
    </NowPlaying>
    
    <Controls>
      <Button icon={Previous} />
      <Button icon={Play} size="lg" />
      <Button icon={Next} />
    </Controls>
    
    <VolumeControls>
      <Slider label="Music" />
      <Slider label="SFX" />
    </VolumeControls>
  </AudioPlayer>
  
  <XPPanel>
    <LevelIndicator current={level} />
    <ProgressBar value={xp} max={nextLevelXP} />
    <XPCounter>
      {currentXP} / {nextLevelXP} XP
    </XPCounter>
    
    <TestControls> // Modo dev
      <Button>+10 XP</Button>
      <Button>+50 XP</Button>
      <Button>Force Level Up</Button>
    </TestControls>
  </XPPanel>
  
  <EventPanel>
    <EventQueue> // Eventos agendados
    <ManualTriggers>
      <Button>Random Event</Button>
      <Select placeholder="Choose event...">
        <Option>Kaiju Battle</Option>
        <Option>Meteor Shower</Option>
      </Select>
      <Button>Trigger</Button>
    </ManualTriggers>
  </EventPanel>
  
  <AudioAnalyzer>
    <FrequencyBars /> // Visualização FFT
    <Metrics>
      BPM: {bpm} | Energy: {energy}%
    </Metrics>
    <TriggerIndicators>
      <Badge>Drop Detected</Badge>
      <Badge>Build Up</Badge>
    </TriggerIndicators>
  </AudioAnalyzer>
</LiveControlPanel>
5. Metrics Dashboard
typescript
<MetricsDashboard>
  <SessionSelector> // Dropdown de lives passadas
  
  <StatsGrid>
    <StatCard title="Total XP" value={totalXP} />
    <StatCard title="Final Level" value={finalLevel} />
    <StatCard title="Duration" value={duration} />
    <StatCard title="Events Triggered" value={eventCount} />
  </StatsGrid>
  
  <Charts>
    <LineChart title="XP Over Time" data={xpHistory} />
    <BarChart title="Events by Type" data={eventStats} />
    <PieChart title="XP Sources" data={xpSources} />
  </Charts>
  
  <Timeline> // Timeline da live com markers
    <Marker time="00:15:32" label="Level 2" />
    <Marker time="00:47:18" label="Kaiju Event" />
  </Timeline>
  
  <ExportButton>Export Report (JSON)</ExportButton>
</MetricsDashboard>
6. Settings
typescript
<Settings>
  <Section title="XP Rates">
    <Input label="Audio Drop" value={2} />
    <Input label="Audio Build Up" value={1} />
  </Section>
  
  <Section title="Audio Sensitivity">
    <Slider label="Drop Detection" min={1} max={100} />
    <Slider label="Energy Threshold" min={1} max={100} />
  </Section>
  
  <Section title="Paths">
    <FolderPicker label="Scenes Folder" />
    <FolderPicker label="Sounds Folder" />
    <FolderPicker label="Music Folder" />
  </Section>
  
  <Section title="Live Platforms (Future)">
    <Input label="YouTube API Key" disabled />
    <Input label="Twitch Client ID" disabled />
    <Badge>Coming Soon</Badge>
  </Section>
</Settings>
📁 Estrutura de Pastas Completa
text
level-up-live/
├── src/
│   ├── server/
│   │   ├── index.ts                      # Entry point
│   │   ├── app.ts                        # Express app setup
│   │   ├── socket.ts                     # Socket.IO setup
│   │   │
│   │   ├── controllers/
│   │   │   ├── AudioEngineController.ts  # Audio playback + analysis
│   │   │   ├── LevelController.ts        # Level CRUD + logic
│   │   │   ├── PlaylistController.ts     # Playlist management
│   │   │   └── EventController.ts        # Events system
│   │   │
│   │   ├── services/
│   │   │   ├── XPService.ts              # XP calculation + progression
│   │   │   ├── SceneManager.ts           # Scene building + layers
│   │   │   ├── AudioAnalyzer.ts          # FFT + BPM detection
│   │   │   └── SessionService.ts         # Live session tracking
│   │   │
│   │   ├── database/
│   │   │   ├── db.ts                     # SQLite connection
│   │   │   ├── migrations/               # Schema migrations
│   │   │   │   └── 001_initial.sql
│   │   │   └── repositories/
│   │   │       ├── LevelRepository.ts
│   │   │       ├── EventRepository.ts
│   │   │       ├── SongRepository.ts
│   │   │       └── SessionRepository.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts                 # Winston logger
│   │   │   ├── config.ts                 # Config loader
│   │   │   └── fileSystem.ts             # File ops helpers
│   │   │
│   │   └── types/
│   │       ├── level.types.ts
│   │       ├── audio.types.ts
│   │       └── event.types.ts
│   │
│   ├── client/
│   │   ├── src/
│   │   │   ├── main.tsx                  # Entry point
│   │   │   ├── App.tsx                   # Router + layout
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── LevelEditor.tsx
│   │   │   │   ├── PlaylistManager.tsx
│   │   │   │   ├── LiveControl.tsx
│   │   │   │   ├── Metrics.tsx
│   │   │   │   └── Settings.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── slider.tsx
│   │   │   │   │   ├── tabs.tsx
│   │   │   │   │   └── ...
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Layout.tsx
│   │   │   │   │
│   │   │   │   ├── audio/
│   │   │   │   │   ├── AudioPlayer.tsx
│   │   │   │   │   ├── Waveform.tsx
│   │   │   │   │   ├── FrequencyBars.tsx
│   │   │   │   │   └── VolumeControl.tsx
│   │   │   │   │
│   │   │   │   ├── level/
│   │   │   │   │   ├── LevelList.tsx
│   │   │   │   │   ├── LevelItem.tsx
│   │   │   │   │   ├── LayerManager.tsx
│   │   │   │   │   ├── LayerItem.tsx
│   │   │   │   │   └── LivePreview.tsx
│   │   │   │   │
│   │   │   │   ├── playlist/
│   │   │   │   │   ├── SongList.tsx
│   │   │   │   │   ├── SongItem.tsx
│   │   │   │   │   └── DropZone.tsx
│   │   │   │   │
│   │   │   │   ├── xp/
│   │   │   │   │   ├── XPBar.tsx
│   │   │   │   │   ├── LevelIndicator.tsx
│   │   │   │   │   └── XPCounter.tsx
│   │   │   │   │
│   │   │   │   └── metrics/
│   │   │   │       ├── StatCard.tsx
│   │   │   │       ├── LineChart.tsx
│   │   │   │       └── Timeline.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useWebSocket.ts       # Socket.IO hook
│   │   │   │   ├── useLiveState.ts       # Estado da live
│   │   │   │   ├── useAudioPlayer.ts     # Player state
│   │   │   │   ├── useLevels.ts          # Levels CRUD
│   │   │   │   ├── usePlaylist.ts        # Playlist state
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── liveStore.ts          # Zustand: live state
│   │   │   │   ├── audioStore.ts         # Zustand: audio state
│   │   │   │   └── configStore.ts        # Zustand: config
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                # Axios instance
│   │   │   │   ├── socket.ts             # Socket.IO client
│   │   │   │   └── utils.ts              # Helper functions
│   │   │   │
│   │   │   └── styles/
│   │   │       └── globals.css           # Tailwind imports
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── shared/                            # Types compartilhados
│       ├── level.types.ts
│       ├── audio.types.ts
│       ├── event.types.ts
│       └── api.types.ts
│
├── assets/                                # Assets do projeto
│   ├── scenes/                            # Imagens das cenas
│   │   ├── level1/
│   │   │   ├── background.png
│   │   │   ├── stage.png
│   │   │   └── crowd.png
│   │   └── level2/
│   │       ├── background.png
│   │       ├── stage.png
│   │       └── crowd.png
│   │
│   ├── sounds/                            # Efeitos sonoros
│   │   ├── level1/
│   │   │   ├── transition.mp3
│   │   │   └── levelup.mp3
│   │   └── level2/
│   │       ├── transition.mp3
│   │       └── levelup.mp3
│   │
│   ├── music/                             # Músicas da playlist
│   │   ├── song1.mp3
│   │   └── song2.mp3
│   │
│   └── events/                            # Assets de eventos especiais
│       ├── kaiju.png
│       └── meteor.png
│
├── data/                                  # Dados persistentes
│   ├── app.db                             # SQLite database
│   └── logs/                              # Logs
│       └── app.log
│
├── docs/                                  # Documentação
│   ├── API.md
│   ├── SETUP.md
│   └── DEVELOPMENT.md
│
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
🔄 Fluxo de Dados Completo
1. Inicialização do Sistema
text
[App Start]
    ↓
[Load Config from DB]
    ↓
[Initialize Audio Engine] ← Load playlist
    ↓
[Load Levels from DB]
    ↓
[Start Socket.IO Server]
    ↓
[Frontend Connect via WebSocket]
    ↓
[Sync Initial State → Frontend]
    ↓
[Ready]
2. Durante a Live (Audio Flow)
text
[Song Playing in Audio Engine]
    ↓
[Web Audio API Analyser Node]
    ↓
[FFT Analysis] ─→ [Frequency Data]
    ↓                    ↓
[BPM Detection]    [Energy Calculation]
    ↓                    ↓
[Drop/Build Detection]   │
    ↓                    │
[Event Triggers] ←───────┘
    ↓
[+XP if configured]
    ↓
[Check Level Up]
    ↓
[If Level Up] → [Play Level Up Sound]
                      ↓
               [Emit 'level-up' event → Frontend]
3. Playlist Automation
text
[Song Ends]
    ↓
[Play Transition Sound] (mic feedback / crowd)
    ↓
[Get Next Song from Playlist]
    ↓
[If Loop && Last Song] → [Go to First Song]
    ↓
[Load and Play Next Song]
    ↓
[Emit 'song-changed' → Frontend]
    ↓
[Update "Now Playing" UI]
4. XP & Level System
text
[Event Happens] (audio drop, etc)
    ↓
[Calculate XP] (base + multipliers)
    ↓
[Add to Current XP]
    ↓
[Save to xp_history table]
    ↓
[Check if XP >= Next Level Threshold]
    ↓
[If Yes] → [Level Up Sequence]
               ↓
            [Current Level++]
               ↓
            [Load New Level Config]
               ↓
            [Play Level Up Sound]
               ↓
            [Emit Events → Frontend]
               ↓
            [Show Level Up Animation]
5. Editor Visual (Level Creation)
text
[User Creates/Edits Level in UI]
    ↓
[Upload Images to /assets/scenes/levelX/]
    ↓
[Select Sounds from /assets/sounds/levelX/]
    ↓
[Configure Layer Stack]
    ↓
[Set XP Threshold]
    ↓
[Live Preview Renders Layers]
    ↓
[User Clicks "Save"]
    ↓
[Validate Data]
    ↓
[Save to levels table]
    ↓
[Emit 'levels-updated' → All Connected Clients]
    ↓
[Update UI]
6. Manual Event Trigger
text
[User Clicks "Trigger Event" in UI]
    ↓
[Select Event from Dropdown]
    ↓
[Emit 'trigger-event' → Backend]
    ↓
[Load Event Config from DB]
    ↓
[Add Event Layers to Current Scene]
    ↓
[Play Event Sounds]
    ↓
[Start Timer (event.duration)]
    ↓
[After Duration] → [Remove Event Layers]
                       ↓
                    [Restore Normal Scene]
🎯 Roadmap de Desenvolvimento (MVP - 2 Níveis)
Sprint 1: Foundation (1 semana)
Objetivo: Setup do projeto + estrutura base

✅ Tasks:

 Setup Vite + React + TypeScript

 Install dependencies (Tailwind, shadcn/ui, Socket.IO, etc)

 Setup Express server

 Configure SQLite + migrations

 Create folder structure

 Setup theme (dark purple) + Tailwind config

 Create basic Layout component (Sidebar + Header)

 Implement routing (React Router)

Deliverable: Projeto rodando em localhost com layout básico

Sprint 2: Audio Engine (1 semana)
Objetivo: Sistema de reprodução e análise de áudio funcional

✅ Tasks:

 Implement Howler.js audio player

 Create AudioEngineController

 Implement Web Audio API analyser

 Build FFT visualization

 Implement BPM detection algorithm

 Create drop/build-up detection

 Test with sample MP3 files

 Build AudioPlayer UI component

 Build Waveform visualization

 Build FrequencyBars component

Deliverable: Player tocando músicas + análise visual funcionando

Sprint 3: Database & Level System (1 semana)
Objetivo: CRUD de níveis + sistema de XP

✅ Tasks:

 Create Level schema + repository

 Implement LevelService (CRUD)

 Create XPService (calculation + progression)

 Build API endpoints (/api/levels, /api/xp)

 Create LevelStore (Zustand)

 Build LevelList component

 Build LevelEditor basic form

 Implement level creation flow

 Test with 2 sample levels

Deliverable: Criar, editar e salvar 2 níveis no banco

Sprint 4: Playlist Manager (3-4 dias)
Objetivo: Gerenciamento de músicas funcional

✅ Tasks:

 Create Song schema + repository

 Implement PlaylistController

 Build file upload/import logic

 Extract metadata from MP3 (title, artist, duration)

 Implement drag-and-drop reordering (dnd-kit)

 Build PlaylistManager UI

 Build SongList + SongItem components

 Implement loop & shuffle logic

 Test with 5+ songs

Deliverable: Playlist funcional com reordenação

Sprint 5: Live Control Panel (1 semana)
Objetivo: Painel de controle durante live

✅ Tasks:

 Build LiveControl page layout

 Integrate AudioPlayer with playlist

 Build XPBar component

 Build LevelIndicator component

 Implement manual XP triggers (test mode)

 Build EventPanel UI

 Implement manual event trigger

 Create AudioAnalyzer display component

 Implement real-time metrics display

 Add hotkeys support (optional)

Deliverable: Controle completo da live em tempo real

Sprint 6: Layer System + Editor Visual (1 semana)
Objetivo: Editor drag-and-drop de camadas com preview

✅ Tasks:

 Design layer system architecture

 Build LayerManager component

 Implement drag-and-drop layers (dnd-kit)

 Build AssetPicker (browse files)

 Create LivePreview component

 Render layers in preview (Canvas ou CSS)

 Implement layer visibility toggle

 Implement layer reordering

 Connect to Level save flow

 Test with real images

Deliverable: Editor visual funcional com preview

Sprint 7: Sound System (3-4 dias)
Objetivo: Sons personalizados por nível

✅ Tasks:

 Implement multi-track audio (Howler.js)

 Create SoundManager service

 Build transition sound playback

 Build level-up sound playback

 Add sound pickers to Level Editor

 Implement volume controls (Music vs SFX)

 Test with sample sounds

 Add sound preview in editor

Deliverable: Sons tocando corretamente em cada evento

Sprint 8: Integration & Testing (3-4 dias)
Objetivo: Integrar tudo + testes end-to-end

✅ Tasks:

 Full integration test: Audio → XP → Level up

 Test playlist automation (loop, shuffle)

 Test audio triggers (drop detection → XP)

 Test manual controls

 Test editor → save → reload

 Fix bugs

 Performance optimization

 Add loading states

 Add error handling

Deliverable: Sistema completo funcionando com 2 níveis

Sprint 9: Polish & Documentation (2-3 dias)
Objetivo: Finalizar MVP

✅ Tasks:

 UI polish (animations, transitions)

 Add empty states

 Add tooltips

 Write README.md

 Write SETUP.md (tutorial de instalação)

 Write API.md (documentação endpoints)

 Record demo video

 Prepare assets de exemplo (2 níveis)

Deliverable: MVP pronto para uso

🧪 Modo Teste / Simulação
Features de Dev/Test
typescript
interface TestControls {
  // XP manual
  addXP(amount: number): void;
  setXP(amount: number): void;
  
  // Level
  forceLevelUp(): void;
  setLevel(level: number): void;
  
  // Audio triggers
  simulateAudioDrop(): void;
  simulateBuildUp(): void;
  
  // Events
  triggerRandomEvent(): void;
  triggerSpecificEvent(eventId: string): void;
  
  // Playlist
  skipToSong(index: number): void;
  
  // Reset
  resetSession(): void; // Zera XP, volta level 1
}
UI de Teste:

typescript
<TestPanel>
  <Toggle label="Test Mode" />
  
  {testMode && (
    <>
      <Section title="XP Controls">
        <Button onClick={() => addXP(10)}>+10 XP</Button>
        <Button onClick={() => addXP(50)}>+50 XP</Button>
        <Button onClick={() => addXP(100)}>+100 XP</Button>
        <Button onClick={forceLevelUp}>Force Level Up</Button>
      </Section>
      
      <Section title="Audio Triggers">
        <Button onClick={simulateAudioDrop}>Simulate Drop</Button>
        <Button onClick={simulateBuildUp}>Simulate Build Up</Button>
      </Section>
      
      <Section title="Events">
        <Button onClick={triggerRandomEvent}>Random Event</Button>
        <Select onChange={(e) => triggerEvent(e.id)}>
          {events.map(e => <Option key={e.id}>{e.name}</Option>)}
        </Select>
      </Section>
      
      <Button variant="destructive" onClick={resetSession}>
        Reset Session
      </Button>
    </>
  )}
</TestPanel>
📊 Métricas & Analytics
Dados Salvos por Sessão
typescript
interface LiveMetrics {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  duration: number; // segundos
  
  // Progression
  startLevel: number;
  finalLevel: number;
  totalXPEarned: number;
  
  // XP Sources breakdown
  xpSources: {
    audioDrops: number;
    audioBuildUps: number;
    manualTriggers: number; // modo teste
    // futuro: likes, subs, etc
  };
  
  // Songs played
  songsPlayed: {
    songId: string;
    title: string;
    startedAt: string;
    duration: number;
  }[];
  
  // Events triggered
  eventsTriggered: {
    eventId: string;
    name: string;
    triggeredAt: string;
    triggerType: 'manual' | 'random' | 'audio';
  }[];
  
  // Level transitions
  levelTransitions: {
    fromLevel: number;
    toLevel: number;
    timestamp: string;
    xpAtTransition: number;
  }[];
}
Visualizações
Line Chart: XP acumulado over time

Bar Chart: Eventos por tipo

Pie Chart: Fontes de XP (%)

Timeline: Eventos marcados na linha do tempo

Stats Cards: Totals (XP, duration, eventos, músicas)

🔌 API Endpoints (REST)
Levels
text
GET    /api/levels              # List all levels
GET    /api/levels/:id          # Get level by ID
POST   /api/levels              # Create level
PUT    /api/levels/:id          # Update level
DELETE /api/levels/:id          # Delete level
POST   /api/levels/reorder      # Update order
Events
text
GET    /api/events              # List all events
GET    /api/events/:id          # Get event by ID
POST   /api/events              # Create event
PUT    /api/events/:id          # Update event
DELETE /api/events/:id          # Delete event
Playlist
text
GET    /api/playlist            # Get current playlist
POST   /api/playlist/songs      # Add song
DELETE /api/playlist/songs/:id  # Remove song
PUT    /api/playlist/reorder    # Reorder songs
GET    /api/playlist/current    # Get current playing song
Live Control
text
POST   /api/live/start          # Start session
POST   /api/live/stop           # End session
GET    /api/live/status         # Get current status
POST   /api/live/xp/add         # Add XP (test mode)
POST   /api/live/level/force    # Force level change
POST   /api/live/event/trigger  # Trigger event manually
Config
text
GET    /api/config              # Get all config
PUT    /api/config              # Update config
Metrics
text
GET    /api/metrics/sessions    # List all sessions
GET    /api/metrics/sessions/:id # Get session details
GET    /api/metrics/export/:id  # Export session as JSON
🔄 WebSocket Events (Socket.IO)
Client → Server
typescript
// Audio control
'audio:play'
'audio:pause'
'audio:next'
'audio:previous'
'audio:seek' { time: number }
'audio:volume' { type: 'music' | 'sfx', volume: number }

// Live control
'live:start'
'live:stop'
'xp:add' { amount: number, source: string }
'level:force' { level: number }
'event:trigger' { eventId: string }

// Editor
'level:save' { level: Level }
'level:delete' { levelId: string }
Server → Client
typescript
// Audio state
'audio:state' { playing, paused, currentSong, progress, duration }
'audio:song-changed' { song: Song }
'audio:analysis' { bpm, energy, frequencyData }
'audio:drop-detected'
'audio:build-up-detected'

// Live state
'live:state' { 
  isLive, 
  currentLevel, 
  currentXP, 
  nextLevelXP, 
  progress 
}
'xp:added' { amount, source, newTotal }
'level:up' { fromLevel, toLevel, timestamp }

// Events
'event:triggered' { event: GameEvent }
'event:ended' { eventId: string }

// General
'error' { message: string, code: string }
'log' { level: 'info' | 'warn' | 'error', message: string }
🎨 Componentes shadcn/ui Necessários
bash
# Instalar shadcn/ui CLI
npx shadcn-ui@latest init

# Adicionar componentes
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add alert
🚀 Setup & Instalação
Pré-requisitos
text
- Node.js 20+ LTS
- OBS Studio 30+ (para transmitir a tela do app)
- Navegador moderno (Chrome/Edge recomendado)
Instalação Rápida
bash
# Clone/create project
git clone <repo> level-up-live
cd level-up-live

# Install dependencies
npm install

# Setup database
npm run db:migrate

# Setup environment
cp .env.example .env
# Editar .env com configs

# Start dev servers (frontend + backend)
npm run dev

# Abrir navegador
# http://localhost:5173
Estrutura .env
bash
# Server
PORT=3000
NODE_ENV=development

# Paths
ASSETS_PATH=./assets
DATA_PATH=./data
MUSIC_PATH=./assets/music
SCENES_PATH=./assets/scenes
SOUNDS_PATH=./assets/sounds

# Database
DATABASE_PATH=./data/app.db

# Audio
DEFAULT_MUSIC_VOLUME=0.7
DEFAULT_SFX_VOLUME=0.8

# XP Rates (test mode)
XP_RATE_AUDIO_DROP=2
XP_RATE_AUDIO_BUILD=1

# Future: Live Platforms (Pós-MVP)
# YOUTUBE_API_KEY=
# TWITCH_CLIENT_ID=
# TWITCH_CLIENT_SECRET=
📝 Package.json Scripts
json
{
  "name": "level-up-live",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "nodemon --exec tsx src/server/index.ts",
    "dev:client": "vite",
    
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    
    "start": "node dist/server/index.js",
    
    "db:migrate": "tsx src/server/database/migrate.ts",
    "db:seed": "tsx src/server/database/seed.ts",
    "db:reset": "rm -f data/app.db && npm run db:migrate && npm run db:seed",
    
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
⚡ Performance Considerations
Audio Processing
Use Web Workers para análise FFT pesada (não travar UI)​

Throttle eventos de análise (60fps max)

Cache BPM detection results

WebSocket
Batching de eventos (não enviar 1 msg por frame)

Debounce eventos rápidos (slider movement)

Reconnection logic com exponential backoff​

UI Rendering
Virtualize lista de playlist se > 100 músicas

Memoize componentes pesados (React.memo)

Use CSS transforms para animações (não layout)

Lazy load páginas com React.lazy()

Database
Index nas colunas de busca (order_num, session_id)

Batch inserts para xp_history

Vacuum periódico do SQLite​

🔒 Segurança & Validação
Input Validation
typescript
// Exemplo: Level creation
const levelSchema = z.object({
  name: z.string().min(1).max(50),
  xpThreshold: z.number().min(0).max(100000),
  layers: z.object({
    background: z.string().url(),
    // ... validar paths
  })
});
File Upload
Validar extensões (MP3, WAV, PNG, JPG apenas)

Limit file size (música: 50MB max, imagem: 10MB max)

Sanitize filenames

Store em pasta isolada (/assets)

OBS Connection
Validar senha OBS

Timeout de conexão (5s)

Retry logic com limit

🎁 Extras & Features Futuras (Pós-MVP)
Curto Prazo
Níveis 3-10: Escalar sistema pra 10 níveis completos

Mais eventos: Pool de 10+ eventos visuais

Sistema de votação: Chat escolhe eventos (simulado)

Hotkeys globais: Controle via teclado mesmo fora da app

Export/Import: Compartilhar configs entre usuários

Templates: Presets prontos ("Rock Show", "EDM Festival")

Médio Prazo
YouTube/Twitch API: Integração real com lives​

Multi-câmera: Trocar ângulos por nível

Chat overlay: Mostrar chat na tela com pixel art

Achievements: Sistema de conquistas (100 likes, 10 eventos, etc)

Instant Replay: Gravar momentos épicos

Longo Prazo
Cloud sync: Backup configs na nuvem

Mobile app: Controlar via celular

Multi-streamer: Vários streamers usando simultaneamente

Marketplace: Compartilhar assets/levels

Hardware integration: Luzes físicas, smoke machines via DMX/MIDI

🐛 Troubleshooting & Debug
Logs
typescript
// Winston logger config
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'data/logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'data/logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
Debug Panel (Dev Mode)
typescript
<DebugPanel>
  <Section title="WebSocket">
    <StatusIndicator connected={socketConnected} />
    <Badge>Ping: {ping}ms</Badge>
  </Section>
  
  <Section title="Audio">
    <Text>Playing: {currentSong?.title}</Text>
    <Text>BPM: {bpm}</Text>
    <Text>Energy: {energy}%</Text>
  </Section>
  
  <Section title="Performance">
    <Text>FPS: {fps}</Text>
    <Text>Memory: {memory}MB</Text>
  </Section>
</DebugPanel>
📚 Referências & Resources
Documentação Oficial
Web Audio API​

Socket.IO Docs​

shadcn/ui Components

Tailwind CSS

Tutoriais
BPM Detection algorithms

FFT analysis for music

Pixel art animation techniques​

Tools
Aseprite - Pixel art editor​

Audacity - Audio editing

DB Browser for SQLite - Database GUI​

✅ Checklist de Entrega MVP
Backend
 Express server rodando

 SQLite configurado + migrations

 Audio Engine reproduzindo músicas

 Análise de áudio (FFT, BPM) funcional

 Sistema de XP calculando corretamente

 Level up automático funcionando

 Socket.IO emitindo eventos

 2 níveis criados e salvos no DB

Frontend
 React app rodando

 Tema roxo escuro aplicado

 Layout com Sidebar + Header

 Todas as 6 páginas criadas

 Editor de níveis funcional

 Preview de cenas funcionando

 Playlist drag-and-drop

 Player de áudio controlável

 XP Bar animada

 Controles manuais (test mode)

Integração
 Frontend ↔ Backend via WebSocket

 Audio → Análise → XP → Level up (fluxo completo)

 Playlist → Auto-play → Transition sounds

 Editor → Save → Reload

Assets
 2 níveis com imagens (background, stage, crowd)

 Sons de transição (level 1 e 2)

 Sons de level up (level 1 e 2)

 5+ músicas de teste na pasta /music

Docs
 README.md com overview

 SETUP.md com tutorial instalação

 .env.example configurado

 Comentários no código crítico

🎬 Conclusão
Este PRD define um sistema modular, escalável e totalmente customizável para criar experiências de live musical gamificadas. O MVP com 2 níveis valida a arquitetura completa, permitindo escalar para 10+ níveis, múltiplos eventos, integrações com plataformas de streaming e features avançadas.​

Stack escolhida (TypeScript + React + Express + SQLite + Tailwind + shadcn/ui) garante desenvolvimento rápido, manutenibilidade e performance.​

Próximos passos: Executar Sprint 1 no Claude Code e começar a construir! 🚀

Versão: 1.0
Data: 29/10/2025
Autor: Roruh + AI Assistant
Status: Ready for Development 🎮🎸