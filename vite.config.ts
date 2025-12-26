import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng: Đặt base là './' để assets tải đúng trên GitHub Pages (thư mục con)
  build: {
    outDir: 'dist',
  }
});