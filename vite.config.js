import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base:'/',
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          bootstrap: ["bootstrap", "react-bootstrap"],
          router: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    historyApiFallback: true,
    host: true,
    port: 5173,
    strictPort: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "bootstrap", "react-bootstrap"],
  },
})
