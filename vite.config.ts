import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const extraHost = env.ALLOWED_HOST || env.VITE_ALLOWED_HOST

  return {
    plugins: [react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]]
      }
    })],
    server: {
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        ...(extraHost ? [extraHost] : []),
      ].filter(Boolean), // filter out empty strings
    },
  }
})