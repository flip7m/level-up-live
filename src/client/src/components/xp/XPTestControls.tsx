import { useXPSystem } from '../../hooks/useXPSystem'
import { Users, Heart, UserPlus, DollarSign } from 'lucide-react'
import './XPTestControls.css'

// Play sound effect
const playSound = (filename: string) => {
  const audio = new Audio(`/assets/sounds/${filename}`)
  audio.volume = 0.5
  audio.play().catch((err) => console.error('Failed to play sound:', err))
}

export function XPTestControls() {
  const { addFixedXP, resetSession } = useXPSystem()

  const handleViewer = () => {
    addFixedXP(10)
    playSound('viewers/viewers.mp3')
  }

  const handleLike = () => {
    addFixedXP(20)
    playSound('xp/xp.mp3')
  }

  const handleInscrito = () => {
    addFixedXP(50)
    playSound('drops/drop.mp3')
  }

  const handleDonate = async () => {
    // Donate gives enough XP to level up (get next level XP amount)
    addFixedXP(100) // Force level up with 100 XP
    playSound('levelups/level-up.mp3')
  }

  return (
    <div className="xp-test-controls">
      <h3 className="test-controls-title">Controles de Teste</h3>

      <div className="test-controls-grid">
        {/* Viewer - 10 XP */}
        <button
          onClick={handleViewer}
          className="test-btn test-btn-viewer"
          title="Viewer - 10 XP"
        >
          <Users size={16} />
          Viewer
        </button>

        {/* Like - 20 XP */}
        <button
          onClick={handleLike}
          className="test-btn test-btn-like"
          title="Like - 20 XP"
        >
          <Heart size={16} />
          Like
        </button>

        {/* Inscrito - 50 XP */}
        <button
          onClick={handleInscrito}
          className="test-btn test-btn-inscrito"
          title="Inscrito - 50 XP"
        >
          <UserPlus size={16} />
          Inscrito
        </button>

        {/* Donate - Level Up */}
        <button
          onClick={handleDonate}
          className="test-btn test-btn-donate"
          title="Donate - Level Up"
        >
          <DollarSign size={16} />
          Donate
        </button>

        {/* Reset */}
        <button
          onClick={() => resetSession()}
          className="test-btn test-btn-reset"
          title="Resetar sessão XP"
        >
          ↻ Resetar Sessão
        </button>
      </div>
    </div>
  )
}
