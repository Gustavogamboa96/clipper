import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output folder for the production build
    target: 'es2020',  // Recommended target for modern browsers and Electron
    minify: 'esbuild', // Minification
  },
})
