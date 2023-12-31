import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    host: "0.0.0.0",
    hmr: {
      port: 443,
    },
  },
  build: {
    outDir: "dist", // specify the output directory here, 'dist' by default
  },
  base: "/deck/",
});
