import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add aliases if needed for complex import paths
      "@": "/src",
    },
  },
  // Ensure proper handling of various file types
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@fortawesome/fontawesome-free",
    ],
  },
});
