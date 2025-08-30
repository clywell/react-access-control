# Contributing to React Access Control

We welcome contributions to React Access Control! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/react-access-control.git
cd react-access-control
```

2. **Install dependencies**
```bash
npm install
```

3. **Run tests**
```bash
npm test
```

4. **Build the package**
```bash
npm run build
```

## Development Scripts

- `npm run build` - Build the package for production
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (when implemented)

## Project Structure

```
src/
├── core/           # Core types, utilities, and helpers
├── hooks/          # React hooks
├── components/     # React components
├── adapters/       # Storage and navigation adapters
└── index.ts        # Main package exports

examples/           # Usage examples
dist/              # Built package (auto-generated)
```

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Export all public interfaces and types
- Provide comprehensive JSDoc comments
- Use generic types where appropriate

### React
- Use functional components with hooks
- Follow React best practices
- Optimize for performance with `useMemo` and `useCallback`
- Ensure components are accessible

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Keep functions focused and small

## Making Changes

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Write tests for new functionality
- Update documentation if needed
- Ensure all tests pass
- Run type checking and linting

3. **Commit your changes**
```bash
git commit -m "feat: add new feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

4. **Push and create a pull request**
```bash
git push origin feature/your-feature-name
```

## Pull Request Guidelines

- Fill out the pull request template completely
- Include a clear description of the changes
- Reference any related issues
- Ensure all CI checks pass
- Request review from maintainers

## Adding New Features

When adding new features:

1. **Consider the API design** - Ensure it's consistent with existing patterns
2. **Write comprehensive tests** - Cover edge cases and error scenarios
3. **Update documentation** - Include examples and API documentation
4. **Consider performance** - Optimize for common use cases
5. **Maintain backward compatibility** - Avoid breaking changes when possible

## Storage Adapters

When creating new storage adapters:

1. Implement the `StorageAdapter` interface
2. Handle errors gracefully (fail silently when possible)
3. Include comprehensive JSDoc comments
4. Add examples to the documentation
5. Consider security implications

## Framework Adapters

When creating new framework adapters:

1. Implement the `NavigationAdapter` interface
2. Follow the framework's best practices
3. Handle edge cases and errors
4. Include setup instructions
5. Provide complete examples

## Testing

Currently, the project uses TypeScript compilation and linting as the primary quality checks. We welcome contributions to add comprehensive testing:

- Unit tests for utilities and helpers
- Component testing for React components
- Integration tests for adapters
- End-to-end tests for complete workflows

## Documentation

When updating documentation:

- Update the main README.md if APIs change
- Add examples for new features
- Update JSDoc comments in the code
- Consider adding new example projects

## Release Process

Releases are automated through GitHub Actions:

1. Create a pull request with your changes
2. After merge, maintainers will trigger the release workflow
3. The workflow will:
   - Bump the version
   - Update the changelog
   - Create a Git tag
   - Publish to NPM
   - Create a GitHub release

## Questions?

If you have questions about contributing:

- Open an issue for discussion
- Check existing issues and discussions
- Reach out to maintainers

Thank you for contributing to React Access Control!