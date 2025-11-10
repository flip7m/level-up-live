import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: './src/client',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8882,
    proxy: {
      '/api': {
        target: 'http://localhost:8881',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8881',
        ws: true,
      },
      '/assets': {
        target: 'http://localhost:8881',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client/src'),
    },
  },
})
