-- Add procedural effect support to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS effect_type TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS effect_config_json JSONB;

-- Make assets_json nullable (events can have either assets OR procedural effects)
ALTER TABLE events ALTER COLUMN assets_json DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN events.effect_type IS 'Procedural effect type: confetti, fireworks, flash, particle-burst, rainbow-wave, screen-shake';
COMMENT ON COLUMN events.effect_config_json IS 'Configuration for procedural effects (colors, particle count, intensity, etc.)';
