-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_num INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  xp_threshold INTEGER NOT NULL,
  layers_json JSONB NOT NULL,
  sounds_json JSONB NOT NULL,
  visual_config_json JSONB NOT NULL,
  available_events_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config_json JSONB NOT NULL,
  duration INTEGER NOT NULL,
  assets_json JSONB NOT NULL,
  vote_options_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs (playlist) table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  duration NUMERIC(10,2) NOT NULL,
  bpm INTEGER,
  playlist_order INTEGER,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live Sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  total_duration INTEGER,
  final_level INTEGER,
  total_xp INTEGER,
  metrics_json JSONB
);

-- XP History table
CREATE TABLE IF NOT EXISTS xp_history (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  multiplier NUMERIC(5,2) DEFAULT 1.0,
  current_level INTEGER NOT NULL,
  current_xp INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE
);

-- Config table
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(order_num);
CREATE INDEX IF NOT EXISTS idx_songs_playlist_order ON songs(playlist_order);
CREATE INDEX IF NOT EXISTS idx_xp_history_session ON xp_history(session_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_timestamp ON xp_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_live_sessions_started ON live_sessions(started_at);
