/**
 * @file eslint.config.js
 * @fileoverview ESLint configuration for the Options Matrix Analytics tool
 * 
 * @description
 * Defines ESLint rules and configuration for the project, focusing on:
 * - TypeScript integration
 * - React-specific linting (hooks, refresh)
 * - Code style consistency
 * - Type safety enforcement
 * 
 * @dependencies
 * - @eslint/js: Base ESLint functionality
 * - typescript-eslint: TypeScript-specific rules
 * - eslint-plugin-react-hooks: React Hooks linting
 * - eslint-plugin-react-refresh: Fast Refresh compatibility
 * 
 * @usage
 * This config is automatically used by ESLint. You can also run manually:
 * ```bash
 * npm run lint
 * ```
 * 
 * @version 1.0.0
 * @author Virtuous Finance LLC
 * @copyright (c) 2025 Virtuous Finance LLC
 * @lastModified Wednesday, January 1, 2025
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Ignore compiled output
  { ignores: ['dist'] },
  
  {
    // Extend recommended configurations
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    
    // Apply to TypeScript files
    files: ['**/*.{ts,tsx}'],
    
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    
    // Configure React-specific plugins
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    
    // Define rule configurations
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
