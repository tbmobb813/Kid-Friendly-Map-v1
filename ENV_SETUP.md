# Local environment setup (secure)

This project reads runtime configuration from Expo `extra` and environment variables prefixed with `EXPO_PUBLIC_`. For local development, add sensitive keys to a local file that is ignored by Git.

Recommended steps

1. Copy the example env file to a local override and edit the values (this file is ignored by Git):

```bash
cp .env.example .env.local
# then edit .env.local to set your real API keys
```

2. Required value for routing (ORS):

- `EXPO_PUBLIC_ORS_API_KEY` — your OpenRouteService API key.

3. Optional values (useful for transit/OTP2):

- `OTP2_BASE_URL` — URL of your OTP2 server.
- `OTP2_ROUTER_ID` — router id for OTP2 (default: `default`).

4. Confirm `.env.local` is ignored:

The repository already includes `/.env*.local` in `.gitignore`, so `.env.local` will not be committed.

5. Use the environment locally:

- For Expo / Metro, Expo will automatically pick up `EXPO_PUBLIC_*` variables from `.env.local` when running `expo start` in most setups (or if using `dotenv` in your dev scripts). If you use `eas` or CI, set the same variables as secrets.

- If you need to set it in the shell for a one-off run, export it:

```bash
export EXPO_PUBLIC_ORS_API_KEY="your_real_key_here"
npm start
```

6. CI / GitHub Actions:

- Add `EXPO_PUBLIC_ORS_API_KEY` as a secret in your repo settings and reference it in your workflow. Do not commit the key into the codebase.

Verification tests

- Quick network verification (no build): create a tiny Node script that performs the same ORS fetch URL used by `useRouteORS` and run it locally to confirm the key works. I can add that script if you want.

If you'd like, I can now:
- Add a short verification script and run it here (you must provide the key or paste it into the environment for this session), or
- Walk you through adding `.env.local` locally and then run the app/emulator on your machine.
