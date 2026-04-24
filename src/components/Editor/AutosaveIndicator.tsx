'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Cloud, CloudOff, History, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCVStore } from '@/store/useCVStore';

type Status = 'idle' | 'saving' | 'saved' | 'offline';

/**
 * Debounced autosave for the CV currently being edited.
 *
 * Design notes:
 * - We only autosave when there is a `currentCvId` (i.e. the draft was already
 *   persisted once); fresh drafts from the landing screen are NOT silently
 *   saved, because we don't want to fill the dashboard with empty CVs.
 * - We compare JSON snapshots with a ref before saving to avoid feedback loops
 *   caused by Zustand rehydration or no-op state updates.
 * - The `snapshot: false` flag tells the store *not* to push a history entry
 *   for every keystroke. We explicitly push a snapshot every 2 minutes so the
 *   user gets a handful of meaningful restore points.
 */
export default function AutosaveIndicator({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const { data } = useCVStore();
  const currentCvId = useCVStore((s) => s.currentCvId);
  const { currentUserId, getUserCVs, upsertCV } = useAppStore();

  const [status, setStatus] = useState<Status>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const lastSerializedRef = useRef<string>('');
  const lastSnapshotAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentUserId || !currentCvId) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSerializedRef.current) return;

    // Something changed: mark as saving and debounce the write.
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const cv = getUserCVs(currentUserId).find((c) => c.id === currentCvId);
        if (!cv) {
          setStatus('idle');
          return;
        }
        // Snapshot every 2 minutes; otherwise just overwrite in place.
        const now = Date.now();
        const shouldSnapshot = now - lastSnapshotAtRef.current > 2 * 60 * 1000;
        if (shouldSnapshot) lastSnapshotAtRef.current = now;
        upsertCV(currentUserId, {
          id: cv.id,
          name: cv.name,
          data,
          snapshot: shouldSnapshot,
        });
        lastSerializedRef.current = serialized;
        setSavedAt(new Date());
        setStatus('saved');
      } catch (err) {
        console.error('[autosave] failed', err);
        setStatus('offline');
      }
    }, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, currentCvId, currentUserId, getUserCVs, upsertCV]);

  if (!currentCvId) return null;

  const label =
    status === 'saving'
      ? 'A guardar...'
      : status === 'offline'
        ? 'Erro ao guardar'
        : savedAt
          ? `Guardado ${formatTime(savedAt)}`
          : 'Guardado';

  return (
    <div
      role="status"
      aria-live="polite"
      className="autosave-indicator"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'var(--background-muted)',
        border: '1px solid var(--card-border)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--foreground-muted)',
      }}
    >
      {status === 'saving' ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : status === 'offline' ? (
        <CloudOff size={14} aria-hidden="true" />
      ) : savedAt ? (
        <Check size={14} aria-hidden="true" />
      ) : (
        <Cloud size={14} aria-hidden="true" />
      )}
      <span>{label}</span>
      {onOpenHistory && (
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Ver histórico de versões"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            border: 'none',
            background: 'transparent',
            color: 'var(--accent)',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <History size={13} aria-hidden="true" /> Histórico
        </button>
      )}
    </div>
  );
}

function formatTime(d: Date) {
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / 1000);
  if (diff < 10) return 'agora';
  if (diff < 60) return `há ${diff}s`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}
