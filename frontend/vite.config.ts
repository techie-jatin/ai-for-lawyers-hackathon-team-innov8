import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('clientLegalEngine')) {
            return 'legal-engine';
          }
          if (id.includes('clientConstitutionEngine') || id.includes('constitutionComplete')) {
            return 'constitution-engine';
          }
          if (id.includes('clientSeniorAdvocateBrain')) {
            return 'advocate-brain';
          }
        }
      }
    }
  }
})
