'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, Sparkles } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import SaveModal from '@/components/Auth/SaveModal';
import { CVDocument } from '@/components/Export/PDFDocument';
import { translateCVField } from '@/lib/openrouter';
import { useCVStore } from '@/store/useCVStore';

export default function Header() {
  const {
    data,
    activeLanguage,
    setLanguage,
    setConverting,
    updateSummary,
    updatePersonalInfo,
    updateExperience,
    updateEducation,
    updateProject,
    setData,
  } = useCVStore();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const fileName = `cv-${(data.personalInfo.fullName || 'sem-nome').trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;

  const handleTranslateAll = async () => {
    const targetLang = activeLanguage === 'pt' ? 'en' : 'pt';
    setIsTranslatingAll(true);
    setConverting(true);

    try {
      if (data.summary[activeLanguage] && !data.summary[targetLang]) {
        const translated = await translateCVField(
          data.summary[activeLanguage],
          activeLanguage,
          targetLang
        );
        updateSummary({ [targetLang]: translated });
      }

      if (
        data.personalInfo.jobTitle[activeLanguage] &&
        !data.personalInfo.jobTitle[targetLang]
      ) {
        const translated = await translateCVField(
          data.personalInfo.jobTitle[activeLanguage],
          activeLanguage,
          targetLang
        );

        updatePersonalInfo({
          jobTitle: {
            ...data.personalInfo.jobTitle,
            [targetLang]: translated,
          },
        });
      }

      for (const exp of data.experience) {
        if (exp.position[activeLanguage] && !exp.position[targetLang]) {
          const position = await translateCVField(
            exp.position[activeLanguage],
            activeLanguage,
            targetLang
          );
          updateExperience(exp.id, {
            position: { ...exp.position, [targetLang]: position },
          });
        }

        if (exp.description[activeLanguage] && !exp.description[targetLang]) {
          const description = await translateCVField(
            exp.description[activeLanguage],
            activeLanguage,
            targetLang
          );
          updateExperience(exp.id, {
            description: { ...exp.description, [targetLang]: description },
          });
        }
      }

      for (const edu of data.education) {
        if (edu.degree[activeLanguage] && !edu.degree[targetLang]) {
          const translated = await translateCVField(
            edu.degree[activeLanguage],
            activeLanguage,
            targetLang
          );
          updateEducation(edu.id, {
            degree: { ...edu.degree, [targetLang]: translated },
          });
        }
      }

      for (const project of data.projects) {
        if (project.description[activeLanguage] && !project.description[targetLang]) {
          const translated = await translateCVField(
            project.description[activeLanguage],
            activeLanguage,
            targetLang
          );
          updateProject(project.id, {
            description: { ...project.description, [targetLang]: translated },
          });
        }
      }

      const translatedSkills = [...data.skills];
      let hasSkillUpdates = false;

      for (let index = 0; index < translatedSkills.length; index += 1) {
        const skill = translatedSkills[index];
        if (skill[activeLanguage] && !skill[targetLang]) {
          translatedSkills[index] = {
            ...skill,
            [targetLang]: await translateCVField(
              skill[activeLanguage],
              activeLanguage,
              targetLang
            ),
          };
          hasSkillUpdates = true;
        }
      }

      const translatedLanguages = [...data.languages];
      let hasLanguageUpdates = false;

      for (let index = 0; index < translatedLanguages.length; index += 1) {
        const language = translatedLanguages[index];
        if (language.level[activeLanguage] && !language.level[targetLang]) {
          translatedLanguages[index] = {
            ...language,
            level: {
              ...language.level,
              [targetLang]: await translateCVField(
                language.level[activeLanguage],
                activeLanguage,
                targetLang
              ),
            },
          };
          hasLanguageUpdates = true;
        }
      }

      if (hasSkillUpdates || hasLanguageUpdates) {
        setData({
          ...useCVStore.getState().data,
          skills: hasSkillUpdates ? translatedSkills : useCVStore.getState().data.skills,
          languages: hasLanguageUpdates
            ? translatedLanguages
            : useCVStore.getState().data.languages,
        });
      }

      setLanguage(targetLang);
    } finally {
      setConverting(false);
      setIsTranslatingAll(false);
    }
  };

  return (
    <>
      <header
        style={{
          height: '72px',
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(18px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 'fit-content' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}
            >
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>CV-Gen AI</div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                Editor bilingue com IA
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <LanguageToggle />

          <button
            onClick={handleTranslateAll}
            className="btn-outline"
            disabled={isTranslatingAll}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isTranslatingAll ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {isTranslatingAll ? 'A traduzir...' : 'Traduzir com IA'}
          </button>

          <button
            onClick={() => {
              // ═══════════════════════════════════════════════════════
              // TODO: PONTO DE INTEGRAÇÃO DE PAGAMENTO
              //
              // Quando o sistema de pagamentos estiver pronto,
              // verificar aqui se o utilizador já pagou antes de
              // permitir o download:
              //
              // const hasPaid = await checkPayment(userId);
              // if (!hasPaid) {
              //   openPaymentModal(); // abrir modal de pagamento
              //   return false;       // cancelar o download
              // }
              //
              // Opções de pagamento a integrar:
              //   - Stripe (cartão internacional)
              //   - Mpesa (utilizadores moçambicanos)
              //   - e-Mola (utilizadores moçambicanos)
              //
              // Preço sugerido: MZN 50 por PDF ou pack de 5 por MZN 200
              // ═══════════════════════════════════════════════════════
              setIsSaveModalOpen(true);
            }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </header>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onCreateAccount={() => {
          window.alert(
            'TODO: fluxo de autenticação. Quando a auth estiver pronta, criar conta, guardar o CV e regressar ao download.'
          );
        }}
        onContinueWithoutSave={() => {
          // TODO: quando existir auth, marcar que o utilizador optou por exportar sem guardar.
        }}
        document={<CVDocument data={data} lang={activeLanguage} />}
        fileName={fileName}
      />
    </>
  );
}
