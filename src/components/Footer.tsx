import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="app-footer"
      className="border-t border-[var(--color-border)] bg-transparent py-4 text-center text-xs text-[var(--color-text-tertiary)] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <nav
          aria-label="Attribution credits"
          className="flex flex-wrap items-center justify-center gap-1.5 leading-relaxed"
        >
          <span>Challenge by</span>
          <a
            href="https://www.frontendmentor.io?ref=challenge"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline transition-colors"
          >
            FrontendMentor
          </a>

          <span className="hidden sm:inline text-[var(--color-text-tertiary)] opacity-60">•</span>

          <div className="basis-full sm:hidden" />

          <span>Coded by</span>
          <a
            href="https://www.frontendmentor.io/profile/Rocabor"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline transition-colors"
          >
            @Rocabor
          </a>
          <span className="ml-1 text-[var(--color-text-tertiary)]">&copy; 2026</span>
        </nav>
      </div>
    </footer>
  );
};
