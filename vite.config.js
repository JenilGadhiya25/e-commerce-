import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        "src": "/(.*)", 
        "dest": "/api/$1",
      },
    },
    port: 5175,
  },
});
