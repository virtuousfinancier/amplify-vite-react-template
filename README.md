# Virtuous Finance OPTIX [Options Matrix Analytics]

## What This Software Does

This is a professional-grade tool for analyzing options market data, specifically volatility surfaces. It provides real-time visualization of implied volatility across different strikes and expirations, helping traders and analysts understand market pricing of risk.

## Main Features

- **Real-Time Data**: Live options data from Polygon.io API
- **Interactive Surface Display**: 
  - Color-coded volatility matrix
  - Sortable by strikes and expirations
  - Individual column IV sorting
  - At-the-money highlighting
- **Advanced Sorting**:
  - Strike price sorting (ascending/descending)
  - Expiration date sorting
  - Column-specific IV sorting
- **Visual Indicators**:
  - Blue/Red gradient for volatility differences
  - ATM strike highlighting
  - Near-ATM range indication
  - Tooltips with detailed information

## Technical Stack

- **Frontend**: React with TypeScript
- **State Management**: React hooks with functional patterns
- **Data Handling**: fp-ts for type-safe operations
- **API Integration**: Polygon.io REST API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Architecture Highlights

- **Type Safety**: Comprehensive TypeScript definitions
- **Functional Programming**: Pure functions and immutable data
- **Error Handling**: Monadic error handling with Either type
- **Performance**: 
  - Memoized sorting operations
  - Pagination support for large datasets
  - Efficient DOM updates

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Polygon.io API key
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/virtuousfinancier/optix

# Install dependencies
npm install

# Create .env file
echo "VITE_POLYGON_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

### Usage
1. Enter a stock symbol
2. Select option type (Calls/Puts)
3. Use column headers to sort data:
   - Click "Strike" to sort by strike price
   - Click "Expirations" to sort by date
   - Click individual expiration dates to sort by IV
4. In the color-coded table that appears
   - Blue means lower volatility (market expects less price movement)
   - Red means higher volatility (market expects more price movement)
   - Brighter colors mean stronger expectations

## Development

### Code Structure
```
src/
  ├── components/
  │   └── VolatilitySurface/      # Main component
  ├── hooks/
  │   └── useOptionsData.ts       # Data fetching hook
  ├── types/
  │   └── domain/
  │       └── option.ts           # Type definitions
  └── services/
      └── optionsService.ts       # API service layer
```

### Key Features Implementation
- Functional error handling with fp-ts
- Type-safe API response processing
- Memoized sorting and filtering
- Responsive table layout
- Real-time data updates

### Testing
```bash
# Run tests
npm test

# Check types
npm run typecheck
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the GPLv3 license - see the [LICENSE.md](LICENSE.md) file for details.

## Not Financial Advice

Please remember that:
- This tool is for informational purposes only
- It is not financial advice
- Always consult with a financial professional before making investment decisions

## About Us

Virtuous Finance creates professional-grade financial analysis tools that help make complex market data more accessible and understandable.

## Contact & Support

- Website: https://virtuous.finance
- Support: support@virtuous.finance

---

*Disclaimer: This tool is for informational purposes only. Options trading involves significant risk and isn't suitable for all investors.*