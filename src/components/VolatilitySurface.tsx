/**
 * @file src/components/VolatilitySurface.tsx
 * @fileoverview Volatility surface visualization component
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import React, { useState } from 'react';
import { fold } from 'fp-ts/Either';
import { OptionType, SurfaceMatrix } from '../types/domain/option';
import { useOptionsData } from '../hooks/useOptionsData';

interface Props {
  readonly apiKey: string;
}

const getIVColor = (iv: number, baseIV: number): string => {
  const diff = iv - baseIV;
  if (diff < -0.05) return 'text-blue-600 font-medium';
  if (diff < 0) return 'text-blue-400';
  if (diff > 0.05) return 'text-red-600 font-medium';
  if (diff > 0) return 'text-red-400';
  return 'text-gray-600';
};

const VolatilitySurface: React.FC<Props> = ({ apiKey }) => {
  const [ticker, setTicker] = useState<string>('');
  const [selectedType, setSelectedType] = useState<OptionType>('call');
  const [surfaceData, setSurfaceData] = useState<SurfaceMatrix | null>(null);
  
  const { isLoading, error, fetchData } = useOptionsData(apiKey);

  const fetchSurfaceData = async (symbol: string, type: OptionType) => {
    const result = await fetchData(symbol, type);
    
    fold(
      (error: Error) => console.error('Error fetching data:', error),
      (data: SurfaceMatrix) => setSurfaceData(data)
    )(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    await fetchSurfaceData(ticker.toUpperCase(), selectedType);
  };

  const handleTypeChange = async (type: OptionType) => {
    setSelectedType(type);
    if (ticker) {
      await fetchSurfaceData(ticker.toUpperCase(), type);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Options Volatility Surface</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL)"
              className="flex-1 px-4 py-2 border rounded bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
            {error.message}
          </div>
        )}
      </div>

      {/* Surface Data Display */}
      {surfaceData && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => handleTypeChange('call')}
              className={`px-4 py-2 rounded transition-colors ${
                selectedType === 'call' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Calls
            </button>
            <button
              onClick={() => handleTypeChange('put')}
              className={`px-4 py-2 rounded transition-colors ${
                selectedType === 'put' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Puts
            </button>
          </div>

          <div className="overflow-x-auto max-w-[calc(100vw-4rem)]">
            <div className="min-w-[1200px]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-gray-700 p-2 sticky left-0 bg-[#1C1531] z-10">Strike</th>
                    {surfaceData.expirations.map(exp => (
                      <th key={exp} className="border border-gray-700 p-2 min-w-[100px]">
                        {exp}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {surfaceData.strikes.map((strike, i) => {
                    const isAtm = Math.abs(strike - surfaceData.underlyingPrice) < 0.01;
                    const isNearAtm = Math.abs(strike - surfaceData.underlyingPrice) <= 5;
                    const baseIVRow = Math.floor(surfaceData.strikes.length / 2);

                    return (
                      <tr 
                        key={strike} 
                        className={`
                          ${isAtm ? 'bg-blue-500/20' : ''}
                          ${!isAtm && isNearAtm ? 'bg-white/10' : ''}
                          hover:bg-white/5
                        `}
                      >
                        <td className="border border-gray-700 p-2 text-right sticky left-0 bg-[#1C1531] font-medium">
                          {strike.toFixed(2)}
                        </td>
                        {surfaceData.ivs[i].map((iv, j) => {
                          const baseIV = surfaceData.ivs[baseIVRow]?.[j] ?? 0;
                          return (
                            <td 
                              key={`${i}-${j}`} 
                              className={`border border-gray-700 p-2 text-right ${getIVColor(iv, baseIV)}`}
                            >
                              {(iv * 100).toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Scroll horizontally to see more expirations →
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolatilitySurface;