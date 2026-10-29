import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve el sitio en https://carrapido.github.io/perfiles-participacion-ine/
  // https://vite.dev/guide/static-deploy.html#github-pages
  base: '/perfiles-participacion-ine/',
  plugins: [react()],
})
