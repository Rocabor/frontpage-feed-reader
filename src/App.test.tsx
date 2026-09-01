// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

vi.mock('./services/feedService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/feedService')>();
  return {
    ...actual,
    fetchLiveFeed: vi.fn().mockResolvedValue({
      title: 'Mock Feed',
      description: 'A mock feed for testing',
      link: 'https://mock.test',
      items: [
        {
          id: 'mock-article-1',
          title: 'Mock Article from Live Feed',
          link: 'https://mock.test/article-1',
          pubDate: 'Mon, 01 Sep 2026 00:00:00 GMT',
          timestamp: Date.now() - 1000,
          author: 'Mock Author',
          contentSnippet: 'A live-fetched mock article used in integration tests.',
          content: '<p>A live-fetched mock article.</p>',
          readTimeMinutes: 3,
        },
      ],
    }),
  };
});

import * as feedService from './services/feedService';
const mockFetchLiveFeed = vi.mocked(feedService.fetchLiveFeed);

beforeEach(() => {
  localStorage.clear();
  mockFetchLiveFeed.mockClear();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  Object.defineProperty(window, 'navigator', {
    writable: true,
    value: { ...window.navigator, userAgent: 'test' },
  });
});

const user = userEvent.setup();

async function waitForDashboard() {
  await waitFor(() => {
    expect(screen.getAllByText('All Articles').length).toBeGreaterThanOrEqual(1);
  });
}

function getViewSummary(): string {
  const el = document.querySelector('#feed-view-container p') as HTMLElement | null;
  return el?.textContent ?? '';
}

describe('App — guest-mode integration', () => {
  it('starts on the dashboard showing curated articles', async () => {
    render(<App />);
    await waitForDashboard();
    expect(screen.getAllByText('All Articles').length).toBeGreaterThanOrEqual(1);
    expect(getViewSummary()).toContain('10 articles');
  });

  it('shows unread count from curated articles', async () => {
    render(<App />);
    await waitForDashboard();
    expect(getViewSummary()).toContain('10 unread');
  });
});

describe('App — search', () => {
  it('filters articles as the user types in the search box', async () => {
    render(<App />);
    await waitForDashboard();

    const searchInput = screen.getByPlaceholderText(/Press '\/' to focus/);
    await user.type(searchInput, 'CSS');

    await waitFor(() => {
      const titles = screen.getAllByRole('button', { name: /^Open /i });
      expect(titles.length).toBeGreaterThanOrEqual(1);
      expect(titles.length).toBeLessThan(9);
    });

    expect(
      screen.getAllByRole('button', {
        name: /Open The Surprising Truth About Modern CSS Architecture/i,
      }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when search matches nothing', async () => {
    render(<App />);
    await waitForDashboard();

    const searchInput = screen.getByPlaceholderText(/Press '\/' to focus/);
    await user.type(searchInput, 'zzz_nonexistent_query_zzz');

    await waitFor(() => {
      expect(screen.getAllByText('No articles found').length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('App — bookmarking', () => {
  it('toggles bookmark on an article', async () => {
    render(<App />);
    await waitForDashboard();

    const bookmarkBtns = screen.getAllByTitle('Bookmark article');
    expect(bookmarkBtns.length).toBeGreaterThan(0);

    await user.click(bookmarkBtns[0]);

    await waitFor(() => {
      expect(screen.getAllByTitle('Remove bookmark').length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('App — read tracking', () => {
  it('marks an article as read, reducing the unread count', async () => {
    render(<App />);
    await waitForDashboard();

    expect(getViewSummary()).toContain('10 unread');

    const markReadBtns = screen.getAllByTitle('Mark as read');
    expect(markReadBtns.length).toBeGreaterThan(0);

    await user.click(markReadBtns[0]);

    await waitFor(() => {
      expect(getViewSummary()).toContain('9 unread');
    });
  });
});

describe('App — category filtering', () => {
  it('filters articles when a category is selected', async () => {
    render(<App />);
    await waitForDashboard();

    const frontendBtn = document.querySelector('#cat-item-frontend')!;
    await user.click(frontendBtn);

    await waitFor(() => {
      expect(
        screen.getAllByRole('heading', { name: 'Frontend' }).length
      ).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('App — add feed subscription', () => {
  it('opens the add-feed modal, validates a URL, and subscribes', async () => {
    render(<App />);
    await waitForDashboard();

    const addBtn = screen.getAllByTitle('Add New Feed')[0];
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByLabelText('Feed or Website URL')).toBeInTheDocument();
    });

    const urlInput = screen.getByLabelText('Feed or Website URL');
    await user.type(urlInput, 'https://newblog.example.com/feed.xml');

    const testFeedBtn = screen.getByRole('button', { name: /Test Feed/i });
    await user.click(testFeedBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Mock Feed/).length).toBeGreaterThanOrEqual(1);
    });

    const subscribeBtn = screen.getByRole('button', { name: /Subscribe Feed/i });
    await user.click(subscribeBtn);

    await waitFor(() => {
      expect(screen.queryByLabelText('Feed or Website URL')).not.toBeInTheDocument();
    });
  });
});

describe('App — manage feeds', () => {
  it('opens manage modal, deletes a feed, and it disappears from the sidebar', async () => {
    render(<App />);
    await waitForDashboard();

    const manageBtn = screen.getByRole('button', { name: /Manage Feeds/i });
    await user.click(manageBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Manage Subscriptions/i })).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('Delete feed');
    expect(deleteBtns.length).toBeGreaterThan(0);

    await user.click(deleteBtns[0]);

    await waitFor(() => {
      const afterDelete = screen.getAllByTitle('Delete feed');
      expect(afterDelete.length).toBe(deleteBtns.length - 1);
    });
  });
});
