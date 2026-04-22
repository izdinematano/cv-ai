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

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    jobTitle: MultilingualField;
  };
  summary: MultilingualField;
  experience: Experience[];
  education: Education[];
  skills: MultilingualField[];
  languages: { name: string; level: MultilingualField }[];
  settings: {
    template: 'minimalist' | 'corporate' | 'creative' | 'executive';
    accentColor: string;
    fontFamily: string;
  };
}

interface CVState {
  data: CVData;
  activeLanguage: 'pt' | 'en';
  isConverting: boolean;
  
  // Actions
  setLanguage: (lang: 'pt' | 'en') => void;
  setTemplate: (template: CVData['settings']['template']) => void;
  setAccentColor: (color: string) => void;
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => void;
  updateSummary: (summary: Partial<MultilingualField>) => void;
  addExperience: () => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: string) => void;
  updateSkill: (index: number, skill: string) => void;
  removeSkill: (index: number) => void;
  setConverting: (val: boolean) => void;
  setData: (data: CVData) => void;
}

const initialData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    jobTitle: { pt: '', en: '' },
  },
  summary: { pt: '', en: '' },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  settings: {
    template: 'minimalist',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
  },
};

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      data: initialData,
      activeLanguage: 'pt',
      isConverting: false,

      setLanguage: (lang) => set({ activeLanguage: lang }),
      
      setTemplate: (template) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, template } }
        })),

      setAccentColor: (color) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, accentColor: color } }
        })),

      updatePersonalInfo: (info) => 
        set((state) => ({ 
          data: { ...state.data, personalInfo: { ...state.data.personalInfo, ...info } } 
        })),

      updateSummary: (summary) =>
        set((state) => ({
          data: { ...state.data, summary: { ...state.data.summary, ...summary } }
        })),

      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: crypto.randomUUID(),
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
            experience: state.data.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((e) => e.id !== id),
          },
        })),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: crypto.randomUUID(),
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
            education: state.data.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((e) => e.id !== id),
          },
        })),

      addSkill: (skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [...state.data.skills, { pt: skill, en: '' }],
          },
        })),

      updateSkill: (index, skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((s, i) => (i === index ? { ...s, pt: skill } : s)),
          },
        })),

      removeSkill: (index) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((_, i) => i !== index),
          },
        })),

      setConverting: (val) => set({ isConverting: val }),
      setData: (data) => set({ data }),
    }),
    {
      name: 'cv-storage',
      // Merge partial state to prevent crashes with old data
      merge: (persistedState: any, currentState) => {
        const mergedData = { ...currentState.data, ...(persistedState?.data || {}) };
        
        // Ensure settings always exist
        if (!mergedData.settings) {
          mergedData.settings = initialData.settings;
        }
        
        return {
          ...currentState,
          ...persistedState,
          data: mergedData
        };
      }
    }
  )
);
