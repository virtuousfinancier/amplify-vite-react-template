/**
 * @file src/main.tsx
 * @fileoverview Application entry point and root rendering
 * 
 * @description
 * Main entry point for the Options Matrix Analytics application.
 * Handles:
 * - React root creation and mounting
 * - StrictMode configuration
 * - Global style imports
 * - Root error boundary
 * 
 * This file is responsible for bootstrapping the React application
 * and setting up the root rendering context.
 * 
 * @usage
 * This is the entry point specified in vite.config.ts.
 * It's automatically used when running:
 * ```bash
 * npm run dev
 * # or
 * npm run build
 * ```
 * 
 * @dependencies
 * - react: Core React library
 * - react-dom/client: React DOM rendering
 * - App: Root application component
 * - index.css: Global styles
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC
 * @lastModified Wednesday, January 1, 2025
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * @function assertElementExists
 * @description Type-safe assertion for root element existence
 * 
 * @param {HTMLElement | null} element - Element to check
 * @throws {Error} If element doesn't exist
 * @returns {HTMLElement} The validated element
 */
const assertElementExists = (element: HTMLElement | null): HTMLElement => {
  if (!element) {
    throw new Error(
      'Root element not found. Ensure there is a <div id="root"> in index.html'
    );
  }
  return element;
};

/**
 * Application root element
 * @constant
 * @type {HTMLElement}
 * @throws {Error} If root element is not found
 */
const rootElement = assertElementExists(document.getElementById('root'));

// Create and configure React root
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);