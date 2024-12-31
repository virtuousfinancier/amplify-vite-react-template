import React, { useState } from 'react';

interface OptionsData {
  strikes: number[];
  expirations: string[];
  ivs: number[][];
}

interface PolygonOption {
  expiration_date: string;
  strike_price: number;
  implied_volatility?: number;
}

interface PolygonResponse {
  results: PolygonOption[];
  status: string;
}

const VolatilitySurface: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [optionsData, setOptionsData] = useState<OptionsData | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<number>(0);

  const fetchOptionsData = async (symbol: string): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.polygon.io/v3/snapshot/options/${symbol}?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch options data');
      }

      const data: PolygonResponse = await response.json();
      processOptionsData(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOptionsData(null);
    } finally {
      setLoading(false);
    }
  };

  const processOptionsData = (rawData: PolygonOption[]): void => {
    if (!rawData || rawData.length === 0) {
      setError('No options data available');
      return;
    }

    // Group options by expiration and strike
    const grouped = rawData.reduce<Record<string, Record<number, number>>>((acc, option) => {
      const expiry = option.expiration_date;
      const strike = option.strike_price;
      const iv = option.implied_volatility || 0;

      if (!acc[expiry]) acc[expiry] = {};
      acc[expiry][strike] = iv;
      return acc;
    }, {});

    // Transform data into the format we need
    const expirations = Object.keys(grouped).sort();
    const strikes = [...new Set(rawData.map(opt => opt.strike_price))].sort((a, b) => a - b);
    const ivs = strikes.map(strike => 
      expirations.map(exp => grouped[exp][strike] || 0)
    );

    setOptionsData({
      strikes,
      expirations: expirations.map(exp => {
        const date = new Date(exp);
        return date.toLocaleDateString();
      }),
      ivs
    });
  };

  const getIVColor = (iv: number): string => {
    if (iv < 0.25) return 'text-blue-600';
    if (iv < 0.27) return 'text-blue-800';
    if (iv < 0.29) return 'text-purple-600';
    return 'text-purple-800';
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (ticker) {
      fetchOptionsData(ticker.toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Volatility Surface</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL)"
              className="px-3 py-1 border rounded flex-1"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {optionsData && (
          <div className="flex space-x-2 mb-4">
            {optionsData.expirations.map((exp, idx) => (
              <button
                key={exp}
                onClick={() => setSelectedExpiry(idx)}
                className={`px-3 py-1 rounded ${
                  selectedExpiry === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 bg-gray-50">
        {optionsData && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 border bg-gray-100">Strike</th>
                    {optionsData.expirations.map(exp => (
                      <th key={exp} className="p-2 border text-center bg-gray-100">{exp}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {optionsData.strikes.map((strike, i) => (
                    <tr key={strike}>
                      <td className="p-2 border font-medium text-center">{strike}</td>
                      {optionsData.ivs[i].map((iv, j) => (
                        <td
                          key={`${i}-${j}`}
                          className={`p-2 border text-center ${getIVColor(iv)} font-mono`}
                        >
                          {(iv * 100).toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Selected Expiry: {optionsData.expirations[selectedExpiry]}
              </h3>
              <div className="font-mono bg-white p-4 rounded-lg shadow-inner">
                {optionsData.strikes.map((strike, i) => (
                  <div key={strike} className="flex space-x-2">
                    <span className="w-12">{strike}:</span>
                    <span className={getIVColor(optionsData.ivs[i][selectedExpiry])}>
                      {'█'.repeat(Math.floor(optionsData.ivs[i][selectedExpiry] * 100))}
                      {` ${(optionsData.ivs[i][selectedExpiry] * 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VolatilitySurface;