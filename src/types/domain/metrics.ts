/**
 * @file src/types/domain/metrics.ts
 * @fileoverview Type definitions for options analytics metric configurations and display settings
 *
 * @description
 * These types define the core domain models for different metric views and their configurations
 * in the options analyzer. The metrics system supports different views (liquidity, volatility,
 * pricing, greeks) with configurable thresholds and display settings.
 *
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

/**
 * @type MetricView
 * @description Available metric visualization modes for options analysis
 * 
 * @example
 * ```typescript
 * const view: MetricView = 'liquidity';
 * ```
 */
export type MetricView = 'liquidity' | 'volatility' | 'pricing' | 'greeks';

/**
 * @interface LiquidityThresholds
 * @description Configuration thresholds for liquidity metrics visualization
 * 
 * @property {number} minOpenInterest - Minimum open interest to consider liquid
 * @property {number} minVolume - Minimum daily volume to consider liquid
 * @property {number} maxBidAskSpread - Maximum acceptable bid-ask spread percentage
 * 
 * @example
 * ```typescript
 * const thresholds: LiquidityThresholds = {
 *   minOpenInterest: 100,
 *   minVolume: 50,
 *   maxBidAskSpread: 0.05
 * };
 * ```
 */
export interface LiquidityThresholds {
  readonly minOpenInterest: number;
  readonly minVolume: number;
  readonly maxBidAskSpread: number;
}

/**
 * @interface MetricConfig
 * @description Configuration for metric visualization settings
 * 
 * @property {MetricView} view - Type of metric view to display
 * @property {LiquidityThresholds} [thresholds] - Optional liquidity thresholds
 * 
 * @example
 * ```typescript
 * const config: MetricConfig = {
 *   view: 'liquidity',
 *   thresholds: {
 *     minOpenInterest: 100,
 *     minVolume: 50,
 *     maxBidAskSpread: 0.05
 *   }
 * };
 * ```
 */
export interface MetricConfig {
  readonly view: MetricView;
  readonly thresholds?: LiquidityThresholds;
}

/**
 * @interface MetricDisplayConfig
 * @description Visual display configuration for metric views
 * 
 * @property {string} label - Display label for the metric
 * @property {string} description - Detailed description of the metric
 * @property {'blue-red' | 'green-red'} colorScale - Color gradient for visualization
 * 
 * @example
 * ```typescript
 * const displayConfig: MetricDisplayConfig = {
 *   label: 'Liquidity',
 *   description: 'Volume and open interest metrics',
 *   colorScale: 'green-red'
 * };
 * ```
 */
export interface MetricDisplayConfig {
  readonly label: string;
  readonly description: string;
  readonly colorScale: 'blue-red' | 'green-red';
}

/**
 * @constant METRIC_DISPLAY_CONFIG
 * @description Predefined display configurations for each metric view type
 * 
 * @type {Record<MetricView, MetricDisplayConfig>}
 * 
 * @example
 * ```typescript
 * const liquidityConfig = METRIC_DISPLAY_CONFIG.liquidity;
 * console.log(liquidityConfig.description); // "Volume and open interest metrics"
 * ```
 */
export const METRIC_DISPLAY_CONFIG: Record<MetricView, MetricDisplayConfig> = {
  liquidity: {
    label: 'Liquidity',
    description: 'Volume and open interest metrics',
    colorScale: 'green-red'
  },
  volatility: {
    label: 'Volatility',
    description: 'Implied volatility surface',
    colorScale: 'blue-red'
  },
  pricing: {
    label: 'Pricing',
    description: 'Break-even and bid-ask spreads',
    colorScale: 'blue-red'
  },
  greeks: {
    label: 'Greeks',
    description: 'Delta, gamma, theta, vega',
    colorScale: 'blue-red'
  }
};