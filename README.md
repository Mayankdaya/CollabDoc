<div align="center">

# CollabDoc ✨

Real-time, AI‑powered collaborative document editing for modern teams.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Genkit](https://img.shields.io/badge/Genkit-1.14-4285F4?logo=google&logoColor=white)](https://github.com/googleapis/genkit)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-Y.js-6C5CE7)](https://liveblocks.io/)
[![Twilio](https://img.shields.io/badge/Twilio-WebRTC%20ICE-F22F46?logo=twilio&logoColor=white)](https://www.twilio.com/)

</div>

---

<div align="center">

<a href="#getting-started"><img src="https://img.shields.io/badge/Quick%20Start-Run%20Locally-0EA5E9?style=for-the-badge" alt="Quick Start"/></a>
<a href="#showcase"><img src="https://img.shields.io/badge/Showcase-See%20Screenshots-22C55E?style=for-the-badge" alt="Showcase"/></a>
<a href="#environment-variables"><img src="https://img.shields.io/badge/Configure-.env-F97316?style=for-the-badge" alt="Env"/></a>

</div>

## Overview

CollabDoc is a modern, enterprise‑grade collaborative editor built with Next.js App Router, TipTap, Y.js, and Liveblocks for real‑time presence and sync. It’s supercharged with Genkit + Google Gemini for assisted writing, summarization, and translation. Optional Twilio ICE integration improves WebRTC reliability behind strict networks. Designed with ShadCN UI, Radix Primitives, and Tailwind, it delivers a delightful, responsive experience.

> Demo: Coming soon. You can run locally via `npm run dev` and open http://localhost:9002

## Showcase

Place the following images under `public/readme/` and they will render below on GitHub:

- `public/readme/landing-hero.png` — Landing hero section
- `public/readme/editor-dark.png` — Editor UI (dark) with toolbar
- `public/readme/editor-ai-chat.png` — AI assistant chat inside the editor

<div align="center">

<img src="https://github.com/user-attachments/assets/2db3fb87-7a7b-4a17-8039-4c1a5982750e" alt="CollabDoc Landing Hero" width="960" style="border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,.25);"/>
<br/>
<em>Landing page — Craft Intelligence, Together.</em>

<br/><br/>

<img src="https://github.com/user-attachments/assets/43de5bda-c639-44ca-a087-870eb84e805c" alt="CollabDoc Editor Dark" width="960" style="border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,.25);"/>
<br/>
<em>Beautiful, distraction‑free editor with TipTap and ShadCN UI.</em>

<br/><br/>

<img src="https://github.com/user-attachments/assets/75425baf-8662-4818-b819-2ab3072798d4" alt="CollabDoc Homepage Content" width="960" style="border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,.25);"/>
<br/>
<em>Unified Workspace</em>

</div>

> Don’t see images? Add the files with the exact names above into `public/readme/` and commit them.

## Table of Contents

- [Overview](#overview)
- [Showcase](#showcase)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [NPM Scripts](#npm-scripts)
- [Key Endpoints & Modules](#key-endpoints--modules)
- [Design & UX](#design--ux)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Highlights

- ✨ Polished dark UI with subtle glassmorphism and spotlight effects.
- 🤝 Real‑time multiplayer editing with presence cursors and avatars.
- 🤖 AI assistant embedded in the editor for ideation, rewriting, and summarization.
- 🧩 Modular TipTap extensions: tables, tasks, code, highlights, alignment, and more.
- 🔐 Production‑ready auth and data using Firebase (Auth + Firestore).
- 🌐 Reliable connectivity with optional Twilio ICE or custom TURN.

## Features

- Real‑Time Collaboration: Live cursors, selections, and conflict‑free editing with Y.js and Liveblocks.
- Rich Text Editing: TipTap‑based editor with tables, images, lists, headings, code, highlights, tasks, text align, underline, and more.
- AI‑Assisted Writing: Summarize, translate, and generate content using Genkit + Gemini.
- Presence & Comments: Presence via Liveblocks; commenting components ready to extend.
- Secure Auth & Storage: Firebase Auth + Firestore (configurable).
- Connectivity Options: Optional Twilio ICE servers endpoint for WebRTC.
- Production‑Ready UI: ShadCN UI, Radix, Tailwind, typography, and thoughtful animations.

## Tech Stack

- Framework: Next.js 15 (App Router) with TypeScript
- Editor: TipTap 2 (+ extensions) and Y.js
- Realtime/Presence: Liveblocks (`@liveblocks/*`)
- AI: Genkit + Google Gemini (`@genkit-ai/googleai`, `genkit`)
- Auth/DB: Firebase (Auth, Firestore), `firebase-admin`
- WebRTC: Optional Twilio Token API for ICE servers
- UI/UX: Tailwind CSS, ShadCN UI, Radix UI, Lucide, Framer Motion

### Tech Stack Icons

Small note: Icons are 32px for consistency; a minimal badge is used only when an official icon isn’t available.

#### Core
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="32" alt="JavaScript" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="32" alt="TypeScript" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="32" alt="React" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" height="32" alt="Next.js" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" height="32" alt="Tailwind CSS" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="32" alt="Node.js" />
</p>

#### Realtime & Editor
<p align="left">
  <img src="https://avatars.githubusercontent.com/u/77916034?s=200&v=4" height="32" alt="Liveblocks" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Y.js-CRDT-000000?logoColor=white" height="20" alt="Yjs" />
  <img width="8" />
  <img src="https://img.shields.io/badge/TipTap-Editor-6E56CF?logoColor=white" height="20" alt="TipTap" />
</p>

#### AI & Backend
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" height="32" alt="Firebase" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/google/4285F4" height="32" alt="Google / Gemini (Genkit)" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/twilio/F22F46" height="32" alt="Twilio" />
</p>

#### UI & Motion
<p align="left">
  <img src="https://cdn.simpleicons.org/radixui/94A3B8" height="32" alt="Radix UI" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/framer/0055FF" height="32" alt="Framer Motion" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/lucide/0EA5E9" height="32" alt="Lucide" />
  <img width="8" />
  <img src="https://img.shields.io/badge/ShadCN-UI-0EA5E9" height="20" alt="ShadCN" />
</p>

#### Forms, Charts & UX
<p align="left">
  <img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990" height="20" alt="React Hook Form" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Recharts-FF6384" height="20" alt="Recharts" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Embla%20Carousel-111827" height="20" alt="Embla Carousel" />
  <img width="8" />
  <img src="https://img.shields.io/badge/date--fns-00A185" height="20" alt="date-fns" />
</p>

#### DX & Tooling
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postcss/postcss-original.svg" height="32" alt="PostCSS" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg" height="32" alt="ESLint" />
  <img width="8" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="32" alt="TypeScript" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/netlify/00C7B7" height="32" alt="Netlify" />
  <img width="8" />
  <img src="https://cdn.simpleicons.org/githubactions/2088FF" height="32" alt="GitHub Actions" />
</p>

<!-- Additional minimal badges for items without official icons -->
<p align="left">
  <img src="https://img.shields.io/badge/Genkit-AI-4285F4" height="20" alt="Genkit" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Zod-Validation-0F766E" height="20" alt="Zod" />
</p>

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Next.js (App Router)                     │
│                       UI: ShadCN + Radix + Tailwind                │
│                 TipTap Editor  ───  Liveblocks Presence             │
└───────────────┬───────────────────────────┬────────────────────────┘
                │                           │
        Genkit + Gemini                 Firebase (Auth/Firestore)
          (AI features)                    Secure backend APIs
                │                           │
                └───────────── WebRTC Collaboration ────────────────┐
                                │                                    │
                             Twilio ICE                         TURN/STUN
                      (optional dynamic servers)       (env-configurable relay)
```

## Project Structure

```
src/
  app/
    api/
      webrtc/ice/route.ts       # Twilio ICE servers endpoint
    documents/                  # App pages (documents, etc.)
    login/                      # Auth page
    page.tsx                    # Landing page
    layout.tsx                  # App layout + providers
  components/
    editor/                     # TipTap editor and UI
    landing/                    # Landing UI (navbar, hero, features)
    ui/                         # ShadCN UI components
  hooks/                        # React hooks
docs/
  blueprint.md                  # Product/Design blueprint
```

## Environment Variables

Create a `.env` file in the project root. See `.env.example` for details.

```env
# Public Firebase web config (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Liveblocks public key (client)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=

# Gemini API key (server only)
GEMINI_API_KEY=

# Optional: Twilio for WebRTC ICE (server only)
# Used by src/app/api/webrtc/ice/route.ts
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Optional TURN override (client)
NEXT_PUBLIC_TURN_URL=
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_PASSWORD=
NEXT_PUBLIC_TURN_FORCE_RELAY=false
```

Notes:

- If `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are not set, the ICE endpoint responds with an empty list so the client can fall back to your TURN/STUN envs.
- See `src/app/api/webrtc/ice/route.ts` for the implementation that fetches Twilio ICE servers.

## Getting Started

Prerequisites:

- Node.js 18+
- npm 9+ (or pnpm/yarn if preferred)

Install and run:

```bash
git clone https://github.com/Mayankdaya/CollabDoc.git
cd CollabDoc
npm install

# Create and populate .env (see above)
cp .env.example .env  # then edit values

# Start Genkit dev harness + Next.js (port 9002)
npm run dev
```

Open http://localhost:9002 in your browser.

## NPM Scripts

- dev: genkit start -- next dev -p 9002
- build: next build
- start: next start
- lint: next lint
- typecheck: tsc --noEmit
- test:chat: genkit eval:run -f src/ai/dev.ts chat-test
- test:api: genkit eval:run -f src/ai/dev.ts api-key-test

## Key Endpoints & Modules

- API: `src/app/api/webrtc/ice/route.ts`
  - Returns Twilio ICE servers if `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN` are set.
  - Otherwise returns an empty array so clients can use env TURN/STUN.

- Landing Page: `src/app/page.tsx`
  - Marketing sections, feature highlights, testimonials, and CTA.

- Editor Components: `src/components/editor/`
  - TipTap setup and rich text features.

## Design & UX

- Based on the blueprint in `docs/blueprint.md` (color palette, typography, iconography).
- Uses ShadCN UI + Radix primitives for accessible, consistent components.
- Tailwind utilities + custom effects (Spotlight, glow) for polish.

## Premium Design Principles

- Consistent spacing, typography scale, and motion curves for a refined feel.
- Subtle depth via shadows and translucency, never distracting from content.
- High-contrast accessible color choices; meets WCAG AA where feasible.
- Keyboard‑first interaction and ARIA attributes via Radix primitives.

## Deployment

- Next.js standard build: `npm run build && npm start`.
- Netlify config present: `netlify.toml` (optional).
- App Hosting: `apphosting.yaml` (optional for your platform).

Ensure environment variables are set in your hosting provider. For Twilio ICE, set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` as server environment variables.

## Roadmap

- Comment threads with mentions and notifications.
- Document export to PDF/DOCX with layout fidelity.
- Offline editing and sync reconciliation.
- Role‑based access control and granular permissions.
- Expanded AI tools (tone, rewrite, outline).

## Troubleshooting

- WebRTC failing on restricted networks:
  - Provide a TURN reachable over TCP/TLS 443 via `NEXT_PUBLIC_TURN_URL`.
  - Or configure Twilio credentials for dynamic ICE via the `/api/webrtc/ice` route.

- Genkit/Gemini calls fail:
  - Verify `GEMINI_API_KEY` and that `npm run dev` is used to start the Genkit harness.

- Images blocked by Next Image:
  - See `next.config.ts` and ensure your domains are allowed (e.g., `picsum.photos`, `placehold.co`).

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and open a pull request.

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a PR

## License

This project is licensed under the MIT License.
