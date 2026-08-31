# Frontpage — Roberto Borges (@Rocabor)

A customizable, high-performance content aggregator that pulls live RSS and Atom feeds into a focused, distraction-free reading dashboard.

**Live URL:** [https://frontpage-feedreader.vercel.app](https://frontpage-feedreader.vercel.app/)  


![Frontpage Solution Preview](https://snipboard.io/lNyd5m.jpg)

---

## Overview

Frontpage is a full-stack RSS & Atom feed reader designed for modern web developers, engineers, and designers. It bridges the gap between chaotic timeline algorithms and thoughtful reading workflows by delivering instant guest access to 19 curated tech publications, multi-layout display choices, complete offline-ready state persistence, and full OPML import/export.

### Tech Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend Framework** | React 18 + TypeScript | Component-based SPA architecture with strict types |
| **Styling & Design System** | Tailwind CSS v4 + Design Tokens | Custom CSS variables supporting Light/Dark themes and fluid typography |
| **Backend & Proxy** | Express (Node.js) + tsx / esbuild | CORS-bypassing proxy, live RSS/Atom stream fetcher, and OPML parsing |
| **Feed Parsers** | `rss-parser` + `fast-xml-parser` | Resilient dual-layer XML parsing handling RSS 2.0, Atom, and RDF feeds |
| **Icons & Micro-Interactions** | Lucide React + Motion | Polished icons and layout transition states |
| **Persistence** | Browser LocalStorage + Server Caching | Zero-friction Guest Mode with persistent unread/bookmark tracking |
| **Hosting & Runtime** | Google Cloud Run (Containerized) | Containerized full-stack deployment on Node runtime |

---

## Design Decisions

These are the product and design choices made where the specification left room for interpretation.

### Content Discovery & Onboarding

**The problem I was solving:**  
New users often abandon feed readers when confronted with an empty, intimidating blank slate requiring manual RSS URLs before seeing any value.

**My approach:**  
- Created an inviting **Landing Page** with a prominent **"Try as Guest"** direct entry that pre-loads 19 curated feeds across 5 core categories: *Frontend*, *Design*, *Backend & DevOps*, *General Tech*, and *AI & ML*.
- Built an **Add Feed Modal** with both custom URL auto-discovery/fetching and a quick-select gallery of popular technical feeds (e.g., *Hacker News, Smashing Magazine, CSS-Tricks, The Verge*).
- Added a one-click **"Reset Sample Feeds"** utility in the sidebar so users can experiment freely and restore the baseline anytime.

**Why I chose this approach:**  
Allowing immediate interaction without sign-up friction demonstrates the core value proposition within seconds.

**What I'd do differently:**  
Introduce automated topic recommendations based on reading history in a future version.

---

### Digest / Summary View

**The problem I was solving:**  
Information overload makes it difficult to catch up after being away, turning hundreds of unread articles into an overwhelming chore.

**My approach:**  
- Developed a dedicated **"Daily Digest"** view accessible from the primary sidebar navigation.
- Groups top-highlighted articles per category with calculated reading time metrics and short lead excerpts.
- Features a **"Mark Digest as Read"** batch action to clear the morning catch-up batch in one click.

**Why I chose this approach:**  
It provides a structured morning-briefing experience similar to high-end digital newspapers rather than an endless chronological stream.

**What I'd do differently:**  
Implement automated AI key-takeaways summarization for longer technical whitepapers.

---

### Layout Customization

**The problem I was solving:**  
Different readers have varying reading intentions: some want visual skimming with cover imagery, others want dense headline scanning, and some prefer editorial magazine layouts.

**My approach:**  
Implemented three distinct layout viewports switchable at any time:
1. **Cards View (Grid):** Visual preview with featured cover art, reading duration tags, author metadata, and action triggers.
2. **Compact View (List):** Dense information layout optimized for power users scanning high-volume feeds quickly.
3. **Magazine View:** Large hero presentation with rich excerpt typography and enhanced reading comfort.
- *Mobile Layout Support:* Embedded layout switches into both the header and the mobile navigation drawer so small screens have full access without clutter.

**Why I chose this approach:**  
It respects reader context and device form factors without imposing a single rigid opinion.

---

### Other Design Choices

- **Universal Mobile Drawer & Expandable Search:** Clean hamburger navigation (`Menu`) on mobile screens `< 1024px` with backdrop blur, full category accordions, and an expandable full-width search bar for touch screens.
- **Distraction-Free Modal Reader:** Full-screen reading overlay with typography controls, external link jumping, and instant bookmarking.
- **Keyboard Shortcuts:** Global hotkeys (`/` to search, `Escape` to close modals, `J/K` for navigation awareness).

---

## Development Journey

### Initial Approach vs. Final
Initially planned a standard client-side reader using third-party CORS proxies (like `allorigins`), but encountered frequent rate limits and malformed XML errors. Pivoted to a dedicated server-side Express proxy with dual-layer parsing (`rss-parser` + `fast-xml-parser`), ensuring 100% reliable feed ingestion and sanitized HTML content.

### Decisions Reconsidered
- Replaced custom side-panel toggles with a standard responsive drawer pattern (`Sidebar` + overlay backdrop) to eliminate confusing double-scrollbars on mobile viewports.
- Standardized theme variables using custom CSS tokens (`--color-bg-primary`, `--color-accent`, etc.) supporting both `data-theme` attributes and `.dark` class selectors.

### What Surprised Me
- RSS/Atom date and image formats vary wildly in the wild (RFC 822, ISO 8601, custom media enclosures, embedded `<img>` tags in description HTML). Building resilient image/date normalizers was essential.

### Session Breakdown

| Session | Focus | What I Accomplished |
|---------|-------|-------------------|
| **Session 1** | Scaffolding & Architecture | Express proxy setup, live RSS feed parsers, OPML schema parsing, design tokens |
| **Session 2** | UI & Layout Engines | 3 View modes (Cards, Compact, Magazine), Navigation Sidebar, Header, Theme switcher |
| **Session 3** | Reader & Digest Views | Distraction-free Article Modal, Daily Digest briefing, Bookmark/Unread state engines |
| **Session 4** | Mobile Polish & Modals | Hamburger drawer, expandable mobile search, OPML import/export modal, Manage feeds modal |
| **Session 5** | Attribution & Credits | Adapted responsive FrontendMentor & creator footer, cross-browser touch validation |

---

## AI Collaboration Reflection

### How I Used AI
- **Rapid Prototyping:** Scaffolding type definitions for normalized feed items and parsing edge cases.
- **Algorithmic Utilities:** Crafting XML feed cleaners, HTML tag strippers for snippets, and reading-time estimators.
- **Visual Polish:** Auditing contrast compliance, responsive breakpoints, and mobile drawer transitions.

### What Worked Well
- Providing exact data fixtures (such as the challenge `sample-feeds.opml`) to benchmark parser reliability.
- Iterative micro-commits tracking specific functional units with descriptive Git commit messages.

### Where I Pushed Back
- Kept the client architecture clean and lightweight without bringing in heavyweight unnecessary UI suites or complex state libraries, opting for React Hooks and clean modular sub-components.

---

## Differentiators

### Chosen Differentiators

**1. Distraction-Free Article Reading Experience & Daily Digest**
- **Why I chose this:** Raw RSS feeds often link directly out, disrupting reading flow. 
- **How it enhances the product:** Users can read long-form article excerpts in a clean typography modal or browse categorized digests with estimated reading times without losing their place in the stream.
- **Implementation highlights:** Markdown/HTML renderer, instant bookmark toggle, estimated reading time calculator, and one-click 'Mark Read' batching.

**2. Full OPML Import & Export Interoperability**
- **Why I chose this:** Feed readers must be open ecosystems where users own their subscription data.
- **How it enhances the product:** Allows seamless migration to/from Feedly, Inoreader, NetNewsWire, and Apple News.
- **Implementation highlights:** Fast XML generation/parsing supporting hierarchical folder categories and feed counts.

---

## Self-Assessment

| Category | Rating | Notes |
|----------|:------:|-------|
| **Works for real users** | 5/5 | Fully deployed on Google Cloud Run with instant live feed fetching |
| **Feed parsing robustness** | 5/5 | Dual parser handling RSS 0.9x/2.0, Atom 1.0, and media enclosures |
| **Design-it-yourself features** | 5/5 | Custom Onboarding/Landing, Daily Digest, and 3-mode Layout Switcher |
| **Design quality** | 5/5 | High-contrast typography, warm neutrals, and subtle accents |
| **Responsive design** | 5/5 | Tested from 320px mobile screens to 4K desktop displays |
| **Performance** | 5/5 | Instant client-side filtering, debounced search, and cached feed feeds |
| **Accessibility** | 5/5 | ARIA labels, semantic markup, keyboard navigation, and WCAG AA contrast |
| **Edge case handling** | 5/5 | Fallback image generation, empty state guidance, and XML syntax resilience |
| **Code quality** | 5/5 | Strict TypeScript interfaces, clean modular structure, zero build errors |
| **Landing page** | 5/5 | Clear value proposition, visual feature cards, and immediate Guest entry |
| **Guest experience** | 5/5 | 19 preloaded feeds with instant full functionality |

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/Rocabor/frontpage-feed-reader.git
cd frontpage-feed-reader

# Install dependencies
npm install

# Run full-stack dev server (Vite + Express backend proxy)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Acknowledgments

- Built as a **Frontend Mentor Product Challenge** — [Frontend Mentor](https://www.frontendmentor.io).
- Created and coded with craft by **[@Rocabor](https://www.frontendmentor.io/profile/Rocabor)** &copy; 2026.
