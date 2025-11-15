// Shared types between frontend and backend

export interface LayerTransform {
  path: string;
  x: number; // Position X in pixels (0 = left)
  y: number; // Position Y in pixels (0 = top)
  scale: number; // Scale factor (1 = 100%, 0.5 = 50%, 2 = 200%)
  rotation?: number; // Rotation in degrees (optional)
  opacity?: number; // Opacity 0-1 (optional)
}

export interface Level {
  id: string;
  order: number;
  name: string;
  description: string;
  xpThreshold: number;
  layers: {
    background: string;
    stage: string;
    crowd: string;
    effects: LayerTransform[];
  };
  sounds: {
    xpGain: string;        // Som quando ganha XP (+10, +50)
    drop: string;          // Som quando detecta drop na música
    buildUp: string;       // Som quando detecta build up
    levelUp: string;       // Som quando passa de nível
    viewerJoin: string;    // Som quando viewer entra na live
    transition: string;    // Som de transição entre níveis
    ambient?: string;      // Som ambiente do nível (opcional)
  };
  visualConfig: {
    transitionDuration: number;
    transitionEffect: 'fade' | 'slide' | 'zoom';
  };
  availableEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  filePath: string;
  filename: string;
  title: string;
  artist: string;
  duration: number;
  bpm?: number;
  playlistOrder?: number;
  addedAt: string;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'visual' | 'audio' | 'interactive';
  triggerType: 'manual' | 'random' | 'vote' | 'audio' | 'xp-milestone';
  triggerConfig: {
    probability?: number;
    cooldown?: number;
    minLevel?: number;
  };
  duration: number;
  // Procedural effects (Canvas-based)
  effectType?: 'confetti' | 'fireworks' | 'flash' | 'particle-burst' | 'rainbow-wave' | 'screen-shake';
  effectConfig?: {
    colors?: string[];
    particleCount?: number;
    intensity?: number;
  };
  // Traditional assets (image/video layers)
  assets?: {
    layers: SceneLayer[];
    sounds: string[];
  };
  voteOptions?: Array<{
    command: string;
    label: string;
  }>;
  createdAt: string;
}

export interface SceneLayer {
  id: string;
  name: string;
  type: 'image' | 'video' | 'browser' | 'text';
  order: number;
  source: string;
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

export interface Filter {
  type: string;
  value: number;
}

export interface XPConfig {
  sources: {
    audioDrop: number;
    audioBuildUp: number;
  };
  multipliers: {
    combo: number;
    timeBonus: number;
  };
}

export interface XPState {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  progress: number;
  totalXPEarned: number;
}

export interface XPEvent {
  timestamp: number;
  source: keyof XPConfig['sources'];
  amount: number;
  multiplier: number;
}

export interface LiveSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  totalDuration?: number;
  finalLevel?: number;
  totalXP?: number;
  metricsJson?: string;
}

export interface LiveMetrics {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  duration: number;
  startLevel: number;
  finalLevel: number;
  totalXPEarned: number;
  xpSources: {
    audioDrops: number;
    audioBuildUps: number;
    manualTriggers: number;
  };
  songsPlayed: Array<{
    songId: string;
    title: string;
    startedAt: string;
    duration: number;
  }>;
  eventsTriggered: Array<{
    eventId: string;
    name: string;
    triggeredAt: string;
    triggerType: 'manual' | 'random' | 'audio';
  }>;
  levelTransitions: Array<{
    fromLevel: number;
    toLevel: number;
    timestamp: string;
    xpAtTransition: number;
  }>;
}

export interface AudioAnalysis {
  frequencies?: number[];
  bpm?: number;
  energy?: number;
  bass?: number;
  mid?: number;
  treble?: number;
  dropsDetected?: boolean;
  buildUpDetected?: boolean;
}

export interface AudioEngineState {
  playing: boolean;
  paused: boolean;
  currentSongId?: string;
  progress: number;
  duration: number;
  bpm: number;
  energy: number;
  frequencyData: Uint8Array;
  analysis?: AudioAnalysis;
}

// Animation system removed - static layers only
