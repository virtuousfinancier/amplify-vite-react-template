/**
 * @file src/components/MetricTabs.tsx
 * @fileoverview Tab navigation component for switching between different options metric views
 *
 * @description
 * This component provides a tabbed interface for switching between different metric
 * visualizations in the options analyzer. It maintains a functional approach with
 * immutable props and clear component composition. The tabs are styled using Tailwind
 * CSS with a consistent dark theme matching the overall application design.
 *
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC. All rights reserved.
 * @lastModified Wednesday, January 1, 2025
 */

import React from 'react';
import { MetricView, METRIC_DISPLAY_CONFIG } from '../types/domain/metrics';

/**
 * @interface TabProps
 * @description Props for individual metric tab component
 * 
 * @property {MetricView} view - The metric view this tab represents
 * @property {boolean} isActive - Whether this tab is currently selected
 * @property {() => void} onClick - Handler for tab selection
 *
 * @example
 * ```tsx
 * <Tab
 *   view="liquidity"
 *   isActive={true}
 *   onClick={() => handleViewChange('liquidity')}
 * />
 * ```
 */
interface TabProps {
  readonly view: MetricView;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

/**
 * Individual tab component for metric view selection
 * 
 * @component
 * @description Renders a single tab button with appropriate styling based on active state
 * 
 * @param {TabProps} props - Component props
 * @returns {JSX.Element} Rendered tab button
 *
 * @example
 * ```tsx
 * const MetricTab = () => (
 *   <Tab
 *     view="volatility"
 *     isActive={currentView === 'volatility'}
 *     onClick={() => setView('volatility')}
 *   />
 * );
 * ```
 */
const Tab: React.FC<TabProps> = ({ view, isActive, onClick }) => {
  const config = METRIC_DISPLAY_CONFIG[view];
  
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-t transition-colors
        border-t border-l border-r border-gray-700
        ${isActive 
          ? 'bg-white/10 text-white' 
          : 'bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white'
        }
      `}
      title={config.description}
    >
      {config.label}
    </button>
  );
};

/**
 * @interface MetricTabsProps
 * @description Props for the metric tabs navigation component
 * 
 * @property {MetricView} activeView - Currently selected metric view
 * @property {(view: MetricView) => void} onViewChange - Handler for view changes
 *
 * @example
 * ```tsx
 * <MetricTabs
 *   activeView="liquidity"
 *   onViewChange={(view) => setCurrentView(view)}
 * />
 * ```
 */
interface MetricTabsProps {
  readonly activeView: MetricView;
  readonly onViewChange: (view: MetricView) => void;
}

/**
 * Navigation component for switching between metric views
 * 
 * @component
 * @description 
 * Renders a tab navigation bar for switching between different metric visualizations.
 * Maintains consistent styling and interactions across all metric view types.
 * 
 * @param {MetricTabsProps} props - Component props
 * @returns {JSX.Element} Rendered tab navigation
 *
 * @example
 * ```tsx
 * const OptionsAnalyzer = () => {
 *   const [currentView, setCurrentView] = useState<MetricView>('liquidity');
 *   
 *   return (
 *     <MetricTabs
 *       activeView={currentView}
 *       onViewChange={setCurrentView}
 *     />
 *   );
 * };
 * ```
 */
export const MetricTabs: React.FC<MetricTabsProps> = ({
  activeView,
  onViewChange
}) => {
  // Define available views in consistent order
  const views: readonly MetricView[] = ['liquidity', 'volatility', 'pricing', 'greeks'];
  
  return (
    <div className="flex gap-1 border-b border-gray-700">
      {views.map(view => (
        <Tab
          key={view}
          view={view}
          isActive={view === activeView}
          onClick={() => onViewChange(view)}
        />
      ))}
    </div>
  );
};