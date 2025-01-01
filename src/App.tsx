/**
 * @file src/App.tsx 
 * @fileoverview Main application component
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import React from 'react';
import VolatilitySurface from './components/VolatilitySurface';
import vfiPNG from './assets/virtuousfinance-icon-500x500px.png'
import vfiSVG from '/virtuousfinance-icon-500x500px.svg'

/**
 * Gets API key from environment variables with type safety
 * @throws {Error} If API key is not found or invalid
 */
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Polygon API key not found. Please add VITE_POLYGON_API_KEY to your .env file.'
    );
  }

  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Invalid Polygon API key format.');
  }

  return apiKey;
};

const App: React.FC = () => {
  const apiKey = getApiKey();

  return (
    <div className="min-h-screen bg-[#1C1531] text-white">
      {/* Header */}
      <header className="py-8">
        <div className="container mx-auto flex justify-center">
          <div className="w-13 h-13 bg-white rounded-full flex items-center justify-center">
            <img 
              src={vfiSVG} 
              className="w-12 h-12" 
              alt="Virtuous Finance Logo" 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-center font-inter uppercase tracking-wide">
            Volatility Analyzer
          </h1>
          
          {/* Card Container */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <VolatilitySurface apiKey={apiKey} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto flex justify-center">
          <div className="w-13 h-13 bg-white rounded-full flex items-center justify-center">
            <img 
              src={vfiPNG} 
              className="w-12 h-12" 
              alt="Virtuous Finance Icon" 
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;