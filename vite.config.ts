import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "opengraph.jpg"],
      manifest: {
        name: "C.O.S.T. - Joc de Educație Financiară",
        short_name: "C.O.S.T.",
        description: "Învață să-ți gestionezi banii într-un mod interactiv și distractiv.",
        theme_color: "#7c3aed",
        background_color: "#0d0820",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/favicon.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/favicon.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,jpg,png}"],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  preview: {
    allowedHosts: ["c-o-s-t.onrender.com"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/__tests__/setup.ts",
    css: true,
  },
});
