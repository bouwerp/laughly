# Laughly: Social Media App Plan

## 1. Project Overview
**Laughly** is a personal joke database and social media application for collecting and sharing funny memes and videos. The initial release focuses on a seamless "Personal Database" where users can save content via direct upload or native system share sheets. 

### Core Architectural Pillars:
- **High-Performance Content Server:** Dedicated infrastructure for hosting and delivering high-resolution images and videos with low latency.
- **Serverless REST Backend:** Scalable API layer for metadata and user management.
- **Native Mobile Integration:** Deep integration with system share sheets and high-speed media playback.

## 2. Engineering Philosophy (Core Mandate)
To ensure long-term flexibility and maintainability, the project adheres to the following principles:
- **Platform Agnosticism:** The core application logic must remain independent of specific third-party providers.
- **Interface Segregation:** All external services (Auth, Storage, Database, AI) must be accessed through well-defined interfaces.
- **Dependency Injection:** Service implementations are injected into the application at the highest level possible, allowing for effortless provider switching.
- **Adapter Pattern:** Use adapters to wrap provider-specific SDKs (e.g., Supabase, Firebase) to match the application's internal interfaces.

## 3. Key Features (Initial Release Focus)
- **Personal Joke Database:** A private, infinite-scrolling collection of the user's saved memes and videos.
- **Content Storage & Delivery:** Fast, reliable hosting for all personal media.
- **"Share to Laughly" Integration:** Native support for receiving content from other apps.

## 3.1 Future Roadmap Features
- **AI Moderation:** Automated content flagging for safety.
- **WebSockets:** Event-driven endpoints for real-time updates.
- **Social Core:** Private messaging, following users, and user profiles.
- **Smart Feed:** Sophisticated algorithms for content discovery.

## 4. Technology Selection List (Current Implementations)

### Frontend (Mobile App)
- **Framework:** [Expo SDK](https://expo.dev/) (React Native).
- **Language:** [TypeScript](https://www.typescriptlang.org/).
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/).
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS).
- **Media Playback:** `expo-video` & `expo-image`.

### Backend & Infrastructure (Current Provider)
- **Primary Provider:** [Supabase](https://supabase.com/) (Used via internal abstraction interfaces).
- **Hosting (Serverless REST):** Supabase Edge Functions.
- **Database:** Supabase PostgreSQL.
- **Content Server (Media Hosting):** Supabase Storage (CDN backed).
- **Authentication:** Supabase Auth (Managed Google/Apple sessions).

### DevOps & Tools
- **Build & Deployment:** [Expo Application Services (EAS)](https://expo.dev/eas).
- **Version Control:** Git with GitHub.

## 5. Proposed Project Structure (Abstractions Focused)
```text
laughly/
├── app/                  # Expo Router directory (UI Layer)
├── components/           # Reusable UI components
├── core/                 # Business Logic & Interfaces (Provider Agnostic)
│   ├── interfaces/       # IAuthService, IStorageService, IDatabaseService
│   ├── entities/         # Domain models (Joke, User, Media)
│   └── use-cases/        # Orchestration logic
├── infrastructure/       # Provider Implementations (Adapters)
│   ├── auth/             # SupabaseAuthAdapter, FirebaseAuthAdapter (future)
│   ├── storage/          # SupabaseStorageAdapter, S3StorageAdapter (future)
│   └── database/         # SupabaseDBAdapter
├── hooks/                # React hooks that consume core interfaces via DI
├── services/             # Dependency Injection containers and service locators
└── utils/                # General helpers
```

## 6. Implementation Phases

### Phase 1: Project Setup & Abstraction Foundation
- [x] Initialize Expo project with TypeScript and Expo Router.
- [x] Configure NativeWind for styling.
- [x] **Define Core Interfaces:** Create `IAuthService`, `IStorageService`, and `IDatabaseService`.
- [x] Set up **Supabase** as the initial infrastructure provider via adapters.
- [x] Initialize **EAS Build** configuration.

### Phase 1.5: CI/CD & Deployment Workflows (Automated Delivery)
- [x] Set up **GitHub Actions** for automated workflows on push to `main`.
- [x] **Backend Deployment:** Automate Supabase Edge Functions deployment.
- [x] **Database Migrations:** Integrate Supabase CLI into CI/CD for automated schema updates.
- [x] **Mobile Builds:** Configure EAS GitHub Action to trigger "Preview" builds for Android and iOS.
- [x] **Environment Secrets:** Securely manage `SUPABASE_ACCESS_TOKEN`, `EXPO_TOKEN`, and other keys in GitHub Secrets.

### Phase 2: Authentication & Security (Abstracted)
- [x] Implement `SupabaseAuthAdapter` for Native Apple and Google Sign-In.
- [x] Set up session management using the `IAuthService` interface.
- [x] Implement Protected Routes (UI Layer).

### Phase 3: The Personal Database (Feed)
- [x] Build the main database view with `FlashList` for high performance.
- [x] Implement the feed logic: initially show all content, ordered by latest.
- [x] Implement `MediaCard` with `expo-video` and `expo-image`.
- [x] Create basic "Delete" and "Favorite" actions for saved items.

### Phase 4: Sharing & Uploading (Core Value)
- [x] **Native Share Intent:** Configure system share sheet integration.
- [x] Implement the `share/` route for incoming media.
- [x] Integrate Supabase Storage for media persistence.

### Phase 5: Organization & Search
- [x] Add basic tagging and search functionality.

### Phase 6: Polishing & Performance
- [x] Optimize media caching and add haptic feedback.
- [x] Implement Profile screen with stats.

### Phase 7: AI Moderation (Roadmap)
- [ ] Define `IModerationService` and integrate into the upload use-case.

### Phase 8: Event-Driven Architecture (Future)
- [ ] Define `IRealtimeService` for WebSocket-based event-driven updates.

## 7. Verification & Testing Strategy
- **Interface Mocking:** Use mocks of `core/interfaces` to test the UI and business logic independently of providers.
- **Adapter Integration Tests:** Verify each adapter correctly communicates with its provider (e.g., Supabase).
- **Provider Swap Simulation:** (Future) Verify that swapping an adapter (e.g., Auth) requires zero changes to the UI layer.
