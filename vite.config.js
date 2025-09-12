// vite.config.js
import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: {
      "/api/tour": {
        target: "https://apis.data.go.kr/B551011/KorService2",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/tour/, ""),
      }
    }
  }
});