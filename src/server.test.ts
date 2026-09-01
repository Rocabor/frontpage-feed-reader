import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isPrivateAddress, assertSafeFeedUrl, sanitizeHtml } from '../server';

vi.mock('dns', () => ({
  default: {
    promises: {
      lookup: vi.fn(),
    },
  },
}));

import dns from 'dns';

const mockLookup = dns.promises.lookup as unknown as ReturnType<typeof vi.fn>;

function resolveTo(...addresses: string[]) {
  mockLookup.mockResolvedValue(
    addresses.map((address) => ({
      address,
      family: address.includes(':') ? 6 : 4,
    }))
  );
}

describe('isPrivateAddress', () => {
  it('flags IPv4 private ranges', () => {
    expect(isPrivateAddress('10.0.0.1')).toBe(true);
    expect(isPrivateAddress('172.16.0.1')).toBe(true);
    expect(isPrivateAddress('172.31.255.255')).toBe(true);
    expect(isPrivateAddress('192.168.1.1')).toBe(true);
  });

  it('flags loopback and link-local', () => {
    expect(isPrivateAddress('127.0.0.1')).toBe(true);
    expect(isPrivateAddress('127.0.0.2')).toBe(true);
    expect(isPrivateAddress('169.254.169.254')).toBe(true);
    expect(isPrivateAddress('169.254.1.1')).toBe(true);
  });

  it('flags current-network, CGNAT, multicast, and reserved ranges', () => {
    expect(isPrivateAddress('0.0.0.1')).toBe(true);
    expect(isPrivateAddress('100.64.0.1')).toBe(true);
    expect(isPrivateAddress('100.127.255.255')).toBe(true);
    expect(isPrivateAddress('224.0.0.1')).toBe(true);
    expect(isPrivateAddress('240.0.0.1')).toBe(true);
    expect(isPrivateAddress('255.255.255.255')).toBe(true);
  });

  it('allows public IPv4 addresses', () => {
    expect(isPrivateAddress('8.8.8.8')).toBe(false);
    expect(isPrivateAddress('1.1.1.1')).toBe(false);
    expect(isPrivateAddress('104.20.23.154')).toBe(false);
    expect(isPrivateAddress('172.66.147.243')).toBe(false);
  });

  it('flags IPv6 loopback, ULA, link-local, and multicast', () => {
    expect(isPrivateAddress('::1')).toBe(true);
    expect(isPrivateAddress('::')).toBe(true);
    expect(isPrivateAddress('fd00::1')).toBe(true);
    expect(isPrivateAddress('fc00::1')).toBe(true);
    expect(isPrivateAddress('fe80::1')).toBe(true);
    expect(isPrivateAddress('ff02::1')).toBe(true);
  });

  it('normalizes IPv4-mapped IPv6', () => {
    expect(isPrivateAddress('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateAddress('::ffff:8.8.8.8')).toBe(false);
  });
});

describe('assertSafeFeedUrl', () => {
  beforeEach(() => {
    mockLookup.mockReset();
  });

  it('rejects non-http(s) protocols', async () => {
    await expect(assertSafeFeedUrl('file:///etc/passwd')).rejects.toThrow(
      'Only http and https'
    );
    await expect(assertSafeFeedUrl('ftp://example.com/feed')).rejects.toThrow(
      'Only http and https'
    );
  });

  it('rejects invalid URLs', async () => {
    await expect(assertSafeFeedUrl('not-a-url')).rejects.toThrow('Invalid feed URL');
  });

  it('rejects targets that resolve to a private address (cloud metadata)', async () => {
    resolveTo('169.254.169.254');
    await expect(assertSafeFeedUrl('http://metadata.internal/latest')).rejects.toThrow(
      'non-public address'
    );
  });

  it('rejects loopback / localhost resolutions', async () => {
    resolveTo('127.0.0.1');
    await expect(assertSafeFeedUrl('http://localhost/feed')).rejects.toThrow(
      'non-public address'
    );
  });

  it('rejects when any of multiple resolved addresses is non-public (DNS rebinding guard)', async () => {
    resolveTo('8.8.8.8', '192.168.1.1');
    await expect(assertSafeFeedUrl('http://example.com/feed')).rejects.toThrow(
      'non-public address'
    );
  });

  it('allows targets that resolve only to public addresses', async () => {
    resolveTo('8.8.8.8');
    await expect(assertSafeFeedUrl('http://example.com/feed')).resolves.toBeUndefined();
  });

  it('rejects unresolvable hosts', async () => {
    mockLookup.mockRejectedValue(new Error('ENOTFOUND'));
    await expect(assertSafeFeedUrl('http://does-not-exist.invalid/feed')).rejects.toThrow(
      'could not be resolved'
    );
  });
});

describe('sanitizeHtml', () => {
  it('strips script tags and event handlers', () => {
    const input =
      '<p>Hello</p><script>alert(1)</script><img src="x" onerror="alert(2)">';
    const out = sanitizeHtml(input);
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onerror');
    expect(out).toContain('Hello');
  });

  it('blocks javascript: URLs in links', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('allows benign content through', () => {
    const out = sanitizeHtml(
      '<p><strong>Bold</strong> text and <a href="https://x.com">a link</a></p>'
    );
    expect(out).toContain('<strong>Bold</strong>');
    expect(out).toContain('https://x.com');
  });
});
