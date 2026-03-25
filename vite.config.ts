import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api/gnews?q=... → https://news.google.com/rss/search?q=...
      '/api/gnews': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/gnews/, '/rss/search'),
      },
    },
  },
})
