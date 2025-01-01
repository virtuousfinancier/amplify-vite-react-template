/**
 * @file tailwind.config.js
 * @fileoverview Tailwind CSS configuration
 * 
 * @description
 * Configures Tailwind CSS for the project:
 * - Custom font families
 * - Content paths for purging
 * - Theme customization
 * - Plugin integrations
 * 
 * @dependencies
 * - tailwindcss: Core framework
 * - Custom fonts: Inter and Barlow
 * 
 * @customization
 * - Fonts: Custom font family configurations
 * - Content: Path specifications for purging
 * - Theme: Extended design tokens
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC
 * @lastModified Wednesday, January 1, 2025
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Define paths for content analysis
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Theme customization
  theme: {
    extend: {
      // Custom font family definitions
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'barlow': ['Barlow', 'sans-serif'],
      },
    },
  },
  
  // Additional plugins (none currently)
  plugins: [],
}