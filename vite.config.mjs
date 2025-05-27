import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "./public",
  build: {
    outDir: "./frontend-build",
  },
  plugins: [
    TanStackRouterVite({ 
      autoCodeSplitting: true,
      quotesStyle: "double",
      routesDirectory: "./client/routes",
      generatedRouteTree: "./client/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
    }), 
    viteReact(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
