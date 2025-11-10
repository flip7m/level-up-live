import io, { Socket } from 'socket.io-client'

// Get backend URL - use current host but with port 8881
const getBackendURL = () => {
  if (import.meta.env.DEV) {
    // In dev, connect to backend using same host as frontend
    const host = window.location.hostname
    return `http://${host}:8881`
  }
  return ''
}

const baseURL = getBackendURL()

let socket: Socket | null = null

export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket
  }

  socket = io(baseURL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected')
  })

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error)
  })

  return socket
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error('Socket not connected. Call connectSocket() first.')
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}

export function emit(event: string, data?: any): void {
  const s = getSocket()
  console.log(`[Socket] Emit: ${event}`, data)
  s.emit(event, data)
}

export function on(event: string, callback: (...args: any[]) => void): void {
  const s = getSocket()
  s.on(event, callback)
}

export function off(event: string, callback: (...args: any[]) => void): void {
  const s = getSocket()
  s.off(event, callback)
}
