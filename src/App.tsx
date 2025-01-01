/**
 * @file src/App.tsx
 * @fileoverview Main application component for the Options Matrix Analytics tool
 * 
 * @description
 * This is the root component of the Options Matrix Analytics application.
 * It handles the main layout structure and API key validation, providing
 * the core container for the volatility surface visualization.
 * 
 * Key responsibilities:
 * - API key validation and management
 * - Global layout and styling
 * - Error boundary for API key issues
 * - Main routing and component composition
 * 
 * @usage
 * This component is used as the root in main.tsx:
 * ```tsx
 * createRoot(document.getElementById('root')!).render(
 *   <StrictMode>
 *     <App />
 *   </StrictMode>
 * );
 * ```
 * 
 * @dependencies
 * - VolatilitySurface: Main data visualization component
 * - Environment variables: Requires VITE_POLYGON_API_KEY
 * - Assets: Logo files for branding
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import React from 'react';
import VolatilitySurface from './components/VolatilitySurface';
import vfiPNG from './assets/virtuousfinance-icon-500x500px.png';
import vfiSVG from '/virtuousfinance-icon-500x500px.svg';

/**
 * @interface APIKeyError
 * @description Custom error type for API key validation failures
 * @property {string} message - Error message
 * @property {string} name - Error type name
 */
class APIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIKeyError';
  }
}

/**
 * Validates and retrieves the Polygon API key from environment variables
 * 
 * @function getApiKey
 * @description
 * Retrieves and validates the Polygon API key from environment variables.
 * Implements strict validation to ensure the key is properly configured.
 * 
 * @throws {APIKeyError} When API key is missing or invalid
 * @returns {string} Valid Polygon API key
 * 
 * @example
 * ```typescript
 * try {
 *   const apiKey = getApiKey();
 *   // Use apiKey for API calls
 * } catch (error) {
 *   if (error instanceof APIKeyError) {
 *     // Handle missing/invalid API key
 *   }
 * }
 * ```
 */
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
  
  if (!apiKey) {
    throw new APIKeyError(
      'Polygon API key not found. Please add VITE_POLYGON_API_KEY to your .env file.'
    );
  }

  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new APIKeyError('Invalid Polygon API key format.');
  }

  return apiKey;
};

/**
 * @component HeaderLogo
 * @description Renders the application logo in the header
 * @prop {string} src - Source URL for the logo image
 * @prop {string} alt - Alt text for the logo
 * 
 * @example
 * ```tsx
 * <HeaderLogo src={logoSrc} alt="Company Logo" />
 * ```
 */
const HeaderLogo: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="w-13 h-13 bg-white rounded-full flex items-center justify-center">
    <img 
      src={src} 
      className="w-12 h-12" 
      alt={alt}
    />
  </div>
);

/**
 * @component App
 * @description
 * Root component of the Options Matrix Analytics application.
 * Provides the main layout structure and handles API key validation.
 * 
 * Visual Structure:
 * - Header with logo
 * - Main content area with title and VolatilitySurface
 * - Footer with logo
 * 
 * @throws {APIKeyError} When API key validation fails
 * 
 * @example
 * ```tsx
 * <StrictMode>
 *   <App />
 * </StrictMode>
 * ```
 */
const App: React.FC = () => {
  // Validate API key on component initialization
  const apiKey = getApiKey();

  return (
    <div className="min-h-screen bg-[#1C1531] text-white">
      {/* Header Section */}
      <header className="py-8">
        <div className="container mx-auto flex justify-center">
          <HeaderLogo 
            src={vfiSVG} 
            alt="Virtuous Finance Logo"
          />
        </div>
      </header>

      {/* Main Content Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-center font-inter uppercase tracking-wide">
            OPTIX
          </h1>
          
          {/* Volatility Surface Container */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <VolatilitySurface apiKey={apiKey} />
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="py-8">
        <div className="container mx-auto flex justify-center">
          <HeaderLogo 
            src={vfiPNG}
            alt="Virtuous Finance Icon"
          />
        </div>
      </footer>
    </div>
  );
};

export default App;