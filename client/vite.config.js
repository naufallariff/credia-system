import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ⚠️ Perhatikan bagian ini dengan teliti
      '/api': {
        target: 'http://localhost:5000', // Pastikan backend jalan di 5000
        changeOrigin: true,
        secure: false,
      }
    }
  }
})