-- Migration: Update Level Sounds Structure
-- Date: 2025-10-30
-- Description: Expand sounds_json to include 7 sound types (xpGain, drop, buildUp, levelUp, viewerJoin, transition, ambient)

-- Backup existing sounds_json column
ALTER TABLE levels ADD COLUMN IF NOT EXISTS sounds_json_backup JSONB;
UPDATE levels SET sounds_json_backup = sounds_json WHERE sounds_json_backup IS NULL;

-- Update all levels to new sounds structure
-- Migrate existing levelUp and transition, add new fields with empty strings
UPDATE levels
SET sounds_json = jsonb_build_object(
  'xpGain', '',
  'drop', '',
  'buildUp', '',
  'levelUp', COALESCE(sounds_json->>'levelUp', ''),
  'viewerJoin', '',
  'transition', COALESCE(sounds_json->>'transition', ''),
  'ambient', sounds_json->>'ambient'
);

-- Add comment to document the new structure
COMMENT ON COLUMN levels.sounds_json IS 'JSONB object with 7 sound types: xpGain, drop, buildUp, levelUp, viewerJoin, transition, ambient';
