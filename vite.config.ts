import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const coopHeadersPlugin = () => ({
  name: "coop-headers",
  configureServer(server: any) {
    server.middlewares.use((_req: any, res: any, next: any) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    coopHeadersPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    allowedHosts: ["c-o-s-t.onrender.com"],
  },
});