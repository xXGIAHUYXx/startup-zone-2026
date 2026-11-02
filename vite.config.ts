import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Vercel/Netlify/Cloudflare: để mặc định '/'.
  // GitHub Pages: workflow tự truyền VITE_BASE = '/<tên-repo>/'.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
