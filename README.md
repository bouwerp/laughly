# Laughly: Social Media Joke Archive

Laughly is a personal joke database and social media application built with Expo (React Native) and Supabase.

## 🚀 Getting Started

### 1. Prerequisite: Native Development Build
This project uses native modules (Google Sign-In, Share Intent, Video) and **cannot run in the standard Expo Go app**. You must create a custom Development Build on your device or simulator.

#### To build and install for the first time:
*   **iOS Simulator:** `npx expo run:ios`
*   **Android Emulator:** `npx expo run:android`
*   **Physical Device:** `npx expo run:ios --device` or `npx expo run:android`

*Note: For iOS, you must have Xcode installed. For Android, you must have Android Studio and a valid SDK.*

---

## 🛠 Development Workflow

The project supports two backend targets: **Local (Docker)** and **Cloud (Supabase Production)**.

### Option A: Local Development (Offline)
Runs a full Supabase stack on your machine via Docker. Use this for schema changes or testing without affecting production data.

1.  **Start Local Backend:** `npm run supabase:start`
2.  **Run App (Local Mode):** `npm run dev:local`
    *   *This script automatically switches `.env` to `.env.local` and starts the Expo dev server.*
3.  **Local Mock Sign-In:** When prompted on the device, select "Use Test Session" to sign in as `test@example.com` (password: `password123`).

### Option B: Cloud Development (Live)
Connects directly to the production Supabase instance.

1.  **Run App (Cloud Mode):** `npm run dev:cloud`
    *   *This script switches `.env` to `.env.production` and starts the Expo dev server.*
2.  **Real Google Sign-In:** Uses the native `@react-native-google-signin/google-signin` module.

---

## 🏗 Key Commands

| Command | Description |
| :--- | :--- |
| `npm run dev:local` | Switch to local environment and start Expo |
| `npm run dev:cloud` | Switch to production environment and start Expo |
| `npx expo prebuild` | Re-generate native `ios` and `android` directories |
| `supabase db reset` | Reset local database and apply all migrations |
| `supabase db push` | Push local migrations to the production database |
| `supabase functions deploy [name]` | Deploy an Edge Function to production |

---

## 📱 Features & Native Integration

### Native Share Intent
Laughly is registered with the system share sheet. You can share images, videos, or text from other apps (like Instagram, Photos, or Safari) directly to Laughly.
*   **Testing:** Open your Photos app, select a meme, tap Share, and find "Laughly" in the app list.

### Realtime Updates
The database uses Supabase Realtime. When a joke is added (via the app or the share extension), your feed will update automatically on all devices without a manual refresh.

---

## 🔑 Environment Configuration
*   `.env.local`: Configured for the local Supabase Docker instance.
*   `.env.production`: Configured for the `bajyzxldvfharthlptud.supabase.co` project.
*   **Google Auth:** Ensure your Web Client ID is added to the "Authorized Client IDs" list in the Supabase Dashboard for the environment you are testing.
