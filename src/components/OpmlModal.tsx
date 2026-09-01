import React, { useState } from 'react';
import {
  X,
  FileCode,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { FeedSource } from '../types';
import { parseOpml, generateOpml } from '../services/feedService';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface OpmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
  onImportFeeds: (newFeeds: FeedSource[]) => void;
  onResetToSampleFeeds: () => void;
}

export const OpmlModal: React.FC<OpmlModalProps> = ({
  isOpen,
  onClose,
  feeds,
  onImportFeeds,
  onResetToSampleFeeds,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'sample'>('import');
  const [pastedXml, setPastedXml] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const dialogRef = useDialogFocus(isOpen, onClose);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseOpml(text);
        if (result.allFeeds.length === 0) {
          throw new Error('No valid RSS/Atom feed subscriptions found in this OPML file');
        }
        onImportFeeds(result.allFeeds);
        setStatusMessage({
          type: 'success',
          text: `Successfully imported ${result.allFeeds.length} feeds across ${Object.keys(result.categories).length} categories!`,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Failed to parse OPML file',
        });
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pastedXml.trim()) return;
    try {
      const result = parseOpml(pastedXml);
      if (result.allFeeds.length === 0) {
        throw new Error('No valid feed outlines detected');
      }
      onImportFeeds(result.allFeeds);
      setStatusMessage({
        type: 'success',
        text: `Successfully parsed and imported ${result.allFeeds.length} feeds!`,
      });
      setPastedXml('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Invalid OPML XML content',
      });
    }
  };

  const handleDownloadOpml = () => {
    const xml = generateOpml(feeds);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'frontpage-feeds.opml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(
      {
        title: 'Frontpage Subscriptions Export',
        exportedAt: new Date().toISOString(),
        feedCount: feeds.length,
        feeds,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'frontpage-feeds.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="opml-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opml-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <h2 id="opml-modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
                OPML Feed Manager
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Import from NetNewsWire, Feedly, Reeder, or export subscriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close OPML feed manager"
            className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1 text-xs">
          <button
            onClick={() => {
              setActiveTab('import');
              setStatusMessage(null);
            }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Import OPML
          </button>
          <button
            onClick={() => {
              setActiveTab('export');
              setStatusMessage(null);
            }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
              activeTab === 'export'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Export Feeds
          </button>
          <button
            onClick={() => {
              setActiveTab('sample');
              setStatusMessage(null);
            }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
              activeTab === 'sample'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Sample Curated Data
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            role={statusMessage.type === 'success' ? 'status' : 'alert'}
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* File Upload Zone */}
              <label
                htmlFor="opml-file-input"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)]/50"
              >
                <Upload className="h-8 w-8 text-[var(--color-text-tertiary)]" />
                <span className="mt-2 text-xs font-semibold text-[var(--color-text-primary)]">
                  Choose .opml or .xml file
                </span>
                <span className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                  Supports standard OPML 1.0/2.0 outline hierarchy
                </span>
                <input
                  id="opml-file-input"
                  type="file"
                  accept=".opml,.xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Paste Raw OPML */}
              <div>
                <label htmlFor="opml-paste" className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">
                  Or paste OPML XML content
                </label>
                <textarea
                  id="opml-paste"
                  rows={4}
                  placeholder={`<opml version="2.0">\n  <body>\n    <outline type="rss" xmlUrl="..." title="..." />\n  </body>\n</opml>`}
                  value={pastedXml}
                  onChange={(e) => setPastedXml(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2.5 font-mono text-[11px] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handlePasteImport}
                  disabled={!pastedXml.trim()}
                  className="mt-2 flex h-8 items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 text-xs font-medium text-white shadow-xs hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  Parse & Import Text
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-xs">
                <p className="font-semibold text-[var(--color-text-primary)]">
                  Export {feeds.length} subscriptions
                </p>
                <p className="mt-1 text-[var(--color-text-secondary)]">
                  Your exported feeds will maintain their category groupings, feed URLs, and titles.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadOpml}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs font-semibold text-[var(--color-text-primary)] shadow-xs transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <Download className="h-4 w-4 text-[var(--color-accent)]" />
                  <span>Download .opml File</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs font-semibold text-[var(--color-text-primary)] shadow-xs transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>Download .json Backup</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sample' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  Curated Sample Feeds Package
                </h4>
                <p className="mt-1 text-[var(--color-text-secondary)]">
                  Includes 19 curated tech feeds across Frontend (CSS-Tricks, Smashing Magazine, Josh W. Comeau, MDN), Design (Sidebar.io, NN/g, Figma), DevOps (Cloudflare, Vercel, GitHub), General Tech (Hacker News Best, Pragmatic Engineer), and AI & ML (Simon Willison, Hugging Face).
                </p>
              </div>

              <button
                onClick={() => {
                  onResetToSampleFeeds();
                  setStatusMessage({
                    type: 'success',
                    text: 'Successfully reset to the 19 curated sample feeds!',
                  });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white shadow-xs hover:bg-[var(--color-accent-hover)]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Load All 19 Curated Guest Feeds</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-[var(--color-border)] pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
