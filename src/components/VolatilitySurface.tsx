import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const VolatilitySurface = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [optionsData, setOptionsData] = useState(null);
  const [selectedExpiry, setSelectedExpiry] = useState(0);

  const fetchOptionsData = async (symbol) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.polygon.io/v3/snapshot/options/${symbol}?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch options data');
      }

      const data = await response.json();
      processOptionsData(data.results);
    } catch (err) {
      setError(err.message);
      setOptionsData(null);
    } finally {
      setLoading(false);
    }
  };

  const processOptionsData = (rawData) => {
    if (!rawData || rawData.length === 0) {
      setError('No options data available');
      return;
    }

    // Group options by expiration and strike
    const grouped = rawData.reduce((acc, option) => {
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

  const getIVColor = (iv) => {
    if (iv < 0.25) return 'text-blue-600';
    if (iv < 0.27) return 'text-blue-800';
    if (iv < 0.29) return 'text-purple-600';
    return 'text-purple-800';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker) {
      fetchOptionsData(ticker.toUpperCase());
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Volatility Surface</CardTitle>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL)"
              className="px-3 py-1 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {optionsData && (
          <div className="flex space-x-2 mt-4">
            {optionsData.expirations.map((exp, idx) => (
              <button
                key={exp}
                onClick={() => setSelectedExpiry(idx)}
                className={`px-3 py-1 rounded ${
                  selectedExpiry === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {optionsData && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 border">Strike</th>
                    {optionsData.expirations.map(exp => (
                      <th key={exp} className="p-2 border text-center">{exp}</th>
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
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Selected Expiry: {optionsData.expirations[selectedExpiry]}
              </h3>
              <div className="font-mono">
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
      </CardContent>
    </Card>
  );
};

export default VolatilitySurface;