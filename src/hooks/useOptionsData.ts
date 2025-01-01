/**
 * @file src/hooks/useOptionsData.ts
 * @fileoverview Custom hook for fetching and managing options data
 *
 * @description
 * This hook provides a clean interface for components to fetch and process
 * options data from the Polygon API. It handles all data fetching, validation,
 * and transformation while maintaining proper error handling.
 *
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { fetchData } = useOptionsData(API_KEY);
 *
 *   const handleFetch = async () => {
 *     const result = await fetchData('AAPL', 'call');
 *     if (result._tag === 'Right') {
 *       // Handle success
 *       console.log(result.right);
 *     } else {
 *       // Handle error
 *       console.error(result.left);
 *     }
 *   };
 *
 *   return <button onClick={handleFetch}>Fetch Data</button>;
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { Either, left } from 'fp-ts/Either';
import { createOptionsService } from '../services/optionsService';
import type { SurfaceMatrix, OptionType } from '../types/domain/option';

/**
 * Options data hook configuration
 * @typedef {Object} UseOptionsDataConfig
 * @property {string} apiKey - Polygon.io API key
 */
export interface UseOptionsDataConfig {
  readonly apiKey: string;
}

/**
 * Options data hook result
 * @typedef {Object} UseOptionsDataResult
 * @property {boolean} isLoading - Loading state indicator
 * @property {Error | null} error - Error state if any
 * @property {(symbol: string, type: OptionType) => Promise<Either<Error, SurfaceMatrix>>} fetchData - Function to fetch options data
 */
export interface UseOptionsDataResult {
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly fetchData: (symbol: string, type: OptionType) => Promise<Either<Error, SurfaceMatrix>>;
}

/**
 * Custom hook for fetching and processing options data
 *
 * @param {string} apiKey - Polygon.io API key
 * @returns {UseOptionsDataResult} Hook result containing loading state, error state, and fetch function
 *
 * @throws {Error} If API key is not provided
 *
 * @example
 * ```tsx
 * const { isLoading, error, fetchData } = useOptionsData('YOUR_API_KEY');
 * ```
 */
export const useOptionsData = (apiKey: string): UseOptionsDataResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const service = createOptionsService(apiKey);

  const fetchData = useCallback(async (
    symbol: string,
    type: OptionType
  ): Promise<Either<Error, SurfaceMatrix>> => {
    try {
      setIsLoading(true);
      setError(null);
      return await service.fetchOptionsData(symbol, type)();
    } catch (err) {
      const error = err instanceof Error
        ? err
        : new Error('An unknown error occurred');
      setError(error);
      return left(error);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    isLoading,
    error,
    fetchData
  };
};

export default useOptionsData;