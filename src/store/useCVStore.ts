'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MultilingualField {
  pt: string;
  en: string;
}

export interface Experience {
  id: string;
  company: string;
  position: MultilingualField;
  period: string;
  description: MultilingualField;
}

export interface Education {
  id: string;
  institution: string;
  degree: MultilingualField;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: MultilingualField;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export type LanguageProficiency =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper-intermediate'
  | 'advanced'
  | 'native';

export interface LanguageEntry {
  name: string;
  level: MultilingualField;
  proficiency?: LanguageProficiency;
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  company: string;
  contact: string;
  relationship: MultilingualField;
}

export interface CustomSectionItem {
  id: string;
  title: MultilingualField;
  subtitle: MultilingualField;
  period: string;
  description: MultilingualField;
}

export interface CustomSection {
  id: string;
  label: MultilingualField;
  items: CustomSectionItem[];
}

export const LANGUAGE_PROFICIENCY_LABELS: Record<
  LanguageProficiency,
  MultilingualField
> = {
  beginner: { pt: 'Iniciante (A1)', en: 'Beginner (A1)' },
  elementary: { pt: 'Elementar (A2)', en: 'Elementary (A2)' },
  intermediate: { pt: 'Intermédio (B1)', en: 'Intermediate (B1)' },
  'upper-intermediate': {
    pt: 'Intermédio alto (B2)',
    en: 'Upper-Intermediate (B2)',
  },
  advanced: { pt: 'Avançado (C1)', en: 'Advanced (C1)' },
  native: { pt: 'Nativo (C2)', en: 'Native (C2)' },
};

/** Detect a placeholder/loading value so we can auto-promote it later. */
export const isLoadingLevel = (value: string | undefined | null) => {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return (
    v === '(loading)' ||
    v === 'loading' ||
    v === '(carregando)' ||
    v === 'carregando' ||
    v === '(a carregar)' ||
    v === 'a carregar' ||
    v.startsWith('(') && v.endsWith(')')
  );
};

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    photo?: string;
    jobTitle: MultilingualField;
  };
  summary: MultilingualField;
  experience: Experience[];
  education: Education[];
  skills: MultilingualField[];
  languages: LanguageEntry[];
  projects: Project[];
  certifications: Certification[];
  references: Reference[];
  customSections: CustomSection[];
  settings: {
    template: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    sectionSpacing: number;
  };
}

interface CVState {
  data: CVData;
  activeLanguage: 'pt' | 'en';
  isConverting: boolean;
  hasChosenTemplate: boolean;
  /** Id of the SavedCV currently being edited (null when editing a fresh draft) */
  currentCvId: string | null;
  setCurrentCvId: (id: string | null) => void;
  setLanguage: (lang: 'pt' | 'en') => void;
  setTemplate: (template: string) => void;
  completeTemplateSelection: () => void;
  resetTemplateSelection: () => void;
  setAccentColor: (color: string) => void;
  updateSettings: (settings: Partial<CVData['settings']>) => void;
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => void;
  updateSummary: (summary: Partial<MultilingualField>) => void;
  addExperience: () => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  addReference: () => void;
  updateReference: (id: string, ref: Partial<Reference>) => void;
  removeReference: (id: string) => void;
  addCustomSection: () => void;
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (
    sectionId: string,
    itemId: string,
    item: Partial<CustomSectionItem>
  ) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  addSkill: (skill: string, lang: 'pt' | 'en') => void;
  removeSkill: (index: number) => void;
  addLanguage: () => void;
  updateLanguage: (index: number, lang: Partial<LanguageEntry>) => void;
  removeLanguage: (index: number) => void;
  setConverting: (val: boolean) => void;
  setData: (data: CVData) => void;
}

const createId = () => Math.random().toString(36).slice(2, 11);

const initialData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    jobTitle: { pt: '', en: '' },
  },
  summary: { pt: '', en: '' },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  references: [],
  customSections: [],
  settings: {
    template: 'minimalist',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 1.5,
    sectionSpacing: 25,
  },
};

const ensureDataShape = (value?: Partial<CVData>): CVData => ({
  personalInfo: {
    ...initialData.personalInfo,
    ...(value?.personalInfo || {}),
    jobTitle: {
      ...initialData.personalInfo.jobTitle,
      ...(value?.personalInfo?.jobTitle || {}),
    },
  },
  summary: {
    ...initialData.summary,
    ...(value?.summary || {}),
  },
  experience: value?.experience || [],
  education: value?.education || [],
  skills: value?.skills || [],
  languages: value?.languages || [],
  projects: value?.projects || [],
  certifications: value?.certifications || [],
  references: value?.references || [],
  customSections: value?.customSections || [],
  settings: {
    ...initialData.settings,
    ...(value?.settings || {}),
  },
});

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      data: initialData,
      activeLanguage: 'pt',
      isConverting: false,
      hasChosenTemplate: false,
      currentCvId: null,
      setCurrentCvId: (id) => set({ currentCvId: id }),

      setLanguage: (lang) => set({ activeLanguage: lang }),

      setTemplate: (template) =>
        set((state) => ({
          data: {
            ...state.data,
            settings: { ...state.data.settings, template },
          },
        })),

      completeTemplateSelection: () => set({ hasChosenTemplate: true }),
      resetTemplateSelection: () => set({ hasChosenTemplate: false }),

      setAccentColor: (color) =>
        set((state) => ({
          data: {
            ...state.data,
            settings: { ...state.data.settings, accentColor: color },
          },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          data: {
            ...state.data,
            settings: { ...state.data.settings, ...settings },
          },
        })),

      updatePersonalInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
          },
        })),

      updateSummary: (summary) =>
        set((state) => ({
          data: {
            ...state.data,
            summary: { ...state.data.summary, ...summary },
          },
        })),

      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: createId(),
                company: '',
                position: { pt: '', en: '' },
                period: '',
                description: { pt: '', en: '' },
              },
            ],
          },
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((item) =>
              item.id === id ? { ...item, ...exp } : item
            ),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((item) => item.id !== id),
          },
        })),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: createId(),
                institution: '',
                degree: { pt: '', en: '' },
                year: '',
              },
            ],
          },
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((item) =>
              item.id === id ? { ...item, ...edu } : item
            ),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((item) => item.id !== id),
          },
        })),

      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              {
                id: createId(),
                name: '',
                link: '',
                description: { pt: '', en: '' },
              },
            ],
          },
        })),

      updateProject: (id, proj) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((item) =>
              item.id === id ? { ...item, ...proj } : item
            ),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((item) => item.id !== id),
          },
        })),

      addCertification: () =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: [
              ...state.data.certifications,
              {
                id: createId(),
                name: '',
                issuer: '',
                year: '',
              },
            ],
          },
        })),

      updateCertification: (id, cert) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.map((item) =>
              item.id === id ? { ...item, ...cert } : item
            ),
          },
        })),

      removeCertification: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.filter((item) => item.id !== id),
          },
        })),

      addSkill: (skill, lang) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [
              ...state.data.skills,
              lang === 'pt' ? { pt: skill, en: '' } : { pt: '', en: skill },
            ],
          },
        })),

      removeSkill: (index) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((_, itemIndex) => itemIndex !== index),
          },
        })),

      addLanguage: () =>
        set((state) => ({
          data: {
            ...state.data,
            languages: [
              ...state.data.languages,
              {
                name: '',
                level: LANGUAGE_PROFICIENCY_LABELS.intermediate,
                proficiency: 'intermediate',
              },
            ],
          },
        })),

      updateLanguage: (index, lang) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...lang } : item
            ),
          },
        })),

      removeLanguage: (index) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.filter((_, itemIndex) => itemIndex !== index),
          },
        })),

      addReference: () =>
        set((state) => ({
          data: {
            ...state.data,
            references: [
              ...state.data.references,
              {
                id: createId(),
                name: '',
                role: '',
                company: '',
                contact: '',
                relationship: { pt: '', en: '' },
              },
            ],
          },
        })),

      updateReference: (id, ref) =>
        set((state) => ({
          data: {
            ...state.data,
            references: state.data.references.map((item) =>
              item.id === id ? { ...item, ...ref } : item
            ),
          },
        })),

      removeReference: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            references: state.data.references.filter((item) => item.id !== id),
          },
        })),

      addCustomSection: () =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: [
              ...state.data.customSections,
              {
                id: createId(),
                label: { pt: 'Nova secção', en: 'New section' },
                items: [],
              },
            ],
          },
        })),

      updateCustomSection: (id, section) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((item) =>
              item.id === id ? { ...item, ...section } : item
            ),
          },
        })),

      removeCustomSection: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.filter(
              (item) => item.id !== id
            ),
          },
        })),

      addCustomSectionItem: (sectionId) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: [
                      ...section.items,
                      {
                        id: createId(),
                        title: { pt: '', en: '' },
                        subtitle: { pt: '', en: '' },
                        period: '',
                        description: { pt: '', en: '' },
                      },
                    ],
                  }
                : section
            ),
          },
        })),

      updateCustomSectionItem: (sectionId, itemId, item) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.map((current) =>
                      current.id === itemId ? { ...current, ...item } : current
                    ),
                  }
                : section
            ),
          },
        })),

      removeCustomSectionItem: (sectionId, itemId) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.filter((item) => item.id !== itemId),
                  }
                : section
            ),
          },
        })),

      setConverting: (val) => set({ isConverting: val }),
      setData: (data) => set({ data }),
    }),
    {
      name: 'cv-storage-pro',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CVState> | undefined;
        const mergedData = ensureDataShape(persisted?.data);

        return {
          ...currentState,
          ...persisted,
          data: mergedData,
          hasChosenTemplate: persisted?.hasChosenTemplate ?? currentState.hasChosenTemplate,
        };
      },
    }
  )
);
