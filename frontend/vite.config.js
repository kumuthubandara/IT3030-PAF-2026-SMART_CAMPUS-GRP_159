import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devBindHost = String(env.VITE_DEV_BIND_HOST ?? "").trim();
  // `host: true` = listen on every NIC → Vite prints several "Network" lines (Hyper-V, VPN, Wi‑Fi, etc.). Normal on Windows.
  // Set VITE_DEV_BIND_HOST to your real Wi‑Fi IPv4 (e.g. 192.168.8.116) in `.env` to show one Network URL only.
  const host = devBindHost || true;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host,
      proxy: {
        "/api": {
          target: "http://localhost:8081",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host,
      proxy: {
        "/api": {
          target: "http://localhost:8081",
          changeOrigin: true,
        },
      },
    },
  };
});
