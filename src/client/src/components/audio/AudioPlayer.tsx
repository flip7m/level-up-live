import { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react'
import { useHowlerAudio } from '../../hooks/useHowlerAudio'
import { useAudioStore } from '../../stores/audioStore'
import { usePlaylist } from '../../hooks/usePlaylist'
import { formatDuration } from '../../lib/utils'
import './AudioPlayer.css'

export function AudioPlayer() {
  const { play, pause, resume, stop, seek, setVolume } = useHowlerAudio()
  const {
    playing,
    paused,
    currentSong,
    progress,
    duration,
    musicVolume,
  } = useAudioStore()
  const { getNextSong, songs, setCurrentSong } = usePlaylist()
  const [displayTime, setDisplayTime] = useState('0:00')
  const [displayDuration, setDisplayDuration] = useState('0:00')

  useEffect(() => {
    setDisplayTime(formatDuration(progress))
    setDisplayDuration(formatDuration(duration))
  }, [progress, duration])

  const handlePlayPause = () => {
    if (playing) {
      pause()
    } else if (paused) {
      resume()
    } else if (currentSong) {
      // Use filename for Howler.js path
      play(currentSong.filename, currentSong.duration)
    }
  }

  const handleStop = () => {
    stop()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    seek(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume('music', newVolume)
  }

  const handleSkipNext = () => {
    if (!currentSong || songs.length === 0) return

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % songs.length
    const nextSong = songs[nextIndex]

    setCurrentSong(nextSong)
    play(nextSong.filename, nextSong.duration)
  }

  const handleSkipPrev = () => {
    if (!currentSong || songs.length === 0) return

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
    if (currentIndex === -1) return

    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    const prevSong = songs[prevIndex]

    setCurrentSong(prevSong)
    play(prevSong.filename, prevSong.duration)
  }

  return (
    <div className="audio-player">
      {/* Song Info */}
      <div className="audio-player-info">
        {currentSong ? (
          <>
            <div className="song-title">{currentSong.title || 'Untitled'}</div>
            <div className="song-artist">{currentSong.artist || 'Unknown Artist'}</div>
          </>
        ) : (
          <div className="song-title">No song selected</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <span className="time-display">{displayTime}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="progress-bar"
          disabled={!currentSong}
        />
        <span className="time-display">{displayDuration}</span>
      </div>

      {/* Controls */}
      <div className="audio-controls">
        <button
          onClick={handleSkipPrev}
          className="control-btn"
          title="Previous"
          disabled={!currentSong}
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={handlePlayPause}
          className="control-btn play-btn"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={handleStop}
          className="control-btn"
          title="Stop"
          disabled={!currentSong}
        >
          <X size={20} />
        </button>

        <button
          onClick={handleSkipNext}
          className="control-btn"
          title="Next"
          disabled={!currentSong}
        >
          <SkipForward size={20} />
        </button>

        <div className="volume-control">
          <Volume2 size={18} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title="Volume"
          />
          <span className="volume-percentage">
            {Math.round(musicVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
