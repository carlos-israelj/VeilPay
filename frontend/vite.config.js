import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'events', 'util', 'stream', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 3000
  },
  optimizeDeps: {
    exclude: ['snarkjs']
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      events: 'events',
      util: 'util',
    }
  },
  build: {
    // Ensure large files (WASM, zkey) are not inlined
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Keep circuit files in their own folder
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.wasm') || assetInfo.name.endsWith('.zkey')) {
            return 'circuits/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: 'public'
});
