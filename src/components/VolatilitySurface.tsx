/**
 * @file src/components/VolatilitySurface.tsx
 * @fileoverview Volatility surface visualization component for options trading.
 * Displays and allows sorting of implied volatility data across strikes and expirations.
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import React, { useState, useMemo } from 'react';
import { fold } from 'fp-ts/Either';
import { OptionType, SurfaceMatrix } from '../types/domain/option';
import { useOptionsData } from '../hooks/useOptionsData';

interface Props {
  readonly apiKey: string;
}

/**
 * Type of sorting operation available in the surface table
 * @typedef {'strikes' | 'expirations' | 'iv'} SortKey
 */
type SortKey = 'strikes' | 'expirations' | 'iv';

/**
 * Configuration for table sorting
 * @typedef {Object} SortConfig
 * @property {SortKey} key - The column type being sorted
 * @property {'asc' | 'desc'} direction - Sort direction
 * @property {number} [expirationIndex] - Index of expiration column when sorting by IV
 */
type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
  expirationIndex?: number; // Used when sorting IVs for a specific expiration
};

interface SurfaceTableProps {
  data: SurfaceMatrix;
  sortConfig: SortConfig;
  onSort: (key: SortKey, expirationIndex?: number) => void;
}

/**
 * Determines the color class for IV display based on difference from base IV
 * @param {number} iv - The implied volatility value to compare
 * @param {number} baseIV - The baseline IV (typically ATM IV)
 * @returns {string} Tailwind CSS classes for text color
 */
const getIVColor = (iv: number, baseIV: number): string => {
  const diff = iv - baseIV;
  if (diff < -0.05) return 'text-blue-600 font-medium';
  if (diff < 0) return 'text-blue-400';
  if (diff > 0.05) return 'text-red-600 font-medium';
  if (diff > 0) return 'text-red-400';
  return 'text-gray-600';
};

/**
 * Formats expiration date string with error handling
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15") or original string if invalid
 */
const formatExpiry = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Fallback if date is invalid
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC' // Ensure consistent timezone handling
    });
  } catch (e) {
    return dateStr; // Fallback for any parsing errors
  }
};

const SortIcon: React.FC<{ active: boolean; direction: 'asc' | 'desc' }> = ({ 
  active, 
  direction 
}) => (
  <span 
    className={`
      ml-1 inline-block transition-transform
      ${active ? 'opacity-100' : 'opacity-50'}
      ${active && direction === 'desc' ? 'rotate-180' : ''}
    `}
  >
    {active ? '▲' : '▽'}
  </span>
);

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortKey;
  currentSort: SortConfig;
  onSort: () => void;
  expirationIndex?: number;
}> = ({ label, sortKey, currentSort, onSort, expirationIndex }) => {
  const isActive = currentSort.key === sortKey && 
    (sortKey !== 'iv' || currentSort.expirationIndex === expirationIndex);

  return (
    <div 
      onClick={onSort}
      className="
        flex items-center justify-between
        cursor-pointer select-none
        hover:bg-white/5 transition-colors
        px-2 py-1 rounded
      "
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      <SortIcon 
        active={isActive}
        direction={currentSort.direction} 
      />
    </div>
  );
};

/**
 * Table component for displaying and sorting volatility surface data
 * @component
 * @param {Object} props
 * @param {SurfaceMatrix} props.data - Matrix of strikes, expirations, and IVs
 * @param {SortConfig} props.sortConfig - Current sort configuration
 * @param {function(SortKey, number?): void} props.onSort - Sort handler function
 */
const SurfaceTable: React.FC<SurfaceTableProps> = ({ data, sortConfig, onSort }) => {
  return (
    <div className="overflow-x-auto max-w-[calc(100vw-4rem)]">
      <div className="min-w-[1200px]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#1C1531]">
              <th className="border border-gray-700 p-2 sticky left-0 bg-[#1C1531] z-30">
                <SortableHeader
                  label="Strike"
                  sortKey="strikes"
                  currentSort={sortConfig}
                  onSort={() => onSort('strikes')}
                />
              </th>
              <th 
                colSpan={data.expirations.length}
                className="border border-gray-700 p-2"
              >
                <SortableHeader
                  label="Expirations"
                  sortKey="expirations"
                  currentSort={sortConfig}
                  onSort={() => onSort('expirations')}
                />
              </th>
            </tr>
            <tr className="bg-[#1C1531]">
              <th className="border border-gray-700 p-2 sticky left-0 bg-[#1C1531] z-30"></th>
              {data.expirations.map((exp, index) => (
                <th 
                  key={`${exp}-${index}`} 
                  className="border border-gray-700 p-2 min-w-[100px]"
                >
                  <SortableHeader
                    label={formatExpiry(exp)}
                    sortKey="iv"
                    currentSort={sortConfig}
                    onSort={() => onSort('iv', index)}
                    expirationIndex={index}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.strikes.map((strike, i) => {
              const isAtm = Math.abs(strike - data.underlyingPrice) < 0.01;
              const isNearAtm = Math.abs(strike - data.underlyingPrice) <= 5;
              const baseIVRow = Math.floor(data.strikes.length / 2);

              return (
                <tr 
                  key={`${strike}-${i}`}
                  className={`
                    transition-colors
                    ${isAtm ? 'bg-blue-500/30' : ''}
                    ${!isAtm && isNearAtm ? 'bg-white/5' : ''}
                    hover:bg-white/10
                    ${i % 2 === 0 ? 'bg-opacity-50' : ''}
                  `}
                >
                  <td 
                    className="
                      border border-gray-700 p-2 
                      text-right sticky left-0 
                      bg-[#1C1531] font-medium
                      backdrop-blur-sm
                    "
                  >
                    {strike.toFixed(2)}
                  </td>
                  {data.ivs[i].map((iv, j) => {
                    const baseIV = data.ivs[baseIVRow]?.[j] ?? 0;
                    return (
                      <td 
                        key={`${i}-${j}`} 
                        className={`
                          border border-gray-700 p-2 
                          text-right 
                          ${getIVColor(iv, baseIV)}
                        `}
                        title={`Strike: ${strike}\nExpiry: ${data.expirations[j]}\nIV: ${(iv * 100).toFixed(1)}%`}
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
        Click column headers to sort • Click expiration dates to sort by IV • Scroll horizontally to see more expirations →
      </div>
    </div>
  );
};

/**
 * Main volatility surface component with data fetching and management
 * @component
 * @param {Object} props
 * @param {string} props.apiKey - API key for data fetching
 */
const VolatilitySurface: React.FC<Props> = ({ apiKey }) => {
  const [ticker, setTicker] = useState<string>('');
  const [selectedType, setSelectedType] = useState<OptionType>('call');
  const [surfaceData, setSurfaceData] = useState<SurfaceMatrix | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'strikes', 
    direction: 'asc' 
  });
  
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

  const handleSort = (key: SortKey, expirationIndex?: number) => {
    setSortConfig(prevConfig => ({
      key,
      expirationIndex: key === 'iv' ? expirationIndex : undefined,
      direction: 
        prevConfig.key === key && 
        prevConfig.expirationIndex === expirationIndex && 
        prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

// Apply sorting to surface data
const sortedData = useMemo(() => {
  if (!surfaceData) return null;

  const { strikes, expirations, ivs, underlyingPrice } = surfaceData;

  // Create index maps for sorting
  const strikeIndices = strikes.map((_, i) => i);
  const expirationIndices = expirations.map((_, i) => i);

  // Sort indices based on configuration
  if (sortConfig.key === 'strikes') {
    strikeIndices.sort((a, b) => {
      const diff = strikes[a] - strikes[b];
      return sortConfig.direction === 'asc' ? diff : -diff;
    });
  } else if (sortConfig.key === 'expirations') {
    expirationIndices.sort((a, b) => {
      const diff = new Date(expirations[a]).getTime() - new Date(expirations[b]).getTime();
      return sortConfig.direction === 'asc' ? diff : -diff;
    });
  } else if (sortConfig.key === 'iv' && typeof sortConfig.expirationIndex === 'number') {
    // Sort strikes by IV values for the selected expiration
    strikeIndices.sort((a, b) => {
      // Compare IVs at the specified expiration index
      const diff = ivs[a][sortConfig.expirationIndex!] - ivs[b][sortConfig.expirationIndex!];
      return sortConfig.direction === 'asc' ? diff : -diff;
    });
  }

  // Reorder all data dimensions according to sorted indices
  const sortedStrikes = strikeIndices.map(i => strikes[i]);
  const sortedExpirations = expirationIndices.map(i => expirations[i]);
  // Maintain IV matrix structure while applying both strike and expiration sorting
  const sortedIVs = strikeIndices.map(i => 
    expirationIndices.map(j => ivs[i][j])
  );

  return {
    strikes: sortedStrikes,
    expirations: sortedExpirations,
    ivs: sortedIVs,
    underlyingPrice
  };
}, [surfaceData, sortConfig]);

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
      {sortedData && (
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

          <SurfaceTable 
            data={sortedData} 
            sortConfig={sortConfig} 
            onSort={handleSort}
          />
        </div>
      )}
    </div>
  );
};

export default VolatilitySurface;