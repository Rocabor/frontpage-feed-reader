import React, { useState } from 'react';
import {
  X,
  Trash2,
  ExternalLink,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Rss,
  Folder,
  Edit2,
  Check,
} from 'lucide-react';
import { FeedSource } from '../types';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface ManageFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
  categories: string[];
  onDeleteFeed: (feedId: string) => void;
  onUpdateFeedCategory: (feedId: string, newCategory: string) => void;
  onRefreshFeed: (feedId: string) => Promise<void>;
  onRefreshAll: () => void;
}

export const ManageFeedsModal: React.FC<ManageFeedsModalProps> = ({
  isOpen,
  onClose,
  feeds,
  categories,
  onDeleteFeed,
  onUpdateFeedCategory,
  onRefreshFeed,
  onRefreshAll,
}) => {
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const dialogRef = useDialogFocus(isOpen, onClose);

  const handleRefreshSingle = async (feedId: string) => {
    setRefreshingId(feedId);
    try {
      await onRefreshFeed(feedId);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div
      id="manage-feeds-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-feeds-modal-title"
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <Rss className="h-4 w-4" />
            </div>
            <div>
              <h2 id="manage-feeds-modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
                Manage Subscriptions
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {feeds.length} subscribed feeds across {categories.length} categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Manage Subscriptions dialog"
            className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List of feeds */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
            {feeds.map((feed) => {
              const isEditing = editingFeedId === feed.id;
              const isRefreshing = refreshingId === feed.id;

              return (
                <div
                  key={feed.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs transition-colors hover:bg-[var(--color-surface)]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {feed.error ? (
                      <span title={feed.error} className="flex shrink-0 items-center">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      </span>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-[var(--color-text-primary)]">
                          {feed.title}
                        </span>
                        {feed.format && (
                          <span className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.2 text-[9px] font-mono text-[var(--color-text-tertiary)] uppercase">
                            {feed.format}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                        <span className="truncate max-w-[280px] font-mono">{feed.feedUrl}</span>
                        {feed.error && (
                          <span className="text-red-500 font-medium">({feed.error})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Category */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={targetCategory || feed.category}
                          onChange={(e) => setTargetCategory(e.target.value)}
                          className="h-7 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text-primary)]"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (targetCategory) {
                              onUpdateFeedCategory(feed.id, targetCategory);
                            }
                            setEditingFeedId(null);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingFeedId(feed.id);
                          setTargetCategory(feed.category);
                        }}
                        className="flex items-center gap-1 rounded bg-[var(--color-bg-tertiary)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        <Folder className="h-3 w-3 text-[var(--color-accent)]" />
                        <span>{feed.category}</span>
                        <Edit2 className="h-2.5 w-2.5 opacity-50" />
                      </button>
                    )}

                    <button
                      title="Refresh feed"
                      onClick={() => handleRefreshSingle(feed.id)}
                      disabled={isRefreshing}
                      className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                    >
                      <RotateCw
                        className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-[var(--color-accent)]' : ''}`}
                      />
                    </button>

                    <a
                      href={feed.siteUrl || feed.feedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open source link"
                      className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      title="Delete feed"
                      onClick={() => onDeleteFeed(feed.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] p-4">
          <button
            onClick={onRefreshAll}
            className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh All Feeds</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-md bg-[var(--color-accent)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
