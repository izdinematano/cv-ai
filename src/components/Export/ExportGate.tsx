'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Lock,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import type { CVData } from '@/store/useCVStore';
import { useAppStore } from '@/store/useAppStore';
import { exportPreviewToPdf } from '@/lib/exportPreviewToPdf';

interface ExportGateProps {
  isOpen: boolean;
  onClose: () => void;
  data: CVData;
  lang: 'pt' | 'en';
  fileName: string;
  /** If provided, the current CV will be auto-saved under this user id before export. */
  userId?: string | null;
  /** Optional CV id if the user is editing an existing saved CV. */
  currentCvId?: string | null;
}

export default function ExportGate({
  isOpen,
  onClose,
  data,
  lang,
  fileName,
  userId,
  currentCvId,
}: ExportGateProps) {
  const router = useRouter();
  const {
    canExport,
    totalAvailableExports,
    remainingFreeExports,
    extraCredits,
    adminSettings,
    recordExport,
    users,
    payments,
    upsertCV,
    syncFromServer,
  } = useAppStore();

  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  if (!isOpen) return null;

  const user = userId ? users.find((u) => u.id === userId) : null;
  const allowExport = user ? canExport(user.id) : false;
  const existingPending = user
    ? payments.find((p) => p.userId === user.id && p.status === 'pending')
    : null;

  const freeLeft = user ? remainingFreeExports(user.id) : 0;
  const credits = user ? extraCredits[user.id] || 0 : 0;
  const total = user ? totalAvailableExports(user.id) : 0;

  const handleDownloadClick = (cvName: string) => {
    if (!user) return;
    recordExport({ userId: user.id, cvId: currentCvId || 'temp', cvName });
    // Save/update current CV in the user's library so it appears on the dashboard.
    upsertCV(user.id, { id: currentCvId || undefined, name: cvName, data });
  };

  const handleMpesaPayment = async () => {
    if (!user || !mpesaPhone.trim()) return;
    setPaymentStatus('processing');
    setPaymentMessage('');
    try {
      const res = await fetch('/api/mpesa/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          phoneNumber: mpesaPhone.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPaymentStatus('success');
        setPaymentMessage(json.message || `${adminSettings.creditsPerPack} créditos adicionados!`);
        // Pull updated credits from server so the export gate reflects the new balance.
        syncFromServer();
      } else {
        setPaymentStatus('error');
        setPaymentMessage(json.error || 'Pagamento falhou. Tenta novamente.');
      }
    } catch {
      setPaymentStatus('error');
      setPaymentMessage('Erro de ligação. Verifica a tua internet e tenta novamente.');
    }
  };

  const cvName =
    (data.personalInfo.fullName || '').trim() || `CV ${new Date().toLocaleDateString('pt-PT')}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 28,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8' }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {!user ? (
          <NotLoggedIn onLogin={() => router.push('/login')} onRegister={() => router.push('/register')} />
        ) : allowExport ? (
          <ReadyToDownload
            total={total}
            freeLeft={freeLeft}
            credits={credits}
            fileName={fileName}
            cvName={cvName}
            data={data}
            lang={lang}
            onDownload={() => handleDownloadClick(cvName)}
          />
        ) : paymentStatus === 'success' ? (
          <MpesaSuccess message={paymentMessage} onClose={onClose} />
        ) : (
          <MpesaPaymentFlow
            price={adminSettings.pricePerPackMZN}
            credits={adminSettings.creditsPerPack}
            phone={mpesaPhone}
            setPhone={setMpesaPhone}
            status={paymentStatus}
            errorMessage={paymentMessage}
            onPay={handleMpesaPayment}
          />
        )}
      </div>
    </div>
  );
}

function NotLoggedIn({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Precisas de uma conta</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
          Cria uma conta gratuita para guardares os teus CVs, exportares até 5 PDFs por mês e
          acederes ao teu dashboard.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={onRegister}>
          Criar conta
        </button>
        <button className="btn-outline" style={{ flex: 1 }} onClick={onLogin}>
          Entrar
        </button>
      </div>
    </>
  );
}

function ReadyToDownload({
  total,
  freeLeft,
  credits,
  fileName,
  cvName,
  data,
  lang,
  onDownload,
}: {
  total: number;
  freeLeft: number;
  credits: number;
  fileName: string;
  cvName: string;
  data: CVData;
  lang: 'pt' | 'en';
  onDownload: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      // We snapshot the live preview DOM (see CV_EXPORT_TARGET_ID in
      // exportPreviewToPdf.ts) so the PDF always matches the exact template
      // and styling the user sees on screen.
      await exportPreviewToPdf({ fileName });
      onDownload();
      setStatus('idle');
    } catch (err) {
      console.error('[PDF export] failed', err);
      setErrorMsg((err as Error)?.message || 'Falha ao gerar o PDF.');
      setStatus('error');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(16,185,129,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={20} color="#10b981" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Pronto para exportar</h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            {total} {total === 1 ? 'exportação disponível' : 'exportações disponíveis'} · {freeLeft} grátis · {credits} créditos pagos
          </div>
        </div>
      </div>
      <div
        style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 10,
          padding: 12,
          fontSize: 12,
          color: '#cbd5e1',
          lineHeight: 1.55,
        }}
      >
        Ao descarregar, este CV será guardado como <b>{cvName}</b> no teu dashboard e consumirá <b>1 exportação</b>.
      </div>

      {status === 'error' && errorMsg && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            color: '#fecaca',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <b>Não foi possível gerar o PDF.</b>
            <div style={{ marginTop: 4, opacity: 0.85 }}>{errorMsg}</div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn-primary"
        onClick={handleDownload}
        disabled={status === 'loading'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: status === 'loading' ? 'wait' : 'pointer',
        }}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" /> A gerar PDF...
          </>
        ) : status === 'error' ? (
          <>
            <Download size={16} /> Tentar novamente
          </>
        ) : (
          <>
            <Download size={16} /> Descarregar PDF
          </>
        )}
      </button>
    </>
  );
}

function MpesaPaymentFlow({
  price,
  credits,
  phone,
  setPhone,
  status,
  errorMessage,
  onPay,
}: {
  price: number;
  credits: number;
  phone: string;
  setPhone: (v: string) => void;
  status: 'idle' | 'processing' | 'error';
  errorMessage: string;
  onPay: () => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(245,158,11,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={20} color="#f59e0b" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Quota mensal esgotada</h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Paga via M-Pesa para desbloquear mais exportações.
          </div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 14,
          padding: 18,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.1))',
          border: '1px solid rgba(59,130,246,0.3)',
        }}
      >
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', fontWeight: 800 }}>
          Pack de créditos
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>
          {price} <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>MZN</span>
        </div>
        <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
          {credits} exportações adicionais (não expiram)
        </div>
      </div>

      <div
        style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 10,
          padding: 14,
          fontSize: 12.5,
          color: '#cbd5e1',
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Phone size={14} color="#93c5fd" />
          <b style={{ color: '#93c5fd' }}>Como funciona</b>
        </div>
        Insere o teu número M-Pesa abaixo. Receberás um <b>pedido USSD no telemóvel</b> para
        confirmar o pagamento com o teu PIN. Os créditos são adicionados <b>automaticamente</b>.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="form-group">
          <label>Número M-Pesa</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="84 000 0000"
            disabled={status === 'processing'}
            style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.05em' }}
          />
        </div>

        {status === 'error' && errorMessage && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: '#fecaca',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={onPay}
          disabled={!phone.trim() || status === 'processing'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: status === 'processing' ? 'wait' : 'pointer',
          }}
        >
          {status === 'processing' ? (
            <>
              <Loader2 size={16} className="animate-spin" /> A aguardar confirmação...
            </>
          ) : (
            <>
              <CreditCard size={16} /> Pagar {price} MZN via M-Pesa
            </>
          )}
        </button>
      </div>
    </>
  );
}

function MpesaSuccess({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(16,185,129,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={20} color="#10b981" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Pagamento confirmado!</h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Os créditos foram adicionados à tua conta.
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
        {message}
      </p>
      <button className="btn-primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <CheckCircle2 size={16} /> Continuar
      </button>
    </>
  );
}
