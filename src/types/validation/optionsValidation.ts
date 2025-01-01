/**
 * @file src/types/validation/optionsValidation.ts
 * @fileoverview Validation schemas for Polygon Options API responses
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import { z } from 'zod';
import { Either, right, left } from 'fp-ts/Either';
import type { PolygonResponse, OptionSnapshot, SurfaceMatrix } from '../domain/option';

// Core Schema Definitions
const optionTypeSchema = z.enum(['call', 'put']);
const exerciseStyleSchema = z.enum(['american', 'european']);

const optionDetailsSchema = z.object({
  contract_type: optionTypeSchema,
  exercise_style: exerciseStyleSchema,
  expiration_date: z.string(),
  shares_per_contract: z.number(),
  strike_price: z.number(),
  ticker: z.string()
});

const underlyingAssetSchema = z.object({
  change_to_break_even: z.number().optional(),
  last_updated: z.number().optional(),
  price: z.number(),
  ticker: z.string(),
  timeframe: z.string().optional()
});

const optionSnapshotSchema = z.object({
  break_even_price: z.number().optional(),
  day: z.object({
    change: z.number().optional(),
    change_percent: z.number().optional(),
    close: z.number().optional(),
    high: z.number().optional(),
    last_updated: z.number().optional(),
    low: z.number().optional(),
    open: z.number().optional(),
    previous_close: z.number().optional(),
    volume: z.number().optional(),
    vwap: z.number().optional()
  }).optional(),
  details: optionDetailsSchema,
  fmv: z.number().optional(),
  greeks: z.object({
    delta: z.number().optional(),
    gamma: z.number().optional(),
    theta: z.number().optional(),
    vega: z.number().optional()
  }).optional(),
  implied_volatility: z.number().optional(),
  last_quote: z.object({
    ask: z.number().optional(),
    ask_size: z.number().optional(),
    bid: z.number().optional(),
    bid_size: z.number().optional(),
    last_updated: z.number().optional(),
    midpoint: z.number().optional(),
    timeframe: z.string().optional()
  }).optional(),
  last_trade: z.object({
    conditions: z.array(z.number()).optional(),
    exchange: z.number().optional(),
    price: z.number().optional(),
    sip_timestamp: z.number().optional(),
    size: z.number().optional(),
    timeframe: z.string().optional()
  }).optional(),
  open_interest: z.number().optional(),
  underlying_asset: underlyingAssetSchema
});

const polygonResponseSchema = z.object({
  request_id: z.string().optional(),
  results: z.array(optionSnapshotSchema),
  status: z.string()
});

/**
 * Validates raw API response from Polygon
 * @param data Unknown data from API
 * @returns Validated PolygonResponse or Error
 */
export const validateAPIResponse = (data: unknown): Either<Error, PolygonResponse> => {
  try {
    return right(polygonResponseSchema.parse(data));
  } catch (e) {
    if (e instanceof z.ZodError) {
      return left(new Error(`Invalid API response: ${JSON.stringify(e.errors, null, 2)}`));
    }
    return left(new Error('Failed to validate API response'));
  }
};

/**
 * Transforms validated options data into a surface matrix
 * @param type Option type to filter for
 * @param data Array of validated option snapshots
 * @returns Surface matrix or Error
 */
export const createSurfaceMatrix = (
  type: 'call' | 'put',
  data: readonly OptionSnapshot[]
): Either<Error, SurfaceMatrix> => {
  try {
    // First get all valid expirations and strikes, without filtering by IV
    const validOptions = data.filter(option => 
      option.details.contract_type === type &&
      option.details.strike_price &&
      option.details.expiration_date
    );

    if (validOptions.length === 0) {
      return left(new Error(`No valid ${type} options found`));
    }

    // Extract unique sorted strikes and expirations
    const strikes = [...new Set(validOptions.map(opt => opt.details.strike_price))].sort((a, b) => a - b);
    const expirations = [...new Set(validOptions.map(opt => opt.details.expiration_date))].sort();

    // Create IV matrix with default 0 for missing values
    const ivs = strikes.map(strike => 
      expirations.map(expiry => {
        const option = validOptions.find(opt => 
          opt.details.strike_price === strike && 
          opt.details.expiration_date === expiry
        );
        return option?.implied_volatility ?? 0;
      })
    );

    // Use the first available underlying price
    const underlyingPrice = validOptions.find(opt => opt.underlying_asset?.price)?.underlying_asset.price;
    if (!underlyingPrice) {
      return left(new Error('No valid underlying price found'));
    }

    return right({
      strikes,
      expirations,
      ivs,
      underlyingPrice
    });
  } catch (e) {
    return left(new Error(`Failed to create surface matrix: ${e}`));
  }
};