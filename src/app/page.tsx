'use client';

import Header from '@/components/Header';
import Editor from '@/components/Editor/Editor';
import Preview from '@/components/Preview/Preview';
import { useCVStore } from '@/store/useCVStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { isConverting } = useCVStore();

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Editor */}
        <aside style={{ 
          width: '45%', 
          minWidth: '450px', 
          height: '100%', 
          borderRight: '1px solid var(--card-border)',
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(20px)',
          position: 'relative'
        }}>
          <Editor />
          
          <AnimatePresence>
            {isConverting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: 'rgba(15, 23, 42, 0.8)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  zIndex: 100,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ color: 'var(--accent)', marginBottom: '16px' }}
                >
                  <Sparkles size={40} />
                </motion.div>
                <p style={{ color: 'white', fontWeight: 500, fontSize: '18px' }}>
                  A IA está a adaptar o seu CV...
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '8px' }}>
                  Isso pode levar alguns segundos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Right Side: Preview */}
        <section style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <Preview />
        </section>
      </div>
    </main>
  );
}
