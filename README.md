# Laughly 🤣

**Laughly** is a high-performance personal joke database and social media application designed for collecting, organizing, and sharing the funniest memes and videos. 

Built with **Expo (React Native)** and **Supabase**, Laughly offers a seamless experience for saving content you find across the web or in your gallery, ensuring you never lose a hilarious moment again.

---

## 🚀 Current Status: Phase 6 (Polishing & Performance) Complete

We have successfully established the foundational core of Laughly, focusing on a robust "Personal Database" experience. The app is fully functional with native authentication, high-performance media playback, and deep system integration.

### ✅ Supported Features
- **Native Authentication:** Seamless, secure sign-in with **Google** and **Apple** via native ID Token flows (Supabase Auth).
- **Personal Joke Database:** A fluid, infinite-scrolling feed of your saved memes and videos using `@shopify/flash-list`.
- **Elite Media Playback:** High-performance rendering for images (`expo-image`) and videos (`expo-video`) with built-in caching and auto-play.
- **"Share to Laughly" (Native):** Save content directly from Safari, Photos, Instagram, or other apps using the system share sheet (`expo-share-intent`).
- **Manual Uploads:** Simple in-app interface for selecting and uploading media from your device library.
- **Organization & Search:** Fast, local filtering of your database by **Title**, **Description**, and **Tags**.
- **Tactile Feedback:** Integrated **Haptic Feedback** (`expo-haptics`) for a premium, responsive user experience.
- **Automated CI/CD:** 
  - **Backend:** Automatic deployment of Supabase Edge Functions and DB migrations on push to `main`.
  - **Mobile:** Automated EAS builds for iOS and Android triggered by code changes.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Expo SDK (React Native) + TypeScript
- **Navigation:** Expo Router (File-based)
- **Styling:** NativeWind v4 (Tailwind CSS)
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** Reactive Hooks + Service Container (Dependency Injection)

### Backend & Infrastructure
- **Provider:** Supabase (PostgreSQL + Auth + Storage)
- **Compute:** Supabase Edge Functions (Serverless Deno)
- **Hosting:** S3-compatible storage with global CDN
- **Security:** Row Level Security (RLS) + encrypted session storage (`expo-secure-store`)

---

## 🔮 Future Roadmap

Laughly is evolving from a personal database into a robust social platform:

- **Phase 7: AI Moderation:** Automated content flagging for safety using AI vision APIs.
- **Phase 8: Real-time Social:** WebSocket-based event broadcasting for live updates.
- **Phase 9: Social Core:** Private messaging, user following, and public profiles.
- **Phase 10: Discovery Algorithm:** A sophisticated feed for discovering the world's funniest content.

---

## 🏗 Engineering Philosophy
Laughly is built with a **Platform Agnostic** mindset. By utilizing **Interface Segregation** and **Dependency Injection**, the core business logic is entirely decoupled from specific providers (like Supabase). This allows for effortless switching of infrastructure (e.g., to AWS or Firebase) without refactoring the application's domain layer.

---

## 🏁 Getting Started

### Prerequisites
- Node.js 20+
- Expo Go or a Development Build
- Supabase Account (for backend services)

### Installation
1. Clone the repository: `git clone https://github.com/bouwerp/laughly.git`
2. Install dependencies: `npm install --legacy-peer-deps`
3. Configure environment variables in `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
4. Start the app: `npx expo start`

---

*Made with ❤️ and plenty of laughs.*
