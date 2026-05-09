import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: 5174,
  },
  define: {
    'process.env': {}
  }
})
