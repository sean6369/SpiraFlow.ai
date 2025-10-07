# SpiraFlow Monorepo

A unified workspace for SpiraFlow's web and mobile experiences. The repository now follows a monorepo structure with shared TypeScript utilities that power both the Next.js web app and the React Native mobile app.

## Directory Layout

```
apps/
  web/        # Next.js 14 web application
  mobile/     # React Native 0.81 mobile application
packages/
  shared/     # Cross-platform TypeScript types, API clients, and utilities
```

## Requirements

- Node.js 18 or newer (recommended 20+)
- npm 9+ (workspace support)
- Xcode + CocoaPods for running iOS (macOS only)
- Android Studio / SDK for Android builds
- OpenAI API key for AI-powered features

## Setup

1. Install dependencies at the repository root:
   ```bash
   npm install
   ```
2. Create environment files for the web app in `apps/web/.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
3. (Optional) Configure any mobile-specific env handling you require (e.g., by copying `.env` files with [react-native-config](https://github.com/luggit/react-native-config)).

## Running the Apps

### Web (Next.js)
```bash
npm run web:dev        # http://localhost:3000
npm run web:build
npm run web:start
npm run web:lint
```

### Mobile (React Native)
```bash
npm run mobile:start   # Metro bundler
npm run mobile:ios     # Run in iOS simulator (requires Xcode & Pods)
npm run mobile:android # Run on Android emulator/device
```

The React Native app ships with NativeWind (Tailwind-style styling) and demonstrates usage of the shared package in `App.tsx`. Metro is configured to watch the shared workspace so changes to `packages/shared` hot-reload automatically.

## Shared Package

`packages/shared` exposes:
- `types/` – journal entry, prompt, analytics interfaces
- `utils/` – IndexedDB storage helpers, analytics calculations, audio helpers
- `api/` – API client helpers that wrap the web app routes

Import anything you need with:
```ts
import { JournalEntry, analyzeUserPatterns } from '@spiraflow/shared';
```

Next.js is configured to transpile the shared package, and React Native resolves it through Metro. Any new modules placed in `packages/shared/src` become instantly available to both apps.

## NativeWind & Tailwind (Mobile)

- Configuration lives in `apps/mobile/tailwind.config.js`
- `babel.config.js` and `metro.config.js` are preconfigured for NativeWind
- Tailwind classes can be used directly via the `className` prop on React Native primitives

## Testing & Linting

- Web: `npm run web:lint`
- Mobile: `npm run test --workspace @spiraflow/mobile`
- Shared package has a TypeScript build config (`packages/shared/tsconfig.json`) for generating declarations if needed (`npx tsc -b packages/shared`)

## Deploying / Building

- Web app can be deployed with any Next.js-compatible host (Vercel, Netlify, etc.) from `apps/web`
- Mobile app follows the standard React Native release flow using Xcode or Gradle from `apps/mobile`

## Contributing

1. Create a new branch from `main`
2. Make your changes across the relevant app(s) or shared package
3. Run the appropriate scripts above to verify
4. Open a pull request describing the updates

---

Built with ❤️ to help you reflect anywhere, on the web or on the go.
