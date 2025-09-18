// vite.config.js
import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: {
      "/api/tour": {
        target: "https://apis.data.go.kr/B551011/KorService2",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/tour/, ""),
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
        secure: false,
        rewrite: p => p.replace(/^\/api/, ""), // /api/auth/... → /auth/...
      },
    }
  }
});