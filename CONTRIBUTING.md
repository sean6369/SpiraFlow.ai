# Contributing to SpiraFlow

Thank you for your interest in contributing to SpiraFlow! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/SpiraFlow.git
   cd SpiraFlow
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Code Style

We use TypeScript and follow these conventions:
- Use functional components with hooks
- Use TypeScript types/interfaces (no `any` unless absolutely necessary)
- Follow existing naming conventions
- Use Tailwind CSS for styling (avoid inline styles)
- Use Framer Motion for animations

### Project Structure

```
app/           - Next.js pages and API routes
components/    - Reusable React components
lib/           - Utility functions and services
types/         - TypeScript type definitions
```

## Areas for Contribution

### High Priority
- [ ] Dark mode implementation
- [ ] Cloud sync with encryption
- [ ] Audio playback feature
- [ ] Export entries as PDF
- [ ] Mobile responsiveness improvements

### Medium Priority
- [ ] Advanced search filters
- [ ] Custom tagging system
- [ ] Data import/export improvements
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Nice to Have
- [ ] Multiple language support
- [ ] Integration with other services
- [ ] Advanced analytics
- [ ] Customizable themes
- [ ] Browser extension

## Code Guidelines

### Component Structure

```tsx
'use client'; // If client component

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  // Props with TypeScript types
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  // State and hooks
  const [state, setState] = useState(false);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### API Route Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();
    
    // Process data
    
    return NextResponse.json({ result: 'success' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Database Operations

All IndexedDB operations should go through `lib/db.ts`:

```typescript
import { saveEntry, getAllEntries } from '@/lib/db';

// Save entry
await saveEntry(entry);

// Get entries
const entries = await getAllEntries();
```

## Testing

Currently, SpiraFlow doesn't have automated tests. We welcome contributions to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright/Cypress)

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add dark mode toggle to settings page"
git commit -m "Fix transcription error handling"
git commit -m "Improve dashboard chart responsiveness"

# Bad
git commit -m "Update stuff"
git commit -m "Fix bug"
git commit -m "WIP"
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run lint check**
   ```bash
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Describe what you changed and why
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tested locally
- [ ] Updated documentation if needed
- [ ] No new warnings or errors
```

## Feature Requests

Have an idea? Open an issue with:
- Clear description of the feature
- Use case / why it's needed
- Any implementation ideas
- Mockups if UI-related

## Bug Reports

Found a bug? Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Console errors if any

## Development Tips

### Debugging IndexedDB

```javascript
// Open browser console
const db = await window.indexedDB.open('spiraflow-db');
// Inspect stores and data
```

### Testing OpenAI Integration

Use a test API key with low rate limits to avoid costs during development.

### State Management

We use React's built-in hooks. For complex state, consider:
- Context API for global state
- Zustand for lightweight state management (already included)

### Performance

- Use `React.memo` for expensive components
- Lazy load heavy components with `next/dynamic`
- Optimize images with `next/image`
- Keep bundle size minimal

## Questions?

- Check existing issues
- Read the documentation
- Ask in discussions

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the issue, not the person
- Give credit where it's due

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SpiraFlow! 🙏

