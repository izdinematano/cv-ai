'use client';

/**
 * Compact inline feedback strip rendered underneath a text field.
 * Shows word count + up to 3 issues so the user gets immediate signal
 * without feeling nagged.
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { WritingReport } from '@/lib/writingQuality';

interface Props {
  report: WritingReport;
  /** When true, render inline on a single row with small dots instead of
   *  stacking issues vertically. Used inside the bullet editor. */
  compact?: boolean;
}

export default function WritingHints({ report, compact }: Props) {
  if (report.words === 0) return null;
  const ok = report.issues.length === 0;

  const badge = (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: ok ? 'var(--success)' : 'var(--foreground-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
    >
      {ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
      {report.words}p · {report.characters}c
    </span>
  );

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          paddingLeft: 12,
          fontSize: 10,
          color: 'var(--foreground-muted)',
        }}
      >
        {badge}
        {report.issues.slice(0, 2).map((issue, i) => (
          <span
            key={i}
            title={issue.message}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color:
                issue.severity === 'critical'
                  ? 'var(--error)'
                  : 'var(--warning, #d97706)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background:
                  issue.severity === 'critical'
                    ? 'var(--error)'
                    : 'var(--warning, #d97706)',
              }}
            />
            {issue.message}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 4,
        padding: '6px 8px',
        borderRadius: 8,
        background: ok ? 'rgba(5,150,105,0.08)' : 'rgba(217,119,6,0.08)',
        border: `1px solid ${ok ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}`,
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
        {badge}
        <span style={{ color: ok ? 'var(--success)' : 'var(--warning, #d97706)' }}>
          {ok ? 'Texto forte' : `${report.issues.length} sugestão(ões)`}
        </span>
      </div>
      {!ok && (
        <ul style={{ margin: '4px 0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {report.issues.slice(0, 3).map((issue, i) => (
            <li key={i} style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
