/**
 * @file src/types/domain/option.ts
 * @fileoverview Core domain types aligned with Polygon Options API
 *
 * @description
 * These types directly reflect the structure from the Polygon.io Options API v3.
 * Source: https://polygon.io/docs/options/get_v3_snapshot_options__underlyingasset
 *
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

/**
 * @type OptionType
 * @description Valid option contract types
 */
export type OptionType = 'call' | 'put';

/**
 * @type ExerciseStyle
 * @description Valid option exercise styles
 */
export type ExerciseStyle = 'american' | 'european';

/**
 * @interface DayData
 * @description Daily trading statistics for an option contract
 * @property {number} [change] - Price change from previous close
 * @property {number} [change_percent] - Percentage change from previous close
 * @property {number} [close] - Latest closing price
 * @property {number} [high] - Highest price of the day
 * @property {number} [last_updated] - Last update timestamp
 * @property {number} [low] - Lowest price of the day
 * @property {number} [open] - Opening price
 * @property {number} [previous_close] - Previous day's closing price
 * @property {number} [volume] - Trading volume
 * @property {number} [vwap] - Volume-weighted average price
 */
export interface DayData {
  readonly change?: number;
  readonly change_percent?: number;
  readonly close?: number;
  readonly high?: number;
  readonly last_updated?: number;
  readonly low?: number;
  readonly open?: number;
  readonly previous_close?: number;
  readonly volume?: number;
  readonly vwap?: number;
}

/**
 * @interface OptionDetails
 * @description Core specifications of an option contract
 * @property {OptionType} contract_type - Type of option (call/put)
 * @property {ExerciseStyle} exercise_style - Exercise style (american/european)
 * @property {string} expiration_date - Option expiration date
 * @property {number} shares_per_contract - Number of shares per contract
 * @property {number} strike_price - Strike price of the option
 * @property {string} ticker - Option contract ticker symbol
 */
export interface OptionDetails {
  readonly contract_type: OptionType;
  readonly exercise_style: ExerciseStyle;
  readonly expiration_date: string;
  readonly shares_per_contract: number;
  readonly strike_price: number;
  readonly ticker: string;
}

/**
 * @interface Greeks
 * @description Option Greeks measurements
 * @property {number} [delta] - Rate of change of option price with respect to underlying
 * @property {number} [gamma] - Rate of change of delta with respect to underlying
 * @property {number} [theta] - Rate of change of option price with respect to time
 * @property {number} [vega] - Rate of change of option price with respect to volatility
 */
export interface Greeks {
  readonly delta?: number;
  readonly gamma?: number;
  readonly theta?: number;
  readonly vega?: number;
}

/**
 * @interface LastQuote
 * @description Latest quote information for an option
 * @property {number} [ask] - Latest ask price
 * @property {number} [ask_size] - Size of ask quote
 * @property {number} [bid] - Latest bid price
 * @property {number} [bid_size] - Size of bid quote
 * @property {number} [last_updated] - Quote timestamp
 * @property {number} [midpoint] - Midpoint between bid and ask
 * @property {string} [timeframe] - Quote timeframe
 */
export interface LastQuote {
  readonly ask?: number;
  readonly ask_size?: number;
  readonly bid?: number;
  readonly bid_size?: number;
  readonly last_updated?: number;
  readonly midpoint?: number;
  readonly timeframe?: string;
}

/**
 * @interface LastTrade
 * @description Latest trade information for an option
 * @property {number[]} [conditions] - Trade condition codes
 * @property {number} [exchange] - Exchange where trade occurred
 * @property {number} [price] - Trade price
 * @property {number} [sip_timestamp] - SIP timestamp of trade
 * @property {number} [size] - Trade size
 * @property {string} [timeframe] - Trade timeframe
 */
export interface LastTrade {
  readonly conditions?: number[];
  readonly exchange?: number;
  readonly price?: number;
  readonly sip_timestamp?: number;
  readonly size?: number;
  readonly timeframe?: string;
}

/**
 * @interface UnderlyingAsset
 * @description Information about the underlying asset
 * @property {number} [change_to_break_even] - Price change needed to break even
 * @property {number} [last_updated] - Last update timestamp
 * @property {number} price - Current price of underlying
 * @property {string} ticker - Underlying asset ticker symbol
 * @property {string} [timeframe] - Data timeframe
 */
export interface UnderlyingAsset {
  readonly change_to_break_even?: number;
  readonly last_updated?: number;
  readonly price: number;
  readonly ticker: string;
  readonly timeframe?: string;
}

/**
 * @interface OptionSnapshot
 * @description Complete snapshot of option contract data
 * @property {number} [break_even_price] - Break-even price
 * @property {DayData} [day] - Daily trading statistics
 * @property {OptionDetails} details - Core contract specifications
 * @property {number} [fmv] - Fair market value
 * @property {Greeks} [greeks] - Option Greeks
 * @property {number} [implied_volatility] - Implied volatility
 * @property {LastQuote} [last_quote] - Latest quote data
 * @property {LastTrade} [last_trade] - Latest trade data
 * @property {number} [open_interest] - Open interest
 * @property {UnderlyingAsset} underlying_asset - Underlying asset information
 */
export interface OptionSnapshot {
  readonly break_even_price?: number;
  readonly day?: DayData;
  readonly details: OptionDetails;
  readonly fmv?: number;
  readonly greeks?: Greeks;
  readonly implied_volatility?: number;
  readonly last_quote?: LastQuote;
  readonly last_trade?: LastTrade;
  readonly open_interest?: number;
  readonly underlying_asset: UnderlyingAsset;
}

/**
 * @interface PolygonResponse
 * @description Polygon API response wrapper
 * @property {string} [request_id] - Unique request identifier
 * @property {OptionSnapshot[]} results - Array of option snapshots
 * @property {string} status - Response status
 */
export interface PolygonResponse {
  readonly request_id?: string;
  readonly results: OptionSnapshot[];
  readonly status: string;
}

/**
 * @interface SurfacePoint
 * @description Single point on volatility surface
 * @property {number} strike - Strike price
 * @property {string} expiry - Expiration date
 * @property {number} iv - Implied volatility
 */
export interface SurfacePoint {
  readonly strike: number;
  readonly expiry: string;
  readonly iv: number;
}

/**
 * @interface SurfaceMatrix
 * @description Matrix representation of volatility surface for display
 * @property {readonly number[]} strikes - Array of strike prices
 * @property {readonly string[]} expirations - Array of expiration dates
 * @property {ReadonlyArray<ReadonlyArray<number>>} ivs - Matrix of implied volatilities
 * @property {number} underlyingPrice - Current price of underlying asset
 */
export interface SurfaceMatrix {
  readonly strikes: readonly number[];
  readonly expirations: readonly string[];
  readonly ivs: ReadonlyArray<ReadonlyArray<number>>;
  readonly underlyingPrice: number;
}