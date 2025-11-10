import { useLiveStore } from '../../stores/liveStore'
import './XPBar.css'

export function XPBar() {
  const { currentXP, progress } = useLiveStore()

  // Safe progress value (avoid NaN)
  const safeProgress = isNaN(progress) || !isFinite(progress) ? 0 : progress
  const displayProgress = Math.min(Math.max(safeProgress, 0), 100)

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-label">Progresso de XP</div>
      <div className="xp-bar-wrapper">
        <div className="xp-bar-background">
          <div
            className="xp-bar-fill"
            style={{ width: `${displayProgress}%` }}
          >
            <div className="xp-bar-glow"></div>
          </div>
        </div>
        <div className="xp-bar-text">{Math.round(displayProgress)}%</div>
      </div>
      <div className="xp-bar-current">{currentXP} XP</div>
    </div>
  )
}
