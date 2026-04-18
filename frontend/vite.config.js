import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Listen on all interfaces so phones on the same Wi‑Fi can open http://<PC-LAN-IP>:5173
    // (needed together with VITE_PUBLIC_APP_ORIGIN for scannable check-in QR codes).
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
