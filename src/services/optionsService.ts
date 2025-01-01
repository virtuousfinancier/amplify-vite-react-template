/**
 * @file src/services/optionsService.ts
 * @fileoverview Service layer for options data fetching and processing
 * 
 * @description
 * This service provides a functional interface for fetching and processing options data
 * from the Polygon API. It handles data fetching, validation, and transformation using
 * fp-ts for type-safe error handling and composition.
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 * 
 * @example
 * ```typescript
 * const service = createOptionsService('YOUR_API_KEY');
 * const result = await service.fetchOptionsData('AAPL', 'call')();
 * ```
 */

import { pipe } from 'fp-ts/function';
import { Either, left, right } from 'fp-ts/Either';
import { TaskEither, tryCatch, chainEitherK } from 'fp-ts/TaskEither';
import { PolygonResponse, OptionSnapshot, SurfaceMatrix } from '../types/domain/option';
import { validateAPIResponse, createSurfaceMatrix } from '../types/validation/optionsValidation';

/**
 * Interface for options data operations
 * 
 * @interface OptionsService
 * @property {function} fetchOptionsData - Fetches and processes options data for a given symbol and type
 */
export interface OptionsService {
  readonly fetchOptionsData: (symbol: string, type: 'call' | 'put') => TaskEither<Error, SurfaceMatrix>;
}

interface PaginatedResponse extends PolygonResponse {
  readonly next_url?: string;
}

/**
 * Fetches raw options data from the Polygon API
 * 
 * @private
 * @param {string} symbol - The stock symbol to fetch options data for
 * @param {string} apiKey - Polygon API key
 * @returns {Promise<PolygonResponse>} Raw API response
 * @throws {Error} If the API request fails
 */
const fetchPage = async (url: string, apiKey: string): Promise<PaginatedResponse> => {
  const response = await fetch(
    url.includes('apiKey') ? url : `${url}&apiKey=${apiKey}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No options data found');
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches all pages of options data recursively
 * @private
 */
const fetchAllPages = async (
  initialUrl: string,
  apiKey: string,
  allResults: OptionSnapshot[] = []
): Promise<PolygonResponse> => {
  const data = await fetchPage(initialUrl, apiKey);
  const combinedResults = [...allResults, ...data.results];

  console.log('Fetched page:', {
    newResults: data.results.length,
    totalSoFar: combinedResults.length,
    hasMore: !!data.next_url,
    uniqueExpirations: [...new Set(combinedResults.map(opt => opt.details?.expiration_date))]
  });

  // Base case: no more pages
  if (!data.next_url) {
    return {
      status: data.status,
      request_id: data.request_id,
      results: combinedResults
    };
  }

  // Recursive case: fetch next page
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 200));
  return fetchAllPages(data.next_url, apiKey, combinedResults);
};

/**
 * Fetches raw options data from the Polygon API
 * @private
 */
const fetchRawData = async (symbol: string, apiKey: string): Promise<PolygonResponse> => {
  const baseUrl = `https://api.polygon.io/v3/snapshot/options/${symbol}?limit=250`;
  
  try {
    const data = await fetchAllPages(baseUrl, apiKey);

    if (!data.results || data.results.length === 0) {
      throw new Error(`No options data available for ${symbol}`);
    }

    console.log('Final data:', {
      totalResults: data.results.length,
      uniqueExpirations: [...new Set(data.results.map(opt => opt.details?.expiration_date))],
      uniqueStrikes: [...new Set(data.results.map(opt => opt.details?.strike_price))]
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch options data: ${error}`);
  }
};

/**
 * Validates the Polygon API key
 * 
 * @private
 * @param {string} apiKey - The API key to validate
 * @returns {Either<Error, string>} Validated API key or error
 */
const validateApiKey = (apiKey: string): Either<Error, string> => {
  if (!apiKey) {
    return left(new Error('API key is required'));
  }
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    return left(new Error('Invalid API key format'));
  }
  return right(apiKey);
};

/**
 * Creates an options service instance
 * 
 * @function createOptionsService
 * @param {string} apiKey - Polygon API key
 * @returns {OptionsService} Service instance for fetching options data
 * @throws {Error} If API key is invalid
 * 
 * @example
 * ```typescript
 * const service = createOptionsService('YOUR_API_KEY');
 * 
 * // Using with TaskEither
 * const result = await pipe(
 *   service.fetchOptionsData('AAPL', 'call'),
 *   map(surface => console.log(surface))
 * )();
 * 
 * // Using with async/await
 * try {
 *   const result = await service.fetchOptionsData('AAPL', 'call')();
 *   if (result._tag === 'Right') {
 *     console.log(result.right);
 *   }
 * } catch (error) {
 *   console.error(error);
 * }
 * ```
 */
export const createOptionsService = (apiKey: string): OptionsService => {
  // Validate API key immediately
  const apiKeyValidation = validateApiKey(apiKey);
  if (apiKeyValidation._tag === 'Left') {
    throw apiKeyValidation.left;
  }

  const fetchOptionsData = (symbol: string, type: 'call' | 'put'): TaskEither<Error, SurfaceMatrix> =>
    pipe(
      tryCatch(
        () => fetchRawData(symbol, apiKey),
        (error) => new Error(`Failed to fetch options data: ${error}`)
      ),
      chainEitherK((response) => validateAPIResponse(response)),
      chainEitherK((data) => createSurfaceMatrix(type, data.results))
    );

  return {
    fetchOptionsData
  };
};