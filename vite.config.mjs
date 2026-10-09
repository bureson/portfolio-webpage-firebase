import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // same origin as the old react-scripts dev server, so the Google Maps
    // key's referrer allowlist and Firebase auth domains keep matching
    port: 3000
  },
  build: {
    // firebase.json deploys from build/, same as the old react-scripts output
    outDir: 'build'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js'
  }
});
