import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/ProyectoFinal_2025IIg2_Jimenez_Jean_Y_Bautista_Jaider/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('@mui')) {
              return 'mui';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
