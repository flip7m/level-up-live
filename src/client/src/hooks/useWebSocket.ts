import { useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Connect to Socket.IO server - use current host with port 8881
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const url = `http://${host}:8881`

    socketRef.current = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      console.log(`[WebSocket] ✅ Connected to server (Socket ID: ${socketRef.current?.id})`)
      // Update state when socket connects
      setSocket(socketRef.current)
    })

    socketRef.current.on('disconnect', () => {
      console.log('[WebSocket] ❌ Disconnected from server')
      setSocket(null)
    })

    socketRef.current.on('error', (error) => {
      console.error('[WebSocket] ⚠️ Error:', error)
    })

    // Debug: Log all incoming events
    socketRef.current.onAny((eventName, ...args) => {
      console.log(`[WebSocket] 📥 Received event: ${eventName}`, args)
    })

    // Set initial socket reference
    setSocket(socketRef.current)

    // Cleanup on unmount
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return socket
}
