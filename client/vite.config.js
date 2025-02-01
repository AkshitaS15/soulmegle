import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ensure this is the correct port for your frontend
    proxy: {
      "/socket.io": {
        target: "ws://localhost:4000", // Your WebSocket server
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
      }
    }
  }
});
