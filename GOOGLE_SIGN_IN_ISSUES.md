# Google Sign-In Troubleshooting & Configuration Guide

This document records the critical configuration hurdles and solutions encountered while implementing Google Sign-In with Supabase in an Expo Development Client environment.

## 1. The "Unacceptable Audience" Error

**Symptom:** 
Signing in with Google fails with the following error in the console or Supabase logs:
`AuthApiError: Unacceptable audience in id_token: [600264258555-....apps.googleusercontent.com]`

**Cause:**
The Supabase Dashboard has two different fields for Google Client IDs. If you place a comma-separated list of all your client IDs (Web, iOS, Android) into the *primary* "Client ID" field at the top of the Google provider settings, Supabase reads the entire comma-separated string as a single, invalid audience. When the Google SDK sends back a token containing only the Web Client ID as the audience, Supabase rejects it because it doesn't exactly match the massive string.

**Solution:**
1. In the Supabase Dashboard -> Authentication -> Providers -> Google:
2. **Client ID (Top Box):** Enter **ONLY** the Web Client ID here. No commas, no other IDs.
3. **Authorized Client IDs (Bottom Box):** Enter the comma-separated list of all Client IDs (Web, iOS, Android) here.
4. **Skip nonce checks:** Ensure this is toggled **ON** if using native mobile SDKs.

## 2. The `127.0.0.1` Stuck Environment (Metro Caching)

**Symptom:**
Despite switching the environment to production (`.env.production`), the app continues to attempt connections to the local Supabase instance (`http://127.0.0.1:54321`).

**Cause:**
Expo's Metro bundler has a hardcoded priority list for environment variables. It will *always* prioritize a file named `.env.local` over a file named `.env`. If a `.env.local` file exists in the directory, Metro will aggressively cache and load those variables, ignoring any scripts that copy `.env.production` into `.env`.

**Solution:**
Never leave a file named `.env.local` in the project root if you intend to switch environments dynamically.
1. Rename `.env.local` to `env.local` (remove the leading dot).
2. Rename `.env.production` to `env.production`.
3. Update switching scripts (like `env-switch.sh`) to copy `env.local` or `env.production` into the active `.env` file.
4. Run `npx expo start --clear` to forcefully purge the Metro cache.

## 3. The "localhost" Safari Redirect Error (Expo Schemes)

**Symptom:**
When using the WebBrowser OAuth flow (`signInWithOAuth`), the user successfully authenticates in Safari, but the browser attempts to redirect to `localhost:3000` (which fails on a physical device or simulator) instead of returning to the app.

**Cause:**
In an Expo Development Client, the `Linking.createURL()` helper generates a deep link scheme prefixed with `exp+` (e.g., `exp+laughly://`). The Supabase Cloud Dashboard's "Redirect URLs" validation often rejects URLs containing the `+` character. Because Supabase doesn't recognize the `exp+laughly://` return URL as valid, it falls back to its default site URL (`localhost:3000`).

**Solution:**
1. In the Supabase Dashboard -> Authentication -> URL Configuration:
2. Add the clean custom scheme to the Redirect URLs list: `laughly://*`
3. In the application code (`SupabaseAuthAdapter.ts`), bypass `Linking.createURL()` and explicitly pass the clean scheme to Supabase:
   ```typescript
   const redirectUrl = 'laughly://(tabs)';
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
   });
   ```
This forces Supabase to use an allowed URL, which the mobile OS successfully routes back to the app.
