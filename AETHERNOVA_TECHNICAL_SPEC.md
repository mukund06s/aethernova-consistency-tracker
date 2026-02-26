# AetherNova Technical Specification & Architectural Overview

This document provides a comprehensive breakdown of the AetherNova Habit Tracker, covering the technology stack, architectural decisions, and implemented features.

---

## 🚀 1. Overall Vision
AetherNova is a premium, high-performance habit tracker designed with a "depth-first" aesthetic. It prioritizes user experience through immersive visual feedback (ambient backgrounds), tactile interactions (magnetic cursor response), and a robust theme system.

---

## 🎨 2. Frontend Architecture

### Technology Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
  - *Why*: Provides optimal performance with Server Components, seamless routing, and industry-standard scalability.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
  - *Why*: Ensures type safety across the application, reducing runtime errors and improving developer velocity.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - *Why*: Utility-first styling for rapid UI development with a consistent design system.
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
  - *Why*: Powering the "Glassmorphism" effects, smooth transitions, and spring-based physics for a premium feel.
- **Data Fetching**: [SWR](https://swr.vercel.app/)
  - *Why*: Implements the "stale-while-revalidate" strategy for instant UI updates and automatic background synchronization.
- **Icons**: [Lucide React](https://lucide.dev/)
  - *Why*: A clean, lightweight, and customizable icon set.

### Key Implementation Details
- **Ambient Background**: A custom-built `<AmbientBackground />` component using the **HTML5 Canvas API**. It features a three-layer particle system (Background, Midground, Foreground) with independent speeds and opacities to simulate 3D depth.
- **Magnetic Cursor Interaction**: Implements real-time repulsion logic where particles react to mouse proximity, creating a tactile, "liquid" interaction layer.
- **Theme System**: A `ThemeContext` manages global states for Light/Dark modes, persisted via `localStorage`. It dynamically updates CSS variables and Canvas rendering colors without page reloads.
- **Onboarding UI**: Polished Login and Register pages with high-impact typography (`font-black`), `base` font sizes for maximum legibility, and glassmorphic form cards.

---

## ⚙️ 3. Backend Architecture

### Technology Stack
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
  - *Why*: Lightweight, fast, and extremely flexible for building RESTful APIs.
- **Language**: TypeScript (compiled via `ts-node-dev` for development).
- **Authentication**: [JSON Web Token (JWT)](https://jwt.io/)
  - *Why*: Stateless, secure session management. Tokens are stored in secure, HTTP-only cookies to prevent XSS attacks.
- **Security**: 
  - `bcryptjs`: For industry-standard password hashing.
  - `helmet`: Secure HTTP headers.
  - `cors`: Managed Cross-Origin Resource Sharing.
  - `express-rate-limit`: Protection against brute-force attacks.

### Key API Features
- **RESTful Auth**: Endpoints for custom Registration, Login, Logout, and User Session retrieval (`/me`).
- **Habit Engine**: Comprehensive logic for managing habit CRUD, archiving, and dynamic streak calculations (Current vs. Longest).
- **Settings API**: Supports name updates, reminder time configurations, and UI preference toggles (Confetti/Sound).
- **Secure Deletion**: A "Danger Zone" endpoint that handles full account cleanup across all relational tables.

---

## 💾 4. Database & Persistence

### Technology Stack
- **Database**: [PostgreSQL](https://www.postgresql.org/)
  - *Why*: Robust, ACID-compliant relational database capable of handling complex habit completion tracking.
- **ORM**: [Prisma](https://www.prisma.io/)
  - *Why*: Best-in-class type safety and developer experience. Provides a declarative schema and automated migrations.

### Data Schema Overview
- **User Model**: Stores credentials, profile data, and UI preferences (`confettiEnabled`, `soundEnabled`).
- **Habit Model**: Tracks habit metadata (title, category, description), archive status, and ordering.
- **HabitCompletion Model**: Relational entries for every time a user marks a habit as done, used for streak calculations and heatmaps.

---

## ✨ 5. Feature Summary (Implemented So Far)

| Component | Status | Description |
| :--- | :--- | :--- |
| **Theme System** | ✅ Complete | Full Light/Dark mode support with persistent state. |
| **Ambient Visuals** | ✅ Complete | 155-particle Canvas system with 3-layer depth and magnetic cursor. |
| **Dashboard** | ✅ Complete | Stats overview, Weekly consistency charts, and 90-day activity heatmap. |
| **Habit Tracking** | ✅ Complete | Full CRUD with categories, streak tracking, and daily reflections (notes). |
| **Settings Hub** | ✅ Complete | Profile editing, preference toggles, and secure account deletion. |
| **Onboarding** | ✅ Complete | High-legibility Login/Register screens with glassmorphism. |
| **Notification Support** | ✅ Complete | Daily reminder time management for habit pings. |

---

*Generated by AetherNova Core Documentation Engine*
