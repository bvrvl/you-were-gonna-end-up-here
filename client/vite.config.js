// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite that any request starting with /api
      // should be sent to your backend server on port 3001.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  }
})