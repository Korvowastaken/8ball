import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  return {
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/live-matches': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => '/matches' + path.replace(/^\/api\/live-matches/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const apiKey = env.VITE_FOOTBALL_DATA_API_KEY;
            console.log('Using API Key:', apiKey ? 'present' : 'missing');
            console.log('API Key value:', apiKey);
            console.log('API Key length:', apiKey?.length);
            if (apiKey) {
              proxyReq.setHeader('X-Auth-Token', apiKey);
            }
          });
        },
        secure: true,
      },
      '/api/football-data': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/football-data/, ''),
        secure: true,
      },
    },
  },
  }
})
