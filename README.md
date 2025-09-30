# Kid-Friendly Map & Transit Navigator

This repository contains an Expo React Native application focused on kid-friendly navigation, safety features, and transit info.

Quickstart
---------
1. Install dependencies (pick one package manager and standardize):

```bash
# npm (recommended for local dev)
npm ci

# OR Bun (used in CI)
# bun install
```

2. Copy environment variables:

```bash
cp .env.example .env
# Edit .env with production/dev values
```

3. Typecheck and tests:

```bash
npx tsc --noEmit
npm test
```

4. Run in development (Expo):

```bash
npx expo start
```

Production builds (EAS)
----------------------
This project uses Expo Application Services (EAS) for production mobile builds.

1. Install the EAS CLI:

```bash
npm install -g eas-cli
```

2. Login and configure credentials:

```bash
eas login
# Follow prompts to configure your account
```

3. Add secrets (Sentry DSN, API keys, signing keys) in EAS or GitHub Actions secrets.

4. Build:

```bash
npx eas build --profile production --platform all
```

Assets
------
Place app icons and splash assets under `assets/images/`.
This repo includes placeholder assets; replace them with production artwork.

Environment / Secrets
---------------------
- Keep production values out of version control; use CI secrets.
- Required keys are listed in `.env.example`.

Monitoring & Crash Reporting
---------------------------
A Sentry integration skeleton is available at `utils/sentry.ts`. Add `SENTRY_DSN` to your environment and follow Sentry's docs to create a project.

CI/CD
-----
There is a GitHub Actions pipeline in `.github/workflows/ci.yml`. It expects Bun for install steps; if you prefer npm/yarn, update CI to match your chosen package manager.

Contributing
------------
See `docs/TESTING_GUIDE.md` and `docs/PERFORMANCE_OPTIMIZATION.md` for developer guidance.

License
-------
Add a license file (e.g., MIT) if you intend to open-source this project.
