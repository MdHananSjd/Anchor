import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Necessary for Docker
    port: 5173,
    watch: {
      usePolling: true, // Sometimes needed for Docker on macOS/Windows
    },
    proxy: {
      '/predict': {
        target: 'http://api:8000', // Points to the 'api' service in the same Docker network
        changeOrigin: true,
      }
    }
  }
})
