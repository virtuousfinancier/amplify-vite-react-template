/**
 * @file vite.config.ts
 * @fileoverview Vite build configuration
 * 
 * @description
 * Configures Vite for development and production:
 * - React plugin integration
 * - Path aliases
 * - Build optimization
 * - Development server settings
 * 
 * @dependencies
 * - vite: Build tool
 * - @vitejs/plugin-react: React integration
 * - path: Node.js path module
 * 
 * @configuration
 * - Plugins: React integration
 * - Resolve: Path aliases (@/ -> ./src/)
 * - Build: Production optimizations
 * 
 * @usage
 * Development:
 * ```bash
 * npm run dev
 * ```
 * Production build:
 * ```bash
 * npm run build
 * ```
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC
 * @lastModified Wednesday, January 1, 2025
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Configure plugins
  plugins: [react()],
  
  // Configure path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})