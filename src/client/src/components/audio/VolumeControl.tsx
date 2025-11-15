import { Volume2, VolumeX } from 'lucide-react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAudioStore } from '../../stores/audioStore'
import './VolumeControl.css'

export function VolumeControl() {
  const { setVolume } = useAudioEngine()
  const { musicVolume } = useAudioStore()

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleMute = () => {
    setVolume(musicVolume > 0 ? 0 : 1)
  }

  return (
    <div className="volume-control-standalone">
      <button
        onClick={handleMute}
        className="volume-mute-btn"
        title={musicVolume > 0 ? 'Mute' : 'Unmute'}
      >
        {musicVolume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      <div className="volume-slider-wrapper">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={musicVolume}
          onChange={handleVolumeChange}
          className="volume-slider-standalone"
          title="Volume"
        />
      </div>

      <span className="volume-percentage-standalone">
        {Math.round(musicVolume * 100)}%
      </span>
    </div>
  )
}
