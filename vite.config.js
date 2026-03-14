import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// tailwindcss plugin is actually not required in Vite v4+, but if you want it for your setup, we include it
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite Configuration
 * - React plugin for JSX/TSX support
 * - TailwindCSS plugin integration
 * - Path alias '@' -> 'src' for cleaner imports
 */
export default defineConfig({
  plugins: [
    react(),      // React support (JSX/TSX)
    tailwindcss() // Tailwind integration
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // allows using "@/..." as a path shortcut
    },
  },
  server: {
    port: 5173,      // You can change dev server port if needed
    open: true,      // Automatically open browser on start
    strictPort: false,
    hmr: {
      overlay: true, // show error overlay in browser
    },
  },
  build: {
    outDir: 'dist',        // Output directory
    sourcemap: true,       // Generate sourcemaps for debugging
    rollupOptions: {
      output: {
        manualChunks: undefined, // Optional: configure code splitting if needed
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react', // pre-bundle lucide-react for faster HMR
    ],
  },
});
