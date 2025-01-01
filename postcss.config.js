/**
 * @file postcss.config.js
 * @fileoverview PostCSS configuration for CSS processing
 * 
 * @description
 * Configures PostCSS plugins for CSS processing:
 * - Tailwind CSS integration
 * - Autoprefixer for cross-browser compatibility
 * - CSS optimization pipeline
 * 
 * @dependencies
 * - tailwindcss: Utility-first CSS framework
 * - autoprefixer: Automatic vendor prefix handling
 * 
 * @usage
 * This config is automatically used by the build process.
 * It integrates with both development and production builds.
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC
 * @lastModified Wednesday, January 1, 2025
 */

export default {
  plugins: {
    // Process Tailwind directives
    tailwindcss: {},
    // Add vendor prefixes
    autoprefixer: {},
  },
}