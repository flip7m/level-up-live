import axios, { AxiosInstance } from 'axios'

// Get backend URL - use current host but with port 8881
const getBackendURL = () => {
  if (import.meta.env.DEV) {
    // In dev, use same host as frontend with port 8881
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    return `http://${host}:8881`
  }
  // In production, use relative URLs (backend serves frontend on same port)
  return typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}` : ''
}

const baseURL = getBackendURL()

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 40000,  // Increased from 10000ms to accommodate stream initialization (Xvfb + Chromium + FFmpeg)
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Success: ${response.status}`)
    return response
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default apiClient
