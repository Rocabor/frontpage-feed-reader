// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('shows feed count in the hero CTA', () => {
    const { container } = render(<LandingPage onEnterGuestMode={() => {}} feedCount={19} />);
    expect(container.querySelector('#landing-hero-guest-btn')).toHaveTextContent('19 feeds ready');
  });

  it('calls onEnterGuestMode when the header button is clicked', async () => {
    const onEnter = vi.fn();
    const { container } = render(<LandingPage onEnterGuestMode={onEnter} feedCount={5} />);
    const btn = container.querySelector('#landing-header-guest-btn')!;
    await userEvent.click(btn);
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it('calls onEnterGuestMode when the hero CTA is clicked', async () => {
    const onEnter = vi.fn();
    const { container } = render(<LandingPage onEnterGuestMode={onEnter} feedCount={5} />);
    const btn = container.querySelector('#landing-hero-guest-btn')!;
    await userEvent.click(btn);
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it('renders the three feature pillars', () => {
    render(<LandingPage onEnterGuestMode={() => {}} feedCount={19} />);
    expect(screen.getAllByText(/19 Curated Tech Feeds/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3 Adaptive View Layouts/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/OPML 2.0 Import & Export/).length).toBeGreaterThanOrEqual(1);
  });
});
