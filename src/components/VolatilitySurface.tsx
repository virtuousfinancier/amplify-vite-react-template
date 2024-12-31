import React, { useState } from 'react';

// Domain Types
type OptionType = 'call' | 'put';

interface VolatilitySurfaceData {
  readonly strikes: readonly number[];
  readonly expirations: readonly string[];
  readonly callIVs: ReadonlyArray<ReadonlyArray<number>>;
  readonly putIVs: ReadonlyArray<ReadonlyArray<number>>;
  readonly underlyingPrice: number;
}

// API Types
interface PolygonOptionDetails {
  readonly contract_type: 'call' | 'put';
  readonly expiration_date: string;
  readonly strike_price: number;
  readonly ticker: string;
}

interface PolygonUnderlyingAsset {
  readonly price: number;
}

interface PolygonOption {
  readonly details: PolygonOptionDetails;
  readonly implied_volatility: number;
  readonly underlying_asset: PolygonUnderlyingAsset;
}

interface PolygonResponse {
  readonly results: readonly PolygonOption[];
  readonly status: string;
}

// Pure Functions
const processOptionsData = (rawData: readonly PolygonOption[]): VolatilitySurfaceData => {
  // Group options by type, expiration and strike
  const groupedOptions = rawData.reduce((acc, option) => {
    // Skip invalid options
    if (!option.details?.contract_type || 
        !option.details?.expiration_date || 
        !option.details?.strike_price ||
        !option.implied_volatility) {
      return acc;
    }

    const type = option.details.contract_type;
    const expiry = option.details.expiration_date;
    const strike = option.details.strike_price;
    const iv = option.implied_volatility;

    if (!acc[type]) acc[type] = {};
    if (!acc[type][expiry]) acc[type][expiry] = {};
    acc[type][expiry][strike] = iv;
    
    return acc;
  }, {} as Record<OptionType, Record<string, Record<number, number>>>);

  // Extract and validate strikes and expirations
  const strikes = [...new Set(rawData
    .filter(opt => typeof opt.details?.strike_price === 'number' && !isNaN(opt.details.strike_price))
    .map(opt => opt.details.strike_price))]
    .sort((a, b) => a - b);

  const expirations = [...new Set(rawData
    .filter(opt => opt.details?.expiration_date)
    .map(opt => opt.details.expiration_date))]
    .sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

  // Guard against empty data
  if (strikes.length === 0 || expirations.length === 0) {
    throw new Error('No valid options data found');
  }

  // Create IV matrices for calls and puts with proper date formatting
  const formattedDates = expirations.map(exp => {
    const date = new Date(exp);
    return date.toLocaleDateString(undefined, { 
      month: 'numeric', 
      day: 'numeric', 
      year: '2-digit' 
    });
  });

  // Create IV matrices for calls and puts
  const callIVs = strikes.map(strike => 
    expirations.map(exp => groupedOptions.call?.[exp]?.[strike] ?? 0)
  );
  const putIVs = strikes.map(strike => 
    expirations.map(exp => groupedOptions.put?.[exp]?.[strike] ?? 0)
  );

  return {
    strikes,
    expirations: formattedDates,
    callIVs,
    putIVs,
    underlyingPrice: rawData[0]?.underlying_asset?.price || 0
  };
};

const getIVColor = (iv: number, baseIV: number): string => {
  const diff = iv - baseIV;
  if (diff < -0.05) return 'text-blue-600 font-medium';
  if (diff < 0) return 'text-blue-400';
  if (diff > 0.05) return 'text-red-600 font-medium';
  if (diff > 0) return 'text-red-400';
  return 'text-gray-600';
};

// Component
const VolatilitySurface: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [surfaceData, setSurfaceData] = useState<VolatilitySurfaceData | null>(null);
  const [selectedType, setSelectedType] = useState<OptionType>('call');

  const fetchOptionsData = async (symbol: string): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
      let allOptions: PolygonOption[] = [];
      let hasMore = true;
      let nextUrl = `https://api.polygon.io/v3/snapshot/options/${symbol}?limit=250&apiKey=${apiKey}`;

      while (hasMore && allOptions.length < 1000) { // Limit to prevent infinite loops
        const response = await fetch(nextUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch options data');
        }

        const data: PolygonResponse & { next_url?: string } = await response.json();
        console.log('API Response:', data);
        
        if (!data.results?.length) {
          throw new Error('No options data available');
        }

        allOptions = [...allOptions, ...data.results];
        console.log('Sample options:', data.results.slice(0, 3));
        
        // Log information about this batch
        const batchExpirations = new Set(data.results.map(opt => opt.details.expiration_date));
        console.log(`Batch ${allOptions.length / 250}: Found ${batchExpirations.size} expirations`);
        
        // Check if there's more data to fetch
        if (data.next_url) {
          nextUrl = `${data.next_url}&apiKey=${apiKey}`;
        } else {
          hasMore = false;
        }
      }

      // Log aggregate information
      const uniqueExpirations = new Set(allOptions.map(opt => opt.details.expiration_date));
      console.log('Unique expirations:', Array.from(uniqueExpirations).sort());
      console.log('Number of expirations:', uniqueExpirations.size);
      
      const uniqueStrikes = new Set(allOptions.map(opt => opt.details.strike_price));
      console.log('Number of strikes:', uniqueStrikes.size);
      console.log('Strike range:', Math.min(...uniqueStrikes), 'to', Math.max(...uniqueStrikes));
      
      try {
        const processedData = processOptionsData(allOptions);
        console.log('Processed surface data:', {
          numExpirations: processedData.expirations.length,
          numStrikes: processedData.strikes.length,
          expirations: processedData.expirations,
          sampleIVs: processedData.callIVs[0]?.slice(0, 5) // First strike, first 5 expirations
        });
        setSurfaceData(processedData);
      } catch (processError) {
        console.error('Error processing data:', processError);
        throw processError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSurfaceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (ticker) {
      fetchOptionsData(ticker.toUpperCase());
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}
      </div>

      {surfaceData && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedType('call')}
              className={`px-4 py-2 rounded transition-colors ${
                selectedType === 'call' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Calls
            </button>
            <button
              onClick={() => setSelectedType('put')}
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
            <div className="min-w-[1200px]"> {/* Force minimum width to show more columns */}
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
                  if (typeof strike !== 'number' || isNaN(strike)) return null;
                  
                  const ivData = selectedType === 'call' ? surfaceData.callIVs : surfaceData.putIVs;
                  if (!ivData?.[i]) return null;

                  const isAtm = Math.abs(strike - surfaceData.underlyingPrice) < 0.01;
                  const isNearAtm = Math.abs(strike - surfaceData.underlyingPrice) <= 5;

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
                      {ivData[i].map((iv, j) => {
                        const baseIVRow = Math.floor(surfaceData.strikes.length / 2);
                        const baseIV = ivData[baseIVRow]?.[j] ?? 0;
                        const validIV = typeof iv === 'number' && !isNaN(iv) ? iv : 0;
                        
                        return (
                          <td 
                            key={`${i}-${j}`} 
                            className={`border border-gray-700 p-2 text-right ${getIVColor(validIV, baseIV)}`}
                          >
                            {(validIV * 100).toFixed(1)}%
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