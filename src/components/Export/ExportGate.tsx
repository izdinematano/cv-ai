'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Lock,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import type { CVData } from '@/store/useCVStore';
import { useAppStore } from '@/store/useAppStore';
import { CVDocument } from './PDFDocument';

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
    requestPayment,
    users,
    payments,
    upsertCV,
  } = useAppStore();

  const [mpesaRef, setMpesaRef] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [note, setNote] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  const handleSubmitPayment = () => {
    if (!user) return;
    requestPayment({
      userId: user.id,
      userEmail: user.email,
      mpesaReference: mpesaRef.trim(),
      whatsappNumber: whatsappNumber.trim(),
      note: note.trim(),
    });
    setRequestSuccess(true);
  };

  const whatsappHref = (() => {
    const phone = adminSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const body = encodeURIComponent(
      `Olá, enviei ${adminSettings.pricePerPackMZN} MZN via Mpesa (${adminSettings.mpesaNumber}) para ativar ${adminSettings.creditsPerPack} créditos do CV Gen AI.\n\nReferência Mpesa: ${mpesaRef || '(colar ref)'}\nEmail da conta: ${user?.email || ''}\n`
    );
    return `https://wa.me/${phone}?text=${body}`;
  })();

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
        ) : requestSuccess ? (
          <PaymentRequested onClose={onClose} whatsappHref={whatsappHref} />
        ) : (
          <PaymentFlow
            price={adminSettings.pricePerPackMZN}
            credits={adminSettings.creditsPerPack}
            mpesaNumber={adminSettings.mpesaNumber}
            whatsappNumber={adminSettings.whatsappNumber}
            existingPending={!!existingPending}
            showForm={showPaymentForm}
            onShowForm={() => setShowPaymentForm(true)}
            mpesaRef={mpesaRef}
            setMpesaRef={setMpesaRef}
            whatsapp={whatsappNumber}
            setWhatsapp={setWhatsappNumber}
            note={note}
            setNote={setNote}
            onSubmit={handleSubmitPayment}
            whatsappHref={whatsappHref}
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
      // Build + blob the PDF imperatively so we can reliably trigger the
      // download with a programmatic anchor click. This avoids the anchor /
      // nested-button issue with <PDFDownloadLink>.
      const blob = await pdf(<CVDocument data={data} lang={lang} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up the object URL after a short delay so the browser has time
      // to pick it up before we revoke it.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // Only record the export after the PDF is actually generated.
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

function PaymentFlow({
  price,
  credits,
  mpesaNumber,
  whatsappNumber,
  existingPending,
  showForm,
  onShowForm,
  mpesaRef,
  setMpesaRef,
  whatsapp,
  setWhatsapp,
  note,
  setNote,
  onSubmit,
  whatsappHref,
}: {
  price: number;
  credits: number;
  mpesaNumber: string;
  whatsappNumber: string;
  existingPending: boolean;
  showForm: boolean;
  onShowForm: () => void;
  mpesaRef: string;
  setMpesaRef: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  onSubmit: () => void;
  whatsappHref: string;
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
            Adiciona créditos para continuar a exportar PDFs este mês.
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, lineHeight: 1.55 }}>
        <Step n={1} title="Envia via Mpesa">
          Envia <b>{price} MZN</b> para <b style={{ fontFamily: 'monospace', fontSize: 14 }}>{mpesaNumber}</b>.
        </Step>
        <Step n={2} title="Envia o comprovativo pelo WhatsApp">
          Envia o comprovativo para <b>{whatsappNumber}</b> juntamente com o teu email.
          <div style={{ marginTop: 8 }}>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px' }}
            >
              <MessageCircle size={14} /> Abrir WhatsApp
            </a>
          </div>
        </Step>
        <Step n={3} title="Regista o pagamento aqui">
          Depois de pagar, carrega em <b>Registar pagamento</b> para avisar o admin. Os créditos
          serão adicionados após confirmação.
        </Step>
      </div>

      {existingPending && (
        <div
          style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            color: '#fde68a',
          }}
        >
          Já tens um pagamento pendente. O admin será notificado assim que validar.
        </div>
      )}

      {showForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="form-group">
            <label>Referência Mpesa</label>
            <input
              value={mpesaRef}
              onChange={(e) => setMpesaRef(e.target.value)}
              placeholder="Ex: CF1234XYZ"
            />
          </div>
          <div className="form-group">
            <label>O teu número de WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+258 84 000 0000"
            />
          </div>
          <div className="form-group">
            <label>Nota (opcional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: paguei ao meio-dia"
            />
          </div>
          <button
            className="btn-primary"
            onClick={onSubmit}
            disabled={!mpesaRef.trim() || !whatsapp.trim()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Send size={14} /> Registar pagamento
          </button>
        </div>
      ) : (
        <button
          className="btn-primary"
          onClick={onShowForm}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <CreditCard size={16} /> Já paguei — registar
        </button>
      )}
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.25)',
          color: '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{children}</div>
      </div>
    </div>
  );
}

function PaymentRequested({ onClose, whatsappHref }: { onClose: () => void; whatsappHref: string }) {
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
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Pedido registado</h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Confirma com o admin para ativar os créditos.
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
        Se ainda não enviaste o comprovativo pelo WhatsApp, envia agora. O admin aprovará o
        pagamento no painel dele e os créditos serão adicionados automaticamente.
      </p>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <MessageCircle size={16} /> Enviar comprovativo no WhatsApp
      </a>
      <button className="btn-outline" onClick={onClose}>
        Fechar
      </button>
    </>
  );
}
