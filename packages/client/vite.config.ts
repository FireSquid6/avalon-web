import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import mdx from "@mdx-js/rollup";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter(),
    react(),
    mdx(),
  ],
})
