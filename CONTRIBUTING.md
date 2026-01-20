# Contributing to VeilPay

Thank you for your interest in contributing to VeilPay!

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass: `npm test`
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

See [docs/SETUP.md](./docs/SETUP.md) for detailed instructions.

## Coding Standards

### JavaScript/TypeScript
- Use ES6+ features
- Follow Airbnb style guide
- Use meaningful variable names
- Comment complex logic

### Clarity
- Follow Clarity best practices
- Use descriptive function names
- Handle all error cases

### Circom
- Keep circuits simple and auditable
- Add comments explaining constraints
- Document all inputs/outputs

## Commit Messages

Use conventional commits format:
```
type(scope): subject
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(circuits): add support for variable amounts`

## Security

**DO NOT** open public issues for security vulnerabilities.

Report security issues privately via email or GitHub Security Advisories.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
