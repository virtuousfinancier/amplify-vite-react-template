# Contributing to Virtuous Finance Options Matrix Analyzer (OPTIX)

First off, thank you for considering contributing to the Options Volatility Surface Analyzer! It's people like you that help make financial tools more accessible and robust.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@virtuous.finance.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible
* Include your environment details:
  - Browser and version
  - Node.js version
  - npm/yarn version
  - Operating system

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed functionality
* Explain why this enhancement would be useful
* List any similar features in other tools if relevant
* Include mockups or examples if applicable

### Pull Requests

Please follow these steps for sending pull requests:

1. Follow all instructions in the template
2. Follow the styleguides
3. After you submit your pull request, verify that all status checks are passing

### Development Environment Setup

1. Fork the repo
2. Clone your fork
3. Create a feature branch
4. Install dependencies:
```bash
npm install
```
5. Create a .env file with your Polygon.io API key:
```bash
echo "VITE_POLYGON_API_KEY=your_api_key_here" > .env
```
6. Start development server:
```bash
npm run dev
```

## Styleguides

### TypeScript Styleguide

* Use TypeScript strict mode
* Follow functional programming principles
* Use immutable data patterns
* Document with JSDoc comments
* Use fp-ts for error handling
* Prefer explicit types over inference
* Use readonly properties where possible

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Never use emojis.

### Documentation Styleguide

* Use Markdown for documentation
* Document all functions with JSDoc comments
* Include examples in documentation
* Keep README.md up to date
* Document breaking changes in detail

## Project Structure

```
src/
├── components/         # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── services/           # API and business logic
└── utilities/          # Helper functions
```

## Testing

* Write tests for all new features
* Maintain test coverage above 80%
* Run tests before submitting PRs:
```bash
npm test
npm run typecheck
```

## Financial Domain Knowledge

When contributing, please consider:
* Options market conventions
* Risk management best practices
* Market data handling standards
* Financial calculations accuracy

## Questions?

Feel free to reach out to support@virtuous.finance with any questions about contributing.

---

Remember: The focus is on building reliable, professional-grade financial tools. Quality and accuracy are paramount.