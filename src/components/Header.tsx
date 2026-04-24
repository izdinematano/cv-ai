'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, LayoutDashboard, Loader2, LogIn, Menu, Sparkles, Target, X } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import ExportGate from '@/components/Export/ExportGate';
import JobTailorModal from '@/components/JobTailor/JobTailorModal';
import { translateCVField } from '@/lib/openrouter';
import { useAppStore } from '@/store/useAppStore';
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
  const [isJobTailorOpen, setIsJobTailorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const { currentUserId, users } = useAppStore();
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : null;

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
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 'fit-content' }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px var(--accent-glow)',
              }}
            >
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>CV-Gen AI</div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted-foreground)' }}>
                Editor bilingue com IA
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop action cluster */}
        <div className="app-header-actions app-header-desktop">
          <LanguageToggle />

          <button
            onClick={() => setIsJobTailorOpen(true)}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Cola uma descrição de vaga e adapta o CV"
          >
            <Target size={16} /> Adaptar à vaga
          </button>

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

          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LayoutDashboard size={16} />
              {currentUser.fullName.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogIn size={16} /> Entrar
            </Link>
          )}

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>

        {/* Mobile compact cluster: PDF + hamburger */}
        <div className="app-header-mobile" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '13px' }}
          >
            <Download size={14} /> PDF
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="btn-outline"
            style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="app-header-drawer-backdrop" onClick={closeMobileMenu}>
          <aside className="app-header-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="app-header-drawer-head">
              <div style={{ fontWeight: 800 }}>Menu</div>
              <button
                className="btn-outline"
                onClick={closeMobileMenu}
                style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>
            <div className="app-header-drawer-body">
              <LanguageToggle />
              <button
                onClick={() => {
                  closeMobileMenu();
                  setIsJobTailorOpen(true);
                }}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}
              >
                <Target size={16} /> Adaptar à vaga
              </button>
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleTranslateAll();
                }}
                className="btn-outline"
                disabled={isTranslatingAll}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}
              >
                {isTranslatingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isTranslatingAll ? 'A traduzir...' : 'Traduzir com IA'}
              </button>
              {currentUser ? (
                <Link
                  href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}
                  onClick={closeMobileMenu}
                >
                  <LayoutDashboard size={16} /> {currentUser.fullName.split(' ')[0]}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}
                  onClick={closeMobileMenu}
                >
                  <LogIn size={16} /> Entrar
                </Link>
              )}
              <button
                onClick={() => {
                  closeMobileMenu();
                  setIsSaveModalOpen(true);
                }}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}
              >
                <Download size={16} /> Exportar PDF
              </button>
            </div>
          </aside>
        </div>
      )}

      <ExportGate
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        data={data}
        lang={activeLanguage}
        fileName={fileName}
        userId={currentUserId}
        currentCvId={useCVStore.getState().currentCvId}
      />

      <JobTailorModal
        isOpen={isJobTailorOpen}
        onClose={() => setIsJobTailorOpen(false)}
      />
    </>
  );
}
