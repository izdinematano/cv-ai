'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import Header from '@/components/Header';
import Editor from '@/components/Editor/Editor';
import Preview from '@/components/Preview/Preview';
import { useCVStore } from '@/store/useCVStore';

export default function EditorPage() {
  const { isConverting } = useCVStore();
  const [zoom, setZoom] = useState(0.8);

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <aside
          style={{
            width: '45%',
            minWidth: '450px',
            height: '100%',
            borderRight: '1px solid var(--card-border)',
            background: 'rgba(15, 23, 42, 0.32)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
          }}
        >
          <Editor />

          <AnimatePresence>
            {isConverting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.82)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 50,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ color: 'var(--accent)', marginBottom: '16px' }}
                >
                  <Sparkles size={40} />
                </motion.div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>
                  A IA esta a adaptar o seu CV...
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '8px' }}>
                  Isso pode levar alguns segundos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <section
          style={{
            flex: 1,
            height: '100%',
            overflow: 'auto',
            background: '#14161b',
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              display: 'flex',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setZoom((current) => Math.max(0.5, current - 0.1))}
              className="glass-card"
              style={{
                padding: '10px',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomOut size={18} />
            </button>
            <div
              className="glass-card"
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom((current) => Math.min(1.5, current + 0.1))}
              className="glass-card"
              style={{
                padding: '10px',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <motion.div
            animate={{ scale: zoom }}
            style={{
              width: '210mm',
              minHeight: '297mm',
              background: 'white',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              transformOrigin: 'top center',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <Preview />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
