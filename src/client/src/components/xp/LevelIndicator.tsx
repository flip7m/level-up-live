import { useLiveStore } from '../../stores/liveStore'
import { Trophy } from 'lucide-react'
import './LevelIndicator.css'

export function LevelIndicator() {
  const { currentLevel, comboCount, nextLevelXP } = useLiveStore()

  return (
    <div className="level-indicator-container">
      <div className="level-badge">
        <Trophy className="trophy-icon" />
        <div className="level-number">{currentLevel}</div>
      </div>

      <div className="level-info">
        <div className="level-label">Current Level</div>
        <div className="level-title">LEVEL {currentLevel}</div>
        <div className="level-threshold">Meta Próximo Nível: {nextLevelXP} XP</div>

        {comboCount > 0 && (
          <div className="combo-display">
            <div className="combo-label">Combo</div>
            <div className="combo-value">×{comboCount}</div>
          </div>
        )}
      </div>
    </div>
  )
}
