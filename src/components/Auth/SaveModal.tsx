'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveModal({ isOpen, onClose }: SaveModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Conta criada para ${email}! O seu CV foi guardado.`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '400px', padding: '40px', position: 'relative' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--muted-foreground)' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ background: 'var(--accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={24} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Guardar Progresso</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Crie uma conta em segundos para não perder o seu CV profissional.</p>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    style={{ paddingLeft: '40px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Palavra-passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: '40px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Criar Conta e Guardar <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
