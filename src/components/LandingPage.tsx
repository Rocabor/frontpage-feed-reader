import React from 'react';
import {
  Rss,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Bookmark,
  Layers,
  FileCode,
  Zap,
} from 'lucide-react';
import { Footer } from './Footer';

interface LandingPageProps {
  onEnterGuestMode: () => void;
  feedCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterGuestMode, feedCount }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Landing Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-6 sm:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-xs">
            <Rss className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Frontpage</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="landing-header-guest-btn"
            onClick={onEnterGuestMode}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <span>Try as Guest</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Product Challenge • Frontend Mentor</span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your personalized front page <br className="hidden sm:inline" />
            for tech & engineering.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--color-text-secondary)] sm:text-lg">
            A content aggregator that pulls live RSS & Atom feeds into a single, distraction-free reading dashboard with custom layouts, categories, bookmarking, and OPML synchronization.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              id="landing-hero-guest-btn"
              onClick={onEnterGuestMode}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg"
            >
              <span>Launch Guest Dashboard ({feedCount} feeds ready)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Pillars Grid */}
          <div className="mt-16 grid grid-cols-1 gap-5 text-left md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
                19 Curated Tech Feeds
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Pre-populated across Frontend, Design, Backend & DevOps, General Tech, and AI & ML with real live RSS/Atom parsing.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
                3 Adaptive View Layouts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Switch smoothly between Card Grid, Compact Scan rows, and Editorial Magazine layouts to match your reading mood.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
                OPML 2.0 Import & Export
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Full compatibility with RSS readers (NetNewsWire, Feedly, Reeder) for easy import and export of your subscriptions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <Footer />
    </div>
  );
};
