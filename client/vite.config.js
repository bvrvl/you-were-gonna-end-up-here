// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This explicitly tells Vite to build into a 'dist' folder.
  // Vercel will look for this folder.
  build: {
    outDir: 'dist'
  }
})