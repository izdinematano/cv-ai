'use client';

import { History, RotateCcw, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCVStore } from '@/store/useCVStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VersionHistoryModal({ open, onClose }: Props) {
  const { currentUserId, getUserCVs, restoreCVVersion } = useAppStore();
  const currentCvId = useCVStore((s) => s.currentCvId);
  const setData = useCVStore((s) => s.setData);

  if (!open) return null;

  const cv =
    currentUserId && currentCvId
      ? getUserCVs(currentUserId).find((c) => c.id === currentCvId)
      : undefined;
  const versions = cv?.versions || [];

  const handleRestore = (versionId: string) => {
    if (!currentUserId || !currentCvId) return;
    if (!confirm('Restaurar esta versão? O estado atual será guardado no histórico.')) return;
    const next = restoreCVVersion(currentUserId, currentCvId, versionId);
    if (next) setData(next.data);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-history-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 24,
          borderRadius: 20,
          background: 'var(--background)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={18} aria-hidden="true" color="var(--accent)" />
            <h2 id="version-history-title" style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              Histórico de versões
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar histórico"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--foreground-muted)',
              cursor: 'pointer',
              padding: 6,
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--foreground-muted)', marginBottom: 18 }}>
          Guardamos automaticamente as últimas {versions.length > 0 ? versions.length : 5} versões deste CV.
          Clica para restaurar qualquer uma — o estado actual é mantido no histórico.
        </p>

        {!cv ? (
          <p style={{ fontSize: 13 }}>Guarda este CV no dashboard para começares a ter histórico.</p>
        ) : versions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--foreground-muted)' }}>
            Ainda não há versões anteriores. Continua a editar — as alterações significativas serão
            registadas automaticamente.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {versions.map((v, index) => {
              const date = new Date(v.createdAt);
              return (
                <li
                  key={v.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--background-muted)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      Versão {versions.length - index}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--foreground-muted)' }}>
                      {date.toLocaleString('pt-PT')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(v.id)}
                    aria-label={`Restaurar versão de ${date.toLocaleString('pt-PT')}`}
                    className="btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                    }}
                  >
                    <RotateCcw size={13} aria-hidden="true" /> Restaurar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
