import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // THÊM DÒNG NÀY
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // KÍCH HOẠT TẠI ĐÂY
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
