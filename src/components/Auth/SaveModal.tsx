'use client';

import { useState, type ReactElement } from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Download, Loader2 } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  onContinueWithoutSave: () => void;
  document: ReactElement<DocumentProps>;
  fileName: string;
}

export default function SaveModal({
  isOpen,
  onClose,
  onCreateAccount,
  onContinueWithoutSave,
  document,
  fileName,
}: SaveModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '36px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                color: 'var(--muted-foreground)',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: 'var(--accent)',
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 20px var(--accent-glow)',
                }}
              >
                <Sparkles size={24} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
                Guarda o teu CV antes de exportar
              </h2>
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: '14px',
                  lineHeight: 1.7,
                }}
              >
                Cria uma conta gratuita para guardar o teu progresso e exportar o PDF.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={onCreateAccount}
                style={{
                  padding: '14px 18px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                Criar Conta <ArrowRight size={16} />
              </button>

              <DownloadButton
                document={document}
                fileName={fileName}
                onAfterDownload={() => {
                  onContinueWithoutSave();
                  onClose();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DownloadButton({
  document: doc,
  fileName,
  onAfterDownload,
}: {
  document: ReactElement<DocumentProps>;
  fileName: string;
  onAfterDownload: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onAfterDownload();
    } catch (err) {
      console.error('[PDF export] failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-outline"
      onClick={handleClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px 18px',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {loading ? 'A gerar PDF...' : 'Continuar sem guardar'}
    </button>
  );
}
