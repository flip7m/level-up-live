import { useEffect, useRef, useCallback } from 'react'
import { Howl, Howler } from 'howler'
import { useAudioStore } from '../stores/audioStore'
import { usePlaylist } from './usePlaylist'

export function useHowlerAudio() {
  const soundRef = useRef<Howl | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const {
    setPlaying,
    setCurrentSong,
    setProgress,
    setVolume,
  } = useAudioStore()
  const {
    songs,
    currentSong,
    getNextSong,
    setCurrentSong: setCurrentPlaylistSong,
  } = usePlaylist()

  // Clean up old audio and interval when component unmounts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
        soundRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Update progress bar during playback
  const updateProgress = useCallback(() => {
    if (soundRef.current && soundRef.current.playing()) {
      const progress = soundRef.current.seek() as number
      setProgress(progress)
    }
  }, [setProgress])

  // Play a song
  const play = useCallback(
    async (filePath: string, duration: number = 0) => {
      try {
        // Unload previous sound
        if (soundRef.current) {
          soundRef.current.unload()
        }

        // Create absolute path for audio file
        const audioUrl = `/assets/music/${filePath}`

        // Create new Howl instance
        soundRef.current = new Howl({
          src: [audioUrl],
          html5: true, // Use HTML5 audio for better compatibility
          volume: useAudioStore.getState().musicVolume,
          onload: () => {
            console.log('Audio loaded:', filePath)
          },
          onplay: () => {
            setPlaying(true)
            console.log('Playing:', filePath)
          },
          onpause: () => {
            setPlaying(false)
          },
          onstop: () => {
            setPlaying(false)
            setProgress(0)
          },
          onend: () => {
            console.log('Song ended:', filePath)
            setPlaying(false)
            // Play next song from playlist
            const nextSong = getNextSong()
            if (nextSong) {
              setCurrentPlaylistSong(nextSong)
              play(nextSong.filename, nextSong.duration)
            }
          },
          onloaderror: (soundId, error) => {
            console.error('Error loading audio:', error, 'File:', filePath)
          },
          onplayerror: (soundId, error) => {
            console.error('Error playing audio:', error, 'File:', filePath)
          },
        })

        // Play the sound
        soundRef.current.play()

        // Start progress update interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        progressIntervalRef.current = setInterval(updateProgress, 100)
      } catch (error) {
        console.error('Failed to play audio:', error)
      }
    },
    [setPlaying, setProgress, getNextSong, setCurrentPlaylistSong, updateProgress]
  )

  // Pause
  const pause = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause()
      setPlaying(false)
    }
  }, [setPlaying])

  // Resume
  const resume = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.play()
      setPlaying(true)
      // Restart progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      progressIntervalRef.current = setInterval(updateProgress, 100)
    }
  }, [setPlaying, updateProgress])

  // Stop
  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop()
      setPlaying(false)
      setProgress(0)
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
  }, [setPlaying, setProgress])

  // Seek to position
  const seek = useCallback((time: number) => {
    if (soundRef.current) {
      soundRef.current.seek(time)
      setProgress(time)
    }
  }, [setProgress])

  // Set volume
  const setAudioVolume = useCallback(
    (type: 'music' | 'sfx', volume: number) => {
      setVolume(type, volume)
      if (type === 'music' && soundRef.current) {
        soundRef.current.volume(volume)
      }
    },
    [setVolume]
  )

  return {
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume: setAudioVolume,
  }
}
