# Code Formatting & Quality

This project uses Prettier for code formatting and ESLint for code quality checks.

## Available Scripts

- `bun run format` - Format all code files using Prettier
- `bun run format:check` - Check if all files are properly formatted
- `bun run lint` - Run ESLint to check code quality
- `bun run lint:fix` - Run ESLint with automatic fixes
- `bun run code-quality` - Run both format check and linting

## Configuration Files

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore during formatting
- `eslint.config.js` - ESLint configuration (ESLint v9+ format)

## Formatting Rules

- Single quotes for strings
- Semicolons required
- 2 spaces for indentation
- 100 character line width
- Trailing commas in ES5 contexts
- LF line endings

## Excluded Files

Large generated files and build outputs are excluded from formatting:

- `src/dictionaries/readlex.ts` (large dictionary file)
- `dist/` and `build/` directories
- `node_modules/`
- Binary and minified files

## Pre-commit Integration

Consider setting up a pre-commit hook to automatically format code:

```bash
# In .git/hooks/pre-commit
#!/bin/sh
bun run code-quality
```
