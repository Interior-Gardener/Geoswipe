import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable React refresh for better development experience
    include: "**/*.{jsx,tsx}",
  })],
  
  // Optimize build
  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', 'three-globe'],
          'utils': ['socket.io-client']
        }
      }
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Optimize assets
    assetsDir: 'assets',
    
    // Enable minification
    minify: 'esbuild',
    
    // Target modern browsers for better performance
    target: 'es2020'
  },
  
  // Development server optimization
  server: {
    port: 5173,
    // The server's CORS allowlist is keyed to specific origins. Vite's default
    // behaviour on a busy port is to silently move to 5174, which then fails
    // every API call with an opaque CORS error instead of an obvious one - so
    // fail loudly here instead. If this errors, something is already on 5173:
    // run `npm run kill-ports` from the repo root.
    strictPort: true,
    // SECURITY: `host: true` binds the dev server to every network interface,
    // exposing it (and anything it serves) to the whole local network. Vite's
    // dev server has had several arbitrary-file-read advisories, so it stays on
    // loopback unless explicitly opted into with `vite --host`.
    host: 'localhost',
    open: true,
    // Enable HMR for better development experience
    hmr: {
      overlay: true
    }
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: 'localhost'
  },
  
  // Asset optimization
  assetsInclude: ['**/*.glsl'],
  
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'three',
      'socket.io-client'
    ],
    exclude: [
      'dat.gui' // Keep dat.gui external for better performance
    ]
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  }
})
